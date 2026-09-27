// Utilidades de presentación compartidas por pantallas y componentes.
import type { DiaKey, Direccion } from '../lib/types';
import type { Tab } from './Nav';

/** Pestañas que se ven dentro de "Colectivos" en la barra y vuelven a ella con "atrás" */
export const TABS_COLECTIVOS: readonly Tab[] = ['colectivos', 'horarios', 'favoritos'];

export const DIAS: readonly DiaKey[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
export const DIA_LETRA: Record<DiaKey, string> = {
  lun: 'L', mar: 'M', mie: 'M', jue: 'J', vie: 'V', sab: 'S', dom: 'D',
};
export const DIA_CORTO: Record<DiaKey, string> = {
  lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb', dom: 'Dom',
};

export const ORIGEN: Record<Direccion, 'Casilda' | 'Rosario'> = { CR: 'Casilda', RC: 'Rosario' };
export const DESTINO: Record<Direccion, 'Casilda' | 'Rosario'> = { CR: 'Rosario', RC: 'Casilda' };
export const SENTIDO: Record<Direccion, string> = {
  CR: 'Casilda → Rosario',
  RC: 'Rosario → Casilda',
};

export const pad2 = (n: number): string => String(n).padStart(2, '0');
export const hhmm = (d: Date): string => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

export function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function sumarDias(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** "2026-10-12" → Date local a medianoche */
export function desdeISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

const fmtDiaLargo = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtDiaCorto = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'long' });

export const capitalizar = (s: string): string => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const diaLargo = (d: Date): string => capitalizar(fmtDiaLargo.format(d));
export const diaCorto = (d: Date): string => capitalizar(fmtDiaCorto.format(d).replace(/\./g, ''));
export const nombreMes = (d: Date): string => capitalizar(fmtMes.format(d));

/** "Hoy", "Mañana" o "Mié 14 oct" */
export function etiquetaDia(d: Date, ahora: Date): string {
  if (mismoDia(d, ahora)) return 'Hoy';
  if (mismoDia(d, sumarDias(ahora, 1))) return 'Mañana';
  return diaCorto(d);
}

/** "hace 5 min", "hace 2 h", "ayer", "hace 3 días" */
export function haceCuanto(iso: string, ahora: Date): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const min = Math.round((ahora.getTime() - t) / 60000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  return diaCorto(new Date(t));
}

export function saludo(ahora: Date): string {
  const h = ahora.getHours();
  if (h < 6) return 'Buenas noches';
  if (h < 13) return 'Buen día';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/** Quita emojis de un texto (p. ej. descripciones de clima) */
export const sinEmoji = (s: string): string => s.replace(/\p{Extended_Pictographic}|️/gu, '').trim();

/** Número nacional de 10 dígitos (código de área + abonado), sin 0 ni 15 */
function nacional(num: string): string {
  let d = num.replace(/\D/g, '');
  if (d.startsWith('54')) d = d.slice(2);
  if (d.startsWith('9') && d.length === 11) d = d.slice(1);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 12) {
    // Formato con "15": área (2-4 dígitos) + 15 + abonado
    for (const area of [4, 3, 2]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2);
        break;
      }
    }
  }
  return d;
}

/** "3464-426600" → "tel:+543464426600" */
export function telHref(num: string): string {
  const n = nacional(num);
  return n.length === 10 ? `tel:+54${n}` : `tel:${num.replace(/[^\d+]/g, '')}`;
}

/** WhatsApp (móviles argentinos llevan 9) */
export function waHref(num: string): string {
  return `https://wa.me/549${nacional(num)}`;
}

/** Formato legible: "3464 42-6600" se deja como vino, sólo normalizamos separadores */
export const telLegible = (num: string): string => num.trim();
