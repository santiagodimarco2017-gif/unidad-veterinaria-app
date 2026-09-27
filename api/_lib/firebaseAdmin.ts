// Firebase Admin para las funciones de Vercel. Credenciales: variable FIREBASE_SERVICE_ACCOUNT con el JSON
// completo de la cuenta de servicio (Firebase → Configuración del proyecto → Cuentas de servicio).

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

/** Tema de FCM al que se suscriben los celulares con la app (Android/iOS). */
export const TEMA_NATIVO = 'instagram';
/** Tema de FCM para la web/PWA: recibe mensajes solo de datos y el service worker arma la notificación. */
export const TEMA_WEB = 'instagram-web';
/** Misma base de Firestore que usa la app (src/carrera/firebase-applet-config.json → firestoreDatabaseId). */
const BASE_FIRESTORE = 'ai-studio-correlativasfcvu-595cac54-0710-4242-b527-7903ffa9e7fb';

function app(): App {
  const existente = getApps()[0];
  if (existente) return existente;
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!json) throw new Error('Falta la variable FIREBASE_SERVICE_ACCOUNT');
  return initializeApp({ credential: cert(JSON.parse(json)) });
}

export function firestore(): Firestore {
  return getFirestore(app(), BASE_FIRESTORE);
}

export function messaging(): Messaging {
  return getMessaging(app());
}
