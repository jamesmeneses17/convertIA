#!/usr/bin/env node
/**
 * ============================================================================
 * ConvertIA :: vigilante automático del buzón
 * ----------------------------------------------------------------------------
 * Vigila ConvertIA cada pocos segundos.
 *
 * Cuando encuentra un encargo pendiente:
 *
 *   ConvertIA
 *       ↓
 *   vigilante
 *       ↓
 *   Claude Code CLI
 *       ↓
 *   MCP ConvertIA
 *       ↓
 *   obtener_encargo
 *       ↓
 *   generar landing / prompt maestro
 *       ↓
 *   entregar_landing / entregar_prompt
 *
 * No es necesario abrir Claude manualmente ni ejecutar una tarea programada.
 *
 * Arrancar:
 *   node vigilante/vigilante.mjs
 *
 * O:
 *   doble clic en iniciar-vigilante.cmd
 * ============================================================================
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));

const URL_BASE = (
  process.env.CONVERTIA_URL ?? 'http://localhost:3300'
).replace(/\/+$/, '');

const INTERVALO_MS = Number(
  process.env.VIGILANTE_INTERVALO ?? 10_000
);

const CONFIG_MCP = path.join(AQUI, 'mcp-convertia.json');

/**
 * Instrucción que recibe Claude Code.
 *
 * Claude debe utilizar las herramientas MCP para obtener el encargo
 * y entregar directamente el resultado a ConvertIA.
 */
const INSTRUCCION =
  'Atiende el encargo pendiente de ConvertIA. ' +
  'Llama primero a obtener_encargo para conocer exactamente qué solicita. ' +
  'Si el encargo solicita una LANDING, debes crearla y entregarla utilizando entregar_landing. ' +
  'Si solicita un PROMPT MAESTRO, debes generarlo y entregarlo utilizando entregar_prompt. ' +
  'No escribas el resultado generado en tu respuesta de texto: debes entregarlo mediante la herramienta MCP correspondiente. ' +
  'No pidas confirmación al usuario. Ejecuta el encargo directamente. ' +
  'Cuando hayas terminado, responde únicamente con una línea breve indicando que el encargo fue procesado.';

/**
 * Localiza Claude Code.
 *
 * En Windows se intenta utilizar directamente claude.exe.
 */
function localizarCli() {
  if (process.platform !== 'win32') {
    return {
      comando: 'claude',
      shell: false,
    };
  }

  const appdata = process.env.APPDATA ?? '';

  const exe = path.join(
    appdata,
    'npm',
    'node_modules',
    '@anthropic-ai',
    'claude-code',
    'bin',
    'claude.exe',
  );

  if (existsSync(exe)) {
    return {
      comando: exe,
      shell: false,
    };
  }

  const cmd = path.join(
    appdata,
    'npm',
    'claude.cmd',
  );

  if (existsSync(cmd)) {
    return {
      comando: cmd,
      shell: true,
    };
  }

  return {
    comando: 'claude',
    shell: true,
  };
}

const {
  comando: CLI,
  shell: USAR_SHELL,
} = localizarCli();

/**
 * Herramientas MCP permitidas.
 *
 * Claude Code NO recibe permisos generales.
 * Solamente puede utilizar las herramientas necesarias
 * para trabajar con ConvertIA.
 */
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
 * Control de reintentos.
 *
 * Evita lanzar Claude indefinidamente si por algún motivo
 * termina sin entregar el encargo.
 */
const intentos = new Map();

const MAX_INTENTOS = 2;

/**
 * Tiempo máximo que puede durar una ejecución de Claude.
 *
 * 30 minutos.
 */
const TIMEOUT_CLAUDE_MS =
  Number(process.env.VIGILANTE_TIMEOUT ?? 30 * 60 * 1000);

function hora() {
  return new Date().toLocaleTimeString('es-CO', {
    hour12: false,
  });
}

function log(mensaje) {
  console.log(`[${hora()}] ${mensaje}`);
}

/**
 * Evita repetir infinitamente el mismo mensaje de error.
 */
function avisarUnaVez(clave, mensaje) {
  if (ultimoAviso === clave) {
    return;
  }

  ultimoAviso = clave;
  log(mensaje);
}

/**
 * Busca un encargo pendiente en ConvertIA.
 */
