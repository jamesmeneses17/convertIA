import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * ============================================================================
 *  ConvertIA :: buzon en carpeta (puente por archivos)
 * ----------------------------------------------------------------------------
 *  Alternativa al puente MCP para versiones de Claude Escritorio que no admiten
 *  servidores MCP locales. ConvertIA escribe el encargo en una carpeta que tu
 *  conectas en Claude con "Agregar carpeta"; Claude deja ahi la landing en un
 *  archivo y ConvertIA la recoge y la renderiza.
 *
 *  Se activa con BUZON_DIR (ruta dentro del contenedor). Si no esta definida,
 *  todo este modulo se comporta como si no existiera.
 * ============================================================================
 */

const BUZON_DIR = process.env.BUZON_DIR?.trim() ?? '';

/** Ruta tal y como la ve el usuario en su maquina (solo para mostrarla). */
export const BUZON_HOST_PATH = process.env.BUZON_HOST_PATH?.trim() ?? '';

export const ARCHIVO_ENCARGO = 'ENCARGO-PENDIENTE.md';
export const ARCHIVO_ENTREGA = 'ENTREGA.html';

export function isBuzonEnabled(): boolean {
  return BUZON_DIR.length > 0;
}

function ruta(nombre: string): string {
  return path.join(BUZON_DIR, nombre);
}

/** Deja el encargo escrito para que Claude lo lea desde la carpeta conectada. */
export async function escribirEncargo(code: string, name: string, prompt: string): Promise<void> {
  if (!isBuzonEnabled()) return;

  const contenido = [
    `# ENCARGO ${code}`,
    '',
    `**Proyecto:** ${name}`,
    `**Creado:** ${new Date().toISOString()}`,
    '',
    '## Instrucciones para Claude',
    '',
    '1. Cumple al pie de la letra el Prompt Maestro que viene mas abajo.',
    `2. Escribe el resultado en un archivo llamado \`${ARCHIVO_ENTREGA}\` **en esta misma carpeta**.`,
    '3. Debe ser un documento HTML completo y autocontenido: CSS y JavaScript embebidos,',
    '   sin dependencias externas, que funcione abriendolo en el navegador.',
    '4. No cambies el nombre del archivo ni lo guardes en otro sitio: ConvertIA lo esta esperando',
    '   y lo mostrara renderizado en cuanto aparezca.',
    '',
    '---',
    '',
    '## PROMPT MAESTRO',
    '',
    prompt,
  ].join('\n');

  await fs.mkdir(BUZON_DIR, { recursive: true });
  await fs.writeFile(ruta(ARCHIVO_ENCARGO), contenido, 'utf8');

  // Si quedo una entrega anterior sin recoger, la apartamos para no confundirla.
  await fs.rm(ruta(ARCHIVO_ENTREGA), { force: true }).catch(() => undefined);
}

/** Devuelve el HTML que dejo Claude, o null si todavia no hay nada. */
export async function leerEntrega(): Promise<string | null> {
  if (!isBuzonEnabled()) return null;
  try {
    const contenido = await fs.readFile(ruta(ARCHIVO_ENTREGA), 'utf8');
    return contenido.trim().length > 0 ? contenido : null;
  } catch {
    return null;
  }
}

/** Guarda la entrega recogida en el historial y limpia el buzon. */
export async function archivarEntrega(code: string): Promise<void> {
  if (!isBuzonEnabled()) return;
  try {
    const historial = path.join(BUZON_DIR, 'entregadas');
    await fs.mkdir(historial, { recursive: true });
    await fs.rename(ruta(ARCHIVO_ENTREGA), path.join(historial, `${code}.html`));
  } catch {
    await fs.rm(ruta(ARCHIVO_ENTREGA), { force: true }).catch(() => undefined);
  }
  await fs.rm(ruta(ARCHIVO_ENCARGO), { force: true }).catch(() => undefined);
}

/** Retira el encargo de la carpeta (cancelacion desde ConvertIA). */
export async function limpiarBuzon(): Promise<void> {
  if (!isBuzonEnabled()) return;
  await fs.rm(ruta(ARCHIVO_ENCARGO), { force: true }).catch(() => undefined);
  await fs.rm(ruta(ARCHIVO_ENTREGA), { force: true }).catch(() => undefined);
}
