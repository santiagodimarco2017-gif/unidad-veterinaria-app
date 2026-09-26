// Feriados nacionales: api.argentinadatos.com con cache de 7 días y fallback a los datos incluidos.

import type { Feriado } from '../lib/types';
import { FERIADOS_INCLUIDOS } from '../data/index';
import { cargar, guardar, CLAVES } from './storage';

const SIETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;
const TIMEOUT_MS = 10_000;

interface CacheFeriados {
  obtenidoEn: string; // ISO
  feriados: Feriado[];
}

interface FeriadoApi {
  fecha: string;
  nombre: string;
  tipo?: string;
}

async function fetchConTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function obtenerFeriadosDelAnio(anio: number): Promise<Feriado[] | null> {
  try {
    const res = await fetchConTimeout(`https://api.argentinadatos.com/v1/feriados/${anio}`, TIMEOUT_MS);
    if (!res.ok) return null;
    const json = (await res.json()) as FeriadoApi[];
    if (!Array.isArray(json)) return null;
    return json.map((f) => ({
      fecha: f.fecha,
      nombre: f.nombre,
      tipo: (f.tipo ?? 'inamovible') as Feriado['tipo'],
    }));
  } catch {
    return null;
  }
}

/**
 * Obtiene feriados del año actual y el siguiente, con cache de 7 días.
 * Si la API falla (incluyendo 404 del año siguiente cuando aún no está publicado),
 * degrada a la cache existente o a FERIADOS_INCLUIDOS.
 */
export async function obtenerFeriados(): Promise<Feriado[]> {
  const cache = await cargar<CacheFeriados | null>(CLAVES.CACHE_FERIADOS, null);
  const ahora = Date.now();
  if (cache && ahora - new Date(cache.obtenidoEn).getTime() < SIETE_DIAS_MS && cache.feriados.length > 0) {
    return cache.feriados;
  }

  const anioActual = new Date().getFullYear();
  const [actual, siguiente] = await Promise.all([
    obtenerFeriadosDelAnio(anioActual),
    obtenerFeriadosDelAnio(anioActual + 1),
  ]);

  const combinados = [...(actual ?? []), ...(siguiente ?? [])];
  if (combinados.length > 0) {
    const nuevaCache: CacheFeriados = { obtenidoEn: new Date().toISOString(), feriados: combinados };
    await guardar(CLAVES.CACHE_FERIADOS, nuevaCache);
    return combinados;
  }

  // La API no respondió nada útil: usar cache vieja si existe, si no el fallback incluido.
  if (cache && cache.feriados.length > 0) return cache.feriados;
  return FERIADOS_INCLUIDOS;
}

/** Feriados entre `desde` y `desde + dias` días (inclusive), ordenados por fecha. */
export function proximosFeriados(feriados: Feriado[], desde: Date, dias = 30): Feriado[] {
  const inicio = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + dias);
  return feriados
    .filter((f) => {
      const fecha = new Date(`${f.fecha}T00:00:00`);
      return fecha >= inicio && fecha <= fin;
    })
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
