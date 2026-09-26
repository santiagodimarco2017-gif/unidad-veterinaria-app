// Notificaciones locales: recordatorios semanales de favoritos y alertas inmediatas (paro/feriado/cambio).
//
// NOTA: los recordatorios se programan como repetición semanal por día/hora (schedule.on.weekday) y
// disparan igual aunque ese día sea feriado y el servicio no corra ese feriado (dias.feriados === false).
// Es una limitación aceptada para v1: `sincronizar()` en sync.ts compensa avisando el día anterior con
// una Alerta tipo 'feriado' para que la persona sepa que el horario cambia.

import { LocalNotifications, type Channel } from '@capacitor/local-notifications';
import type { Alerta, DiaKey, Favorito, Servicio } from '../lib/types';
import { esNativo } from './plataforma';

export const CANAL_RECORDATORIOS = 'recordatorios';
export const CANAL_ALERTAS = 'alertas';

/** Rango de ids reservado para notificaciones de recordatorio (evita chocar con las de alerta). */
const ID_BASE_RECORDATORIOS = 20_000;
const ID_RANGO_RECORDATORIOS = 10_000;
/** Rango reservado para notificaciones de alerta inmediatas. */
const ID_BASE_ALERTAS = 30_000;
const ID_RANGO_ALERTAS = 10_000;

/** Capacitor Weekday: 1 = domingo .. 7 = sábado. */
const DIA_A_WEEKDAY: Record<DiaKey, number> = {
  dom: 1,
  lun: 2,
  mar: 3,
  mie: 4,
  jue: 5,
  vie: 6,
  sab: 7,
};

function diaAnterior(weekday: number): number {
  // weekday en 1..7 (dom..sab) -> índice 0..6 -> restar 1 con wraparound -> volver a 1..7
  const idx = weekday - 1;
  return ((idx - 1 + 7) % 7) + 1;
}

function hashInt(texto: string): number {
  let h = 0;
  for (let i = 0; i < texto.length; i++) {
    h = (h << 5) - h + texto.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

let canalesInicializados = false;

async function asegurarCanales(): Promise<void> {
  if (!esNativo() || canalesInicializados) return;
  const canales: Channel[] = [
    {
      id: CANAL_RECORDATORIOS,
      name: 'Recordatorios de salida',
      description: 'Avisos antes de que salga tu colectivo favorito',
      importance: 4,
      visibility: 1,
      vibration: true,
    },
    {
      id: CANAL_ALERTAS,
      name: 'Alertas de servicio',
      description: 'Paros, cambios de horario y feriados',
      importance: 4,
      visibility: 1,
      vibration: true,
    },
  ];
  try {
    for (const canal of canales) {
      await LocalNotifications.createChannel(canal);
    }
  } catch {
    // Ignorar (p.ej. Android < 8 no tiene canales).
  } finally {
    canalesInicializados = true;
  }
}

/** Pide permiso de notificaciones. En web usa la Notification API; en nativo, LocalNotifications. */
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  if (esNativo()) {
    await asegurarCanales();
    try {
      const estado = await LocalNotifications.requestPermissions();
      return estado.display === 'granted';
    } catch {
      return false;
    }
  }
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const resultado = await Notification.requestPermission();
    return resultado === 'granted';
  } catch {
    return false;
  }
}

function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Programa recordatorios semanales repetidos para cada favorito con avisoMin != null,
 * uno por cada día en diasAviso. Cancela previamente todos los recordatorios pendientes
 * (rango reservado ID_BASE_RECORDATORIOS..+ID_RANGO_RECORDATORIOS) para no duplicar.
 * Devuelve la cantidad de notificaciones programadas.
 */
export async function programarRecordatorios(favoritos: Favorito[], servicios: Servicio[]): Promise<number> {
  if (!esNativo()) return 0;
  await asegurarCanales();

  // Cancelar recordatorios previos dentro de nuestro rango reservado.
  try {
    const pendientes = await LocalNotifications.getPending();
    const idsPropios = pendientes.notifications
      .map((n) => n.id)
      .filter((id) => id >= ID_BASE_RECORDATORIOS && id < ID_BASE_RECORDATORIOS + ID_RANGO_RECORDATORIOS);
    if (idsPropios.length > 0) {
      await LocalNotifications.cancel({ notifications: idsPropios.map((id) => ({ id })) });
    }
  } catch {
    // Continuar igual: si falla la limpieza, seguimos e intentamos programar.
  }

  const porServicio = new Map(servicios.map((s) => [s.id, s] as const));
  const nuevas: { id: number; title: string; body: string; schedule: { on: { weekday: number; hour: number; minute: number } } }[] = [];

  for (const fav of favoritos) {
    if (fav.avisoMin == null) continue;
    const servicio = porServicio.get(fav.servicioId);
    if (!servicio) continue;

    const saleMin = horaAMinutos(servicio.sale);
    let minutoAviso = saleMin - fav.avisoMin;
    let cruzaDiaAnterior = false;
    if (minutoAviso < 0) {
      minutoAviso += 24 * 60;
      cruzaDiaAnterior = true;
    }
    const hour = Math.floor(minutoAviso / 60) % 24;
    const minute = minutoAviso % 60;

    const empresaEtiqueta = fav.etiqueta ? `${fav.etiqueta} · ` : '';
    const direccionTexto = servicio.direccion === 'RC' ? 'Rosario → Casilda' : 'Casilda → Rosario';

    for (const dia of fav.diasAviso) {
      let weekday = DIA_A_WEEKDAY[dia];
      if (cruzaDiaAnterior) weekday = diaAnterior(weekday);

      const id = ID_BASE_RECORDATORIOS + (hashInt(`${fav.servicioId}-${dia}`) % ID_RANGO_RECORDATORIOS);
      nuevas.push({
        id,
        title: `🚌 Tu colectivo sale en ${fav.avisoMin} min`,
        body: `${empresaEtiqueta}${servicio.empresa} · ${direccionTexto} · sale ${servicio.sale}`,
        schedule: { on: { weekday, hour, minute } },
      });
    }
  }

  if (nuevas.length === 0) return 0;

  try {
    await LocalNotifications.schedule({
      notifications: nuevas.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        channelId: CANAL_RECORDATORIOS,
        schedule: { on: n.schedule.on, allowWhileIdle: true },
      })),
    });
    return nuevas.length;
  } catch {
    return 0;
  }
}

/** Notificación inmediata para una alerta (paro, cambio de horario, feriado). Web: fallback a Notification API. */
export async function notificarAlerta(alerta: Alerta): Promise<void> {
  if (esNativo()) {
    await asegurarCanales();
    try {
      const id = ID_BASE_ALERTAS + (hashInt(alerta.id) % ID_RANGO_ALERTAS);
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: alerta.titulo,
            body: alerta.detalle ?? '',
            channelId: CANAL_ALERTAS,
          },
        ],
      });
    } catch {
      // no-op
    }
    return;
  }

  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  try {
    new Notification(alerta.titulo, { body: alerta.detalle ?? '' });
  } catch {
    // no-op
  }
}
