// Helpers para detectar si corremos dentro de un shell nativo de Capacitor (Android/iOS) o en la web/PWA.

import { Capacitor } from '@capacitor/core';

/** true si la app corre empaquetada en Android o iOS vía Capacitor (no en navegador/PWA). */
export function esNativo(): boolean {
  return Capacitor.isNativePlatform();
}

/** 'android' | 'ios' | 'web' */
export function plataforma(): 'android' | 'ios' | 'web' {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
}
