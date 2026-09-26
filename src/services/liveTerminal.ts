// Actualización en vivo desde terminalrosario.gob.ar. En nativo se consulta directo (CapacitorHttp evita
// CORS); en web se pasa por la función de Vercel /api/terminal, porque la terminal no habilita CORS.
// Si la web se sirve sin esas funciones (p. ej. `vite dev`), la consulta falla y se usan los datos incluidos.

import type { Servicio } from '../lib/types';
import { parseResultados } from '../lib/terminal-parser';
import { construirServicios } from '../lib/merge';
import { SERVICIOS_MUNICIPIO_339 } from '../data/municipio339';
import { esNativo } from './plataforma';

const URL_ROSARIO_CASILDA = 'http://www.terminalrosario.gob.ar/buscador/2000/221/rosario-casilda/';
const URL_CASILDA_ROSARIO = 'http://www.terminalrosario.gob.ar/buscador/221/2000/casilda-rosario/';

const TIMEOUT_MS = 15_000;
/** Umbral mínimo de servicios por sentido para considerar la respuesta válida (evita páginas de error/caídas parciales). */
const MINIMO_SERVICIOS_POR_SENTIDO = 20;

async function obtenerHtml(url: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

/**
 * Descarga y parsea las dos direcciones desde la terminal, las combina con los datos del
 * municipio (33/9) y devuelve la lista fusionada. Devuelve null si hay timeout/error de red
 * o si la respuesta no pasa el chequeo de sanidad (muy pocos servicios).
 */
export async function actualizarDesdeTerminal(): Promise<Servicio[] | null> {
  const nativo = esNativo();
  const urlRC = nativo ? URL_ROSARIO_CASILDA : '/api/terminal?sentido=rc';
  const urlCR = nativo ? URL_CASILDA_ROSARIO : '/api/terminal?sentido=cr';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const [htmlRC, htmlCR] = await Promise.all([
      obtenerHtml(urlRC, controller.signal),
      obtenerHtml(urlCR, controller.signal),
    ]);

    const serviciosRC = parseResultados(htmlRC, 'RC');
    const serviciosCR = parseResultados(htmlCR, 'CR');

    if (serviciosRC.length < MINIMO_SERVICIOS_POR_SENTIDO || serviciosCR.length < MINIMO_SERVICIOS_POR_SENTIDO) {
      return null;
    }

    const terminal = [...serviciosRC, ...serviciosCR];
    return construirServicios(terminal, SERVICIOS_MUNICIPIO_339);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
