// "¿Cómo llego?": mejores salidas Rosario → Casilda para llegar a tiempo a una mesa de examen
// en la Facultad de Ciencias Veterinarias (Casilda). Usa el mismo motor de horarios.
import type { Feriado, Hora, Salida, Servicio } from './types';
import { horaAMinutos, salidasDelDia } from './schedule';

/** Minutos de margen: llegar al menos media hora antes de la mesa */
export const MARGEN_LLEGADA_MIN = 30;
/** Sin hora de mesa se muestran las salidas de la mañana (antes de esta hora) */
const FIN_MANANA = 12 * 60;

/** "8.30 hs" / "8:30" / "8 hs" / "14.00hs" → "08:30" / "08:00" / "14:00"; undefined si no se entiende */
export function parsearHoraMesa(texto?: string): Hora | undefined {
  if (!texto) return undefined;
  const m = texto.match(/(\d{1,2})(?:\s*[.:h]\s*(\d{2}))?/i);
  if (!m) return undefined;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 23 || min > 59) return undefined;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export interface OpcionesLlegada {
  /** 'a-tiempo': llegan con margen antes de `hora`; 'manana': sin hora, salidas de la mañana; 'ninguna': ninguna llega a tiempo */
  modo: 'a-tiempo' | 'manana' | 'ninguna';
  /** Salidas a mostrar, ordenadas por hora de salida */
  salidas: Salida[];
  /** Id del servicio recomendado (el que llega más tarde pero con margen) */
  mejorId?: string;
  /** Hora límite de llegada ("HH:MM") cuando hay hora de mesa */
  limite?: Hora;
}

const hhmm = (min: number): Hora => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Minutos desde la medianoche del día de la mesa (la llegada puede cruzar la medianoche) */
function minutosLlegada(s: Salida, fecha: Date): number {
  const base = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
  return Math.round((s.llegada.getTime() - base) / 60_000);
}

/**
 * Opciones Rosario → Casilda (RC) para el día `fecha`.
 * Con `hora`: las `n` salidas que llegan más tarde pero al menos MARGEN_LLEGADA_MIN antes.
 * Sin `hora`: las salidas de la mañana.
 */
export function opcionesParaLlegar(
  servicios: readonly Servicio[],
  fecha: Date,
  feriados: readonly Feriado[],
  hora?: Hora,
  n = 3,
  ahora: Date = new Date(),
): OpcionesLlegada {
  const delDia = salidasDelDia(servicios, 'RC', fecha, feriados, ahora);
  if (!hora) {
    const manana = delDia.filter((s) => horaAMinutos(s.servicio.sale) < FIN_MANANA);
    return { modo: 'manana', salidas: manana.slice(0, 8) };
  }
  const limiteMin = horaAMinutos(hora) - MARGEN_LLEGADA_MIN;
  const aTiempo = delDia
    .filter((s) => minutosLlegada(s, fecha) <= limiteMin)
    .sort((a, b) => b.llegada.getTime() - a.llegada.getTime() || b.salida.getTime() - a.salida.getTime());
  if (!aTiempo.length) {
    return { modo: 'ninguna', salidas: delDia.slice(0, n), limite: hhmm(Math.max(0, limiteMin)) };
  }
  const elegidas = aTiempo.slice(0, n).sort((a, b) => a.salida.getTime() - b.salida.getTime());
  return { modo: 'a-tiempo', salidas: elegidas, mejorId: aTiempo[0].servicio.id, limite: hhmm(limiteMin) };
}