async function buscarEncargo() {
  try {
    const respuesta = await fetch(
      `${URL_BASE}/api/bridge/handoffs?status=pendiente&take=1`,
      {
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!respuesta.ok) {
      avisarUnaVez(
        'http',
        `ConvertIA respondió ${respuesta.status}. Sigo esperando...`,
      );

      return null;
    }

    ultimoAviso = '';

    const datos = await respuesta.json();

    return datos.handoffs?.[0] ?? null;
  } catch {
    avisarUnaVez(
      'red',
      `No veo ConvertIA en ${URL_BASE}. Levántalo con "docker compose up -d". Sigo mirando...`,
    );

    return null;
  }
}

/**
 * Comprueba que Claude Code esté disponible.
 */
function comprobarClaude() {
  return new Promise((resolver) => {
    const proceso = spawn(
      CLI,
      ['--version'],
      {
        shell: USAR_SHELL,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let salida = '';

    proceso.stdout.on('data', (trozo) => {
      salida += trozo.toString();
    });

    proceso.on('close', (codigo) => {
      if (codigo === 0) {
        log(`Claude Code disponible: ${salida.trim()}`);
        resolver(true);
      } else {
        resolver(false);
      }
    });

    proceso.on('error', () => {
      resolver(false);
    });
  });
}

/**
 * Despierta automáticamente Claude Code.
 */
function generar(encargo, intento) {
  return new Promise((resolver) => {
    const marca =
      intento > 1
        ? ` (intento ${intento})`
        : '';

    log(
      `Encargo ${encargo.code} encontrado${marca}.`,
    );

    log(
      'Despertando automáticamente a Claude Code...',
    );

    const arranque = Date.now();

    const proceso = spawn(
      CLI,
      [
        '-p',
        INSTRUCCION,

        '--mcp-config',
        CONFIG_MCP,

        '--allowedTools',
        ...HERRAMIENTAS,
      ],
      {
        cwd: path.dirname(AQUI),
        shell: USAR_SHELL,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    let salida = '';

    let finalizado = false;

    /**
     * Finalización controlada.
     */
    function terminar(codigo, motivo = '') {
      if (finalizado) {
        return;
      }

      finalizado = true;

      const segundos = Math.round(
        (Date.now() - arranque) / 1000,
      );

      if (codigo === 0) {
        const ultimaLinea =
          salida
            .trim()
            .split('\n')
            .pop()
            ?.slice(0, 200) ?? '';

        log(
          `Claude terminó correctamente en ${segundos}s.`,
        );

        if (ultimaLinea) {
          log(`Claude: ${ultimaLinea}`);
        }
      } else {
        log(
          `Claude terminó con error (código ${codigo}) tras ${segundos}s.`,
        );

        if (motivo) {
          log(motivo);
        }
      }

      resolver(codigo === 0);
    }

    proceso.stdout.on('data', (trozo) => {
      salida += trozo.toString();
    });

    proceso.stderr.on('data', (trozo) => {
      const texto = trozo
        .toString()
        .trim();

      if (texto) {
        console.error(
          `    ${texto.slice(0, 500)}`,
        );
      }
    });

    /**
     * Timeout de seguridad.
     */
    const temporizador = setTimeout(() => {
      log(
        `Claude lleva más de ${TIMEOUT_CLAUDE_MS / 60000
        } minutos. Finalizando proceso...`,
      );

      proceso.kill();

      terminar(
        1,
        'Se alcanzó el tiempo máximo permitido.',
      );
    }, TIMEOUT_CLAUDE_MS);

    proceso.on('close', (codigo) => {
      clearTimeout(temporizador);

      terminar(codigo);
    });

    proceso.on('error', (error) => {
      clearTimeout(temporizador);

      log(
        `No se pudo lanzar Claude Code: ${error.message}`,
      );

      log(
        'Comprueba que "claude --version" funciona en una terminal nueva.',
      );

      terminar(
        1,
        'Claude Code no pudo iniciarse.',
      );
    });
  });
}

/**
 * Procesa un ciclo completo.
 */
async function ciclo() {
  /**
   * No lanzar dos Claude simultáneamente.
   */
  if (generando) {
    return;
  }

  /**
   * Buscar trabajo.
   */
  const encargo = await buscarEncargo();

  if (!encargo) {
    return;
  }

  /**
   * Cuántas veces hemos intentado este encargo.
   */
  const hechos =
    intentos.get(encargo.code) ?? 0;

  /**
   * Evitar bucles infinitos.
   */
  if (hechos >= MAX_INTENTOS) {
    avisarUnaVez(
      `abandonado:${encargo.code}`,
      `Dejo de intentar ${encargo.code}: ${MAX_INTENTOS} intentos y sigue sin entregarse.`,
    );

    log(
      'Revisa el encargo manualmente en ConvertIA.',
    );

    return;
  }

  intentos.set(
    encargo.code,
    hechos + 1,
  );

  generando = true;

  try {
    /**
     * Ejecutar Claude Code.
     */
    await generar(
      encargo,
      hechos + 1,
    );

    /**
     * Esperar un poco para que ConvertIA
     * actualice el estado del handoff.
     */
    await new Promise((resolver) =>
      setTimeout(resolver, 2000),
    );

    /**
     * Verificar si realmente fue entregado.
     */
    const sigue =
      await buscarEncargo();

    if (
      sigue?.code === encargo.code
    ) {
      log(
        `⚠️ ${encargo.code} sigue pendiente.`,
      );

      log(
        'Claude terminó pero el encargo todavía no fue entregado.',
      );

      if (
        hechos + 1 >=
        MAX_INTENTOS
      ) {
        log(
          'No se realizarán más intentos automáticos.',
        );
      } else {
        log(
          'Se realizará otro intento automáticamente.',
        );
      }
    } else {
      /**
       * El encargo desapareció de pendientes.
       *
       * Lo consideramos entregado.
       */
      log(
        `✅ ${encargo.code} procesado y entregado.`,
      );

      intentos.delete(
        encargo.code,
      );
    }
  } finally {
    generando = false;
  }
}

/**
 * ============================================================================
 * ARRANQUE
 * ============================================================================
 */

log(
  '==============================================',
);

log(
  'ConvertIA :: VIGILANTE AUTOMÁTICO',
);

log(
  '==============================================',
);

log(
  `Servidor: ${URL_BASE}`,
);

log(
  `Intervalo: ${INTERVALO_MS / 1000}s`,
);

log(
  `CLI Claude: ${CLI}`,
);

log(
  'Modo: AUTOMÁTICO',
);

log(
  'Claude será ejecutado automáticamente cuando llegue un encargo.',
);

log(
  '==============================================',
);

/**
 * Verificar Claude antes de comenzar.
 */
const claudeDisponible =
  await comprobarClaude();

if (!claudeDisponible) {
  log(
    '❌ Claude Code no está disponible.',
  );

  log(
    'Ejecuta "claude --version" para comprobar la instalación.',
  );

  process.exit(1);
}

/**
 * Primer ciclo inmediato.
 */
await ciclo();

/**
 * Seguir vigilando.
 */
setInterval(() => {
  void ciclo();
}, INTERVALO_MS);