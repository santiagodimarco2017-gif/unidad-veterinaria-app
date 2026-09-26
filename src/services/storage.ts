// Persistencia simple clave/valor sobre @capacitor/preferences (funciona también en web).

import { Preferences } from '@capacitor/preferences';

/** Claves reservadas usadas por toda la app. Mantener estables entre versiones. */
export const CLAVES = {
  FAVORITOS: 'favoritos',
  AJUSTES: 'ajustes',
  CACHE_SERVICIOS: 'cache_servicios',
  CACHE_FERIADOS: 'cache_feriados',
  ALERTAS_VISTAS: 'alertas_vistas',
  ALERTAS: 'alertas',
  ULTIMA_SYNC: 'ultima_sync',
} as const;

export type ClaveStorage = (typeof CLAVES)[keyof typeof CLAVES];

/** Lee y parsea JSON desde preferences; devuelve `def` si no existe o si el JSON es inválido. */
export async function cargar<T>(clave: string, def: T): Promise<T> {
  try {
    const { value } = await Preferences.get({ key: clave });
    if (value == null) return def;
    return JSON.parse(value) as T;
  } catch {
    return def;
  }
}

/** Serializa y guarda un valor en preferences. */
export async function guardar<T>(clave: string, valor: T): Promise<void> {
  try {
    await Preferences.set({ key: clave, value: JSON.stringify(valor) });
  } catch {
    // Almacenamiento no disponible: se ignora silenciosamente (modo degradado).
  }
}

/** Elimina una clave de preferences. */
export async function borrar(clave: string): Promise<void> {
  try {
    await Preferences.remove({ key: clave });
  } catch {
    // no-op
  }
}
