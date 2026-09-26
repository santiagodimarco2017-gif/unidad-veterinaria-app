// Link "Agregar a Google Calendar" (plantilla de evento de calendar.google.com).
// Abre la app de Google Calendar en Android / el navegador en iPhone y web, con el evento precargado.
import type { Hora } from './types';

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

export interface EventoCalendario {
  titulo: string;
  /** YYYY-MM-DD */
  fecha: string;
  /** "HH:MM"; sin hora se agenda como evento de todo el día */
  hora?: Hora;
  duracionMin?: number;
  detalles?: string;
  lugar?: string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const compacta = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/** Rango `dates` de Google Calendar: hora local "flotante" + `ctz`, o fechas de día completo. */
export function rangoFechas(fecha: string, hora?: Hora, duracionMin = 180): string {
  const [a, m, d] = fecha.split('-').map(Number);
  if (!hora) {
    // Día completo: el fin es exclusivo (día siguiente).
    return `${compacta(new Date(a, m - 1, d))}/${compacta(new Date(a, m - 1, d + 1))}`;
  }
  const [h, min] = hora.split(':').map(Number);
  const ini = new Date(a, m - 1, d, h, min);
  const fin = new Date(ini.getTime() + duracionMin * 60_000);
  const hms = (x: Date) => `${compacta(x)}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
  return `${hms(ini)}/${hms(fin)}`;
}

export function urlGoogleCalendar(ev: EventoCalendario): string {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: ev.titulo,
    dates: rangoFechas(ev.fecha, ev.hora, ev.duracionMin),
    ctz: ZONA_HORARIA,
  });
  if (ev.detalles) p.set('details', ev.detalles);
  if (ev.lugar) p.set('location', ev.lugar);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
