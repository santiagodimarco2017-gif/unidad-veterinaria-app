// Detección de alertas de paro vía Google News RSS. Solo nativo (el RSS no manda CORS en web).

import type { Alerta } from '../lib/types';
import { esNativo } from './plataforma';

const QUERIES = ['paro colectivos Rosario', 'paro UTA Santa Fe', 'colectivos Casilda'];

const TIMEOUT_MS = 12_000;
const VENTANA_HORAS = 72;

const RE_PARO = /paro|medida de fuerza|huelga|sin colectivos|asamblea|retenci[oó]n de tareas|servicio reducido|suspend/i;
const RE_ZONA = /rosario|casilda|santa fe|interurban|media distancia|uta/i;
/** Títulos que ameritan nivel 'alta' (paro confirmado / sin servicio) vs 'media' (posible/negociación). */
const RE_ALTA = /paro|sin colectivos/i;

interface ItemRss {
  titulo: string;
  link: string;
  fechaISO: string;
  fuente: string;
}

function urlRss(query: string): string {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=es-419&gl=AR&ceid=AR:es-419`;
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

function parseRss(xml: string): ItemRss[] {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  return items.map((item) => {
    const titulo = item.querySelector('title')?.textContent?.trim() ?? '';
    const link = item.querySelector('link')?.textContent?.trim() ?? '';
    const pubDate = item.querySelector('pubDate')?.textContent?.trim() ?? '';
    const fechaISO = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const fuente = item.querySelector('source')?.textContent?.trim() ?? 'Google News';
    return { titulo, link, fechaISO, fuente };
  });
}

/** Hash corto y estable de un string (para id de alerta a partir del link). */
function hash(texto: string): string {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h << 5) - h + texto.charCodeAt(i);
    h |= 0;
  }
  return `p${Math.abs(h).toString(36)}`;
}

/** Normaliza un título para comparar similitud simple (minúsculas, sin acentos, sin puntuación). */
function normalizar(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similares(a: string, b: string): boolean {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na === nb) return true;
  // Similitud simple: si una es prefijo larga de la otra o comparten la mayoría de palabras.
  const wa = new Set(na.split(' '));
  const wb = new Set(nb.split(' '));
  let comunes = 0;
  wa.forEach((w) => {
    if (wb.has(w)) comunes += 1;
  });
  const minTam = Math.min(wa.size, wb.size);
  return minTam > 0 && comunes / minTam > 0.75;
}

/** Busca en Google News RSS noticias recientes de paro de colectivos relevantes a Rosario/Casilda. */
export async function buscarAlertasParo(): Promise<Alerta[]> {
  if (!esNativo()) return [];

  const corteMs = Date.now() - VENTANA_HORAS * 60 * 60 * 1000;
  const todosLosItems: ItemRss[] = [];

  await Promise.all(
    QUERIES.map(async (q) => {
      try {
        const res = await fetchConTimeout(urlRss(q), TIMEOUT_MS);
        if (!res.ok) return;
        const xml = await res.text();
        todosLosItems.push(...parseRss(xml));
      } catch {
        // Ignorar fallas de una query individual.
      }
    }),
  );

  const candidatos = todosLosItems.filter((item) => {
    const t = new Date(item.fechaISO).getTime();
    if (Number.isNaN(t) || t < corteMs) return false;
    return RE_PARO.test(item.titulo) && RE_ZONA.test(item.titulo);
  });

  const alertas: Alerta[] = [];
  for (const item of candidatos) {
    if (alertas.some((a) => similares(a.titulo, item.titulo))) continue;
    alertas.push({
      id: hash(item.link || item.titulo),
      tipo: 'paro',
      titulo: item.titulo,
      detalle: item.fuente,
      fecha: item.fechaISO,
      url: item.link || undefined,
      fuente: item.fuente,
      nivel: RE_ALTA.test(item.titulo) ? 'alta' : 'media',
    });
  }

  return alertas;
}
