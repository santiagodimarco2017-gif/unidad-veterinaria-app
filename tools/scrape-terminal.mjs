// Scraper del buscador oficial de la Terminal de Ómnibus de Rosario.
// Uso: node tools/scrape-terminal.mjs [salida.json]
// Genera servicios Rosario<->Casilda con días, feriados, observaciones y tipo de servicio.
import { writeFileSync } from 'node:fs';

const BASE = 'http://www.terminalrosario.gob.ar';
const ROSARIO = 2000;
const CASILDA = 221;
const DAYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', 'feriados'];

const clean = (s) =>
  s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#0?38;|&amp;/g, '&').replace(/\s+/g, ' ').trim();

export function parseResultados(html, origen, destino) {
  const tbody = html.split('<tbody>')[1]?.split('</tbody>')[0] ?? '';
  const rows = tbody.split(/<tr[^>]*>/).slice(1);
  return rows.map((row) => {
    const empresaId = Number(row.match(/empresa\.php\?id=(\d+)/)?.[1]);
    const empresa = clean(row.match(/class="visible-xs detalle_empresa">([^<]*)</)?.[1] ?? '');
    const sale = row.match(/class="sale">\s*([\d:]+)/)?.[1];
    const llega = row.match(/class="llega">\s*([\d:]+)/)?.[1];
    const flags = [...row.matchAll(/table-icon-(yes|no)\.png/g)].map((m) => m[1] === 'yes');
    const dias = Object.fromEntries(DAYS.map((d, i) => [d, !!flags[i]]));
    const observaciones = clean(row.match(/class="observaciones">([\s\S]*?)<\/td>/)?.[1] ?? '');
    const tds = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((m) => clean(m[1]));
    const tipoServicio = tds[0] ?? '';
    const viajeId = Number(row.match(/viaje_detalle\.php\?id=(\d+)/)?.[1]);
    return { viajeId, empresaId, empresa, sale, llega, dias, observaciones, tipoServicio, origen, destino };
  }).filter((s) => s.sale);
}

async function get(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'UnidadVeterinaria/1.0' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

export async function scrape() {
  const [rc, cr] = await Promise.all([
    get(`${BASE}/buscador/${ROSARIO}/${CASILDA}/rosario-casilda/`),
    get(`${BASE}/buscador/${CASILDA}/${ROSARIO}/casilda-rosario/`),
  ]);
  return {
    fuente: BASE,
    actualizado: new Date().toISOString(),
    rosarioCasilda: parseResultados(rc, 'Rosario', 'Casilda'),
    casildaRosario: parseResultados(cr, 'Casilda', 'Rosario'),
  };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const data = await scrape();
  const out = process.argv[2] ?? 'terminal.json';
  writeFileSync(out, JSON.stringify(data, null, 2));
  console.log(`R->C ${data.rosarioCasilda.length} servicios, C->R ${data.casildaRosario.length} servicios -> ${out}`);
}
