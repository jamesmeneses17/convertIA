#!/usr/bin/env node
/**
 * ============================================================================
 *  ConvertIA :: vigilante del buzon
 * ----------------------------------------------------------------------------
 *  Mira el buzon de ConvertIA cada pocos segundos. Vigilar NO cuesta nada:
 *  es una peticion HTTP a tu propio ordenador. Solo cuando encuentra un
 *  encargo pendiente despierta a Claude Code, que genera la landing y la
 *  entrega por el conector MCP.
 *
 *  Arrancarlo:   node vigilante/vigilante.mjs
 *  O con doble clic en:  vigilante/iniciar-vigilante.cmd
 * ============================================================================
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const URL_BASE = (process.env.CONVERTIA_URL ?? 'http://localhost:3300').replace(/\/+$/, '');
const INTERVALO_MS = Number(process.env.VIGILANTE_INTERVALO ?? 10_000);
const CONFIG_MCP = path.join(AQUI, 'mcp-convertia.json');

const INSTRUCCION =
  'Atiende el encargo pendiente de ConvertIA. Llama primero a obtener_encargo: te dira si pide una ' +
  'LANDING o un PROMPT MAESTRO. Si pide landing, entregala con entregar_landing; si pide prompt, ' +
  'entregalo con entregar_prompt. IMPORTANTE: no escribas el resultado en tu respuesta, va dentro ' +
  'de la herramienta. Responde solo con una linea de resumen.';

/**
 * Localiza el CLI de Claude.
 *
 * En Windows el paquete instala un ejecutable nativo (claude.exe). Hay que
 * lanzar ESE y no el claude.cmd: desde el parche de seguridad de Node, lanzar
 * un .cmd sin `shell: true` falla con EINVAL, y con shell:true los argumentos
 * largos no se escapan bien. Un .exe se lanza directo y sin sorpresas.
 */
function localizarCli() {
  if (process.platform !== 'win32') return { comando: 'claude', shell: false };

  const appdata = process.env.APPDATA ?? '';
  const exe = path.join(appdata, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'bin', 'claude.exe');
  if (existsSync(exe)) return { comando: exe, shell: false };

  const cmd = path.join(appdata, 'npm', 'claude.cmd');
  if (existsSync(cmd)) return { comando: cmd, shell: true };

  return { comando: 'claude', shell: true };
}

const { comando: CLI, shell: USAR_SHELL } = localizarCli();

/** Solo estas herramientas quedan autorizadas: nada de permisos abiertos. */
const HERRAMIENTAS = [
  'mcp__convertia__listar_encargos',
  'mcp__convertia__obtener_encargo',
  'mcp__convertia__entregar_landing',
  'mcp__convertia__entregar_prompt',
  'mcp__convertia__estado_convertia',
];

let generando = false;
let ultimoAviso = '';

/**
 * Cuantas veces hemos intentado cada encargo. Si Claude termina pero no llega a
 * entregarlo, el encargo sigue pendiente: sin este limite lo reintentariamos sin
 * parar y cada intento cuesta cuota.
 */
const intentos = new Map();
const MAX_INTENTOS = 2;

function hora() {
  return new Date().toLocaleTimeString('es-CO', { hour12: false });
}

function log(mensaje) {
  console.log(`[${hora()}] ${mensaje}`);
}

/** Avisa una sola vez de un problema repetido, para no llenar la pantalla. */
function avisarUnaVez(clave, mensaje) {
  if (ultimoAviso === clave) return;
  ultimoAviso = clave;
  log(mensaje);
}

async function buscarEncargo() {
  try {
    const respuesta = await fetch(`${URL_BASE}/api/bridge/handoffs?status=pendiente&take=1`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!respuesta.ok) {
      avisarUnaVez('http', `ConvertIA respondio ${respuesta.status}. Sigo esperando...`);
      return null;
    }
    ultimoAviso = '';
    const datos = await respuesta.json();
    return datos.handoffs?.[0] ?? null;
  } catch {
    avisarUnaVez(
      'red',
      `No veo ConvertIA en ${URL_BASE}. Levantalo con "docker compose up -d". Sigo mirando...`,
    );
    return null;
  }
}

/** Despierta a Claude Code para que cumpla el encargo. */
function generarLanding(encargo, intento) {
  return new Promise((listo) => {
    const marca = intento > 1 ? ` (intento ${intento})` : '';
    log(`Encargo ${encargo.code} encontrado${marca}. Despertando a Claude...`);
    const arranque = Date.now();

    const proceso = spawn(
      CLI,
      ['-p', INSTRUCCION, '--mcp-config', CONFIG_MCP, '--allowedTools', ...HERRAMIENTAS],
      { cwd: path.dirname(AQUI), shell: USAR_SHELL, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    let salida = '';
    proceso.stdout.on('data', (trozo) => {
      salida += trozo.toString();
    });
    proceso.stderr.on('data', (trozo) => {
      const texto = trozo.toString().trim();
      if (texto) console.error(`    ${texto.slice(0, 200)}`);
    });

    proceso.on('close', (codigo) => {
      const segundos = Math.round((Date.now() - arranque) / 1000);
      if (codigo === 0) {
        log(`Listo en ${segundos}s. ${salida.trim().split('\n').pop()?.slice(0, 120) ?? ''}`);
      } else {
        log(`Claude termino con error (codigo ${codigo}) tras ${segundos}s.`);
      }
      listo();
    });

    proceso.on('error', (error) => {
      log(`No se pudo lanzar el CLI de Claude: ${error.message}`);
      log('Comprueba que "claude --version" funciona en una terminal nueva.');
      listo();
    });
  });
}

async function ciclo() {
  if (generando) return;

  const encargo = await buscarEncargo();
  if (!encargo) return;

  const hechos = intentos.get(encargo.code) ?? 0;

  if (hechos >= MAX_INTENTOS) {
    avisarUnaVez(
      `abandonado:${encargo.code}`,
      `Dejo de intentar ${encargo.code}: ${MAX_INTENTOS} intentos y sigue sin entregarse. ` +
        'Cancelalo desde ConvertIA o generalo a mano. No gasto mas cuota en el.',
    );
    return;
  }

  intentos.set(encargo.code, hechos + 1);
  generando = true;

  try {
    await generarLanding(encargo, hechos + 1);

    // Si sigue pendiente, Claude termino sin llamar a entregar_landing.
    const sigue = await buscarEncargo();
    if (sigue?.code === encargo.code) {
      log(`Aviso: ${encargo.code} sigue pendiente. Claude no lo entrego.`);
      if (hechos + 1 >= MAX_INTENTOS) {
        log('No lo reintentare mas. Revisa la ejecucion en Claude para ver que paso.');
      } else {
        log('Lo reintentare una vez mas en el proximo ciclo.');
      }
    } else {
      intentos.delete(encargo.code);
    }
  } finally {
    generando = false;
  }
}

log('Vigilante de ConvertIA en marcha.');
log(`Mirando ${URL_BASE} cada ${INTERVALO_MS / 1000}s. Vigilar no consume nada.`);
log(`CLI de Claude: ${CLI}`);
log('Deja esta ventana abierta. Ciérrala para pararlo.');

await ciclo();
setInterval(() => {
  void ciclo();
}, INTERVALO_MS);
