// Avisos push cuando @unidadvet publica en Instagram. El servidor (api/instagram-avisos.ts) detecta el
// posteo y lo manda por Firebase Cloud Messaging; acá se pide permiso, se obtiene el token del
// dispositivo y se lo suscribe con /api/push-registro. Tocar el aviso abre el link de la descripción
// (o el posteo, si no trae link).
//
// Variables de build (Vercel / .env.local):
//   VITE_FIREBASE_VAPID_KEY  clave pública de Web Push (Firebase → Cloud Messaging → Certificados web push)
//   VITE_API_BASE            URL de la web en Vercel; la necesita la app nativa para llegar a /api/*.

import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import firebaseConfig from '../carrera/firebase-applet-config.json';
import { cargar, guardar } from './storage';
import { esNativo } from './plataforma';

const CLAVE = 'avisos_instagram';
const CANAL = 'instagram';
const ID_BASE_INSTAGRAM = 40_000;
const SW_URL = 'avisos-sw.js';
const SW_SCOPE = './avisos-push/';

export type ResultadoAvisos = 'ok' | 'denegado' | 'no-soportado' | 'sin-configurar' | 'error';

interface Guardado {
  activo: boolean;
  token?: string;
}

function urlApi(ruta: string): string | null {
  const base = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '');
  if (esNativo()) return base ? `${base}${ruta}` : null;
  return base ? `${base}${ruta}` : ruta;
}

export async function avisosInstagramActivos(): Promise<boolean> {
  return (await cargar<Guardado>(CLAVE, { activo: false })).activo;
}

async function registrarEnServidor(token: string, activo: boolean): Promise<boolean> {
  const url = urlApi('/api/push-registro');
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, plataforma: esNativo() ? 'nativo' : 'web', activo }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Firebase se carga recién al usarlo, para no demorar el arranque (igual que Carrera). */
async function firebaseMessaging() {
  const [{ initializeApp, getApps }, fm] = await Promise.all([import('firebase/app'), import('firebase/messaging')]);
  if (!(await fm.isSupported().catch(() => false))) return null;
  return { fm, messaging: fm.getMessaging(getApps()[0] ?? initializeApp(firebaseConfig)) };
}

function abrirLink(link: unknown): void {
  if (typeof link !== 'string' || !/^https?:\/\//.test(link)) return;
  // En Capacitor, window.open con una URL externa abre el navegador del sistema (o la app de Instagram).
  window.open(link, '_blank', 'noopener');
}

// ---------- Nativo (Android / iOS) ----------

async function tokenNativo(): Promise<string | ResultadoAvisos> {
  let permiso = await PushNotifications.checkPermissions();
  if (permiso.receive === 'prompt' || permiso.receive === 'prompt-with-rationale') {
    permiso = await PushNotifications.requestPermissions();
  }
  if (permiso.receive !== 'granted') return 'denegado';
  try {
    await PushNotifications.createChannel({
      id: CANAL,
      name: 'Unidad Veterinaria en Instagram',
      description: 'Charlas, eventos y deportes publicados por @unidadvet',
      importance: 4,
      visibility: 1,
      vibration: true,
    });
  } catch {
    // iOS no tiene canales.
  }
  return new Promise((resolve) => {
    const limpiar = () => { void ok.then((h) => h.remove()); void mal.then((h) => h.remove()); };
    const ok = PushNotifications.addListener('registration', ({ value }) => { limpiar(); resolve(value); });
    const mal = PushNotifications.addListener('registrationError', () => { limpiar(); resolve('error'); });
    PushNotifications.register().catch(() => { limpiar(); resolve('error'); });
  });
}

// ---------- Web / PWA ----------

async function tokenWeb(): Promise<string | ResultadoAvisos> {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;
  if (!vapidKey) return 'sin-configurar';
  const fb = 'serviceWorker' in navigator && typeof Notification !== 'undefined' ? await firebaseMessaging() : null;
  // iPhone: solo funciona con la web instalada en la pantalla de inicio (iOS 16.4+).
  if (!fb) return 'no-soportado';
  const permiso = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
  if (permiso !== 'granted') return 'denegado';
  const registro = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  return fb.fm.getToken(fb.messaging, { vapidKey, serviceWorkerRegistration: registro });
}

/** Activa o desactiva los avisos. Devuelve 'ok' si quedó como se pidió. */
export async function cambiarAvisosInstagram(activo: boolean): Promise<ResultadoAvisos> {
  const previo = await cargar<Guardado>(CLAVE, { activo: false });
  if (!activo) {
    if (previo.token) await registrarEnServidor(previo.token, false);
    await guardar<Guardado>(CLAVE, { activo: false });
    return 'ok';
  }
  if (!urlApi('/api/push-registro')) return 'sin-configurar';
  try {
    const token = esNativo() ? await tokenNativo() : await tokenWeb();
    if (token === 'ok' || token === 'denegado' || token === 'no-soportado' || token === 'sin-configurar' || token === 'error') {
      return token;
    }
    if (!(await registrarEnServidor(token, true))) return 'error';
    await guardar<Guardado>(CLAVE, { activo: true, token });
    return 'ok';
  } catch {
    return 'error';
  }
}

/**
 * Escucha los avisos mientras la app está abierta y los toques sobre la notificación.
 * Llamar una vez al iniciar. Devuelve la función para dejar de escuchar.
 */
export function escucharAvisosInstagram(): () => void {
  if (esNativo()) {
    const handles = [
      // Toque sobre la notificación push (app en segundo plano o cerrada).
      PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => abrirLink(notification.data?.link)),
      // Con la app abierta Android no muestra el push: se muestra como notificación local.
      PushNotifications.addListener('pushNotificationReceived', (n) => {
        void LocalNotifications.schedule({
          notifications: [{
            id: ID_BASE_INSTAGRAM + (Date.now() % 10_000),
            title: n.title ?? n.data?.titulo ?? 'Unidad Veterinaria',
            body: n.body ?? n.data?.cuerpo ?? '',
            channelId: CANAL,
            extra: { link: n.data?.link },
          }],
        }).catch(() => {});
      }),
      LocalNotifications.addListener('localNotificationActionPerformed', ({ notification }) => {
        const extra = notification.extra as { link?: unknown } | undefined;
        if (extra?.link) abrirLink(extra.link);
      }),
    ];
    return () => handles.forEach((h) => void h.then((x) => x.remove()).catch(() => {}));
  }

  // Web con la pestaña abierta: FCM entrega el mensaje acá en vez de al service worker.
  let cancelar = () => {};
  void (async () => {
    if (!(await avisosInstagramActivos())) return;
    const fb = await firebaseMessaging();
    if (!fb) return;
    cancelar = fb.fm.onMessage(fb.messaging, ({ data }) => {
      if (!data || Notification.permission !== 'granted') return;
      const n = new Notification(data.titulo ?? 'Unidad Veterinaria', { body: data.cuerpo, icon: 'pwa-192.png', image: data.imagen || undefined } as NotificationOptions);
      n.onclick = () => { abrirLink(data.link); n.close(); };
    });
  })();
  return () => cancelar();
}
