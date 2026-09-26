// Puentes con Capacitor: háptica, compartir, calendario y ubicación. Nunca bloquean la UI.
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { Geolocation } from '@capacitor/geolocation';
import { esNativo } from '../services/plataforma';
import type { Direccion } from '../lib/types';

export function haptic(tipo: 'leve' | 'medio' = 'leve'): void {
  if (!esNativo()) return;
  Haptics.impact({ style: tipo === 'leve' ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {});
}

/** Comparte un texto. Devuelve 'compartido' | 'copiado' | 'fallo' */
export async function compartirTexto(texto: string, titulo = 'Unidad Veterinaria'): Promise<'compartido' | 'copiado' | 'fallo'> {
  try {
    if (esNativo() || (typeof navigator !== 'undefined' && 'share' in navigator)) {
      await Share.share({ title: titulo, text: texto, dialogTitle: titulo });
      return 'compartido';
    }
  } catch (e) {
    // Cancelado por el usuario: no es un error visible.
    if (String(e).toLowerCase().includes('cancel') || String(e).includes('AbortError')) return 'compartido';
  }
  try {
    await navigator.clipboard.writeText(texto);
    return 'copiado';
  } catch {
    return 'fallo';
  }
}

/** Descarga un .ics en web; en nativo comparte el texto del evento */
export async function agregarAlCalendario(ics: string, textoLegible: string, nombre = 'colectivo.ics'): Promise<boolean> {
  if (esNativo()) {
    const r = await compartirTexto(textoLegible, 'Agregar al calendario');
    return r !== 'fallo';
  }
  try {
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return true;
  } catch {
    return false;
  }
}

const CASILDA = { lat: -33.0442, lon: -61.1681 };
const ROSARIO = { lat: -32.9468, lon: -60.6393 };

const dist2 = (a: { lat: number; lon: number }, b: { lat: number; lon: number }): number => {
  const dLat = a.lat - b.lat;
  const dLon = (a.lon - b.lon) * Math.cos((a.lat * Math.PI) / 180);
  return dLat * dLat + dLon * dLon;
};

/**
 * Sentido sugerido según ubicación: cerca de Casilda → CR, si no → RC.
 * Solo consulta si el permiso ya está otorgado (o `pedir` = true). null si no se pudo.
 */
export async function direccionPorUbicacion(pedir = false): Promise<Direccion | null> {
  try {
    let estado: string = 'prompt';
    try {
      estado = (await Geolocation.checkPermissions()).location;
    } catch {
      estado = 'prompt';
    }
    if (estado !== 'granted') {
      if (!pedir) return null;
      if (esNativo()) {
        estado = (await Geolocation.requestPermissions({ permissions: ['coarseLocation'] })).coarseLocation;
        if (estado !== 'granted') return null;
      }
    }
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60_000 });
    const aqui = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    return dist2(aqui, CASILDA) <= dist2(aqui, ROSARIO) ? 'CR' : 'RC';
  } catch {
    return null;
  }
}
