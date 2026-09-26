// Parser del buscador de la Terminal de Ómnibus de Rosario (HTML sin API).
// Solo regex: funciona igual en navegador, WebView y Node (sin DOM).
import type { DiasServicio, Direccion, EmpresaId, Servicio } from './types';
import { MASCARA_ORDEN, idServicio, normalizarHora } from './schedule';

export const TERMINAL_BASE = 'http://www.terminalrosario.gob.ar';
export const URL_TERMINAL_RC = `${TERMINAL_BASE}/buscador/2000/221/rosario-casilda/`;
export const URL_TERMINAL_CR = `${TERMINAL_BASE}/buscador/221/2000/casilda-rosario/`;
export const URL_TERMINAL: Record<Direccion, string> = { RC: URL_TERMINAL_RC, CR: URL_TERMINAL_CR };

/** Fila cruda tal como la genera tools/scrape-terminal.mjs */
export interface FilaTerminal {
  viajeId: number;
  empresaId: number;
  empresa: string;
  sale: string;
  llega: string;
  dias: DiasServicio;
  observaciones: string;
  tipoServicio: string;
  origen?: string;
  destino?: string;
}

/** Forma de src/data/terminal-snapshot.json */
export interface TerminalSnapshot {
  fuente?: string;
  actualizado: string;
  rosarioCasilda: FilaTerminal[];
  casildaRosario: FilaTerminal[];
}

const ENTIDADES: Record<string, string> = {
  nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', laquo: '«', raquo: '»', deg: '°',
  ordm: 'º', ordf: 'ª', ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
  Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
};

function decodificarEntidades(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (todo, e: string) => {
    if (e[0] === '#') {
      const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 ? String.fromCodePoint(cp) : todo;
    }
    return ENTIDADES[e] ?? todo;
  });
}

const limpiar = (s: string): string =>
  decodificarEntidades(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const normalizar = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Nombre de empresa de la terminal → EmpresaId (tolera acentos/mayúsculas) */
export function empresaDesdeNombre(nombre: string): EmpresaId {
  const n = normalizar(nombre);
  if (n.includes('33/9') || n.includes('azul america')) return 'linea339';
  if (n.includes('ranqueles')) return 'ranqueles';
  if (n.includes('arito')) return 'arito';
  if (n.includes('la verde')) return 'laverde';
  if (n.replace(/[\s-]/g, '').includes('viatac')) return 'viatac';
  if (n.includes('nandu')) return 'nandu';
  if (n.includes('flecha')) return 'flechabus';
  return 'otra';
}

/** Extrae las filas crudas de la tabla de resultados */
export function parseFilas(html: string): FilaTerminal[] {
  const tbody = html.split('<tbody>')[1]?.split('</tbody>')[0] ?? '';
  const filas = tbody.split(/<tr[^>]*>/).slice(1);
  const res: FilaTerminal[] = [];
  for (const row of filas) {
    const sale = row.match(/class="sale">\s*([\d:]+)/)?.[1];
    if (!sale) continue;
    const llega = row.match(/class="llega">\s*([\d:]+)/)?.[1] ?? sale;
    const flags = [...row.matchAll(/table-icon-(yes|no)\.png/g)].map((m) => m[1] === 'yes');
    const dias = Object.fromEntries(MASCARA_ORDEN.map((d, i) => [d, !!flags[i]])) as DiasServicio;
    const tds = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => limpiar(m[1]));
    res.push({
      viajeId: Number(row.match(/viaje_detalle\.php\?id=(\d+)/)?.[1] ?? NaN),
      empresaId: Number(row.match(/empresa\.php\?id=(\d+)/)?.[1] ?? NaN),
      empresa: limpiar(row.match(/class="visible-xs detalle_empresa">([^<]*)</)?.[1] ?? ''),
      sale: normalizarHora(sale),
      llega: normalizarHora(llega),
      dias,
      observaciones: limpiar(row.match(/class="observaciones">([\s\S]*?)<\/td>/)?.[1] ?? ''),
      tipoServicio: tds[0] ?? '',
    });
  }
  return res;
}

export function filaAServicio(fila: FilaTerminal, direccion: Direccion): Servicio {
  const base = {
    direccion,
    empresa: empresaDesdeNombre(fila.empresa),
    sale: normalizarHora(fila.sale),
    dias: { ...fila.dias },
  };
  return {
    id: idServicio(base),
    ...base,
    llega: normalizarHora(fila.llega),
    tipoServicio: fila.tipoServicio.trim(),
    observaciones: fila.observaciones.trim(),
    fuente: 'terminal',
    ...(Number.isFinite(fila.viajeId) && fila.viajeId > 0 ? { viajeId: fila.viajeId } : {}),
  };
}

/** HTML de resultados del buscador → Servicios */
export function parseResultados(html: string, direccion: Direccion): Servicio[] {
  return parseFilas(html).map((f) => filaAServicio(f, direccion));
}

/** Snapshot JSON (rosarioCasilda → RC, casildaRosario → CR) → Servicios */
export function snapshotAServicios(json: TerminalSnapshot): Servicio[] {
  return [
    ...json.rosarioCasilda.map((f) => filaAServicio(f, 'RC')),
    ...json.casildaRosario.map((f) => filaAServicio(f, 'CR')),
  ];
}
