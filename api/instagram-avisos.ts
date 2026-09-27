// Función de Vercel: se fija si @unidadvet publicó algo nuevo en el feed y manda la notificación push
// (app Android/iOS por FCM y web/PWA por Web Push de FCM). La llama cada 15 min el workflow
// .github/workflows/instagram-avisos.yml con `Authorization: Bearer $CRON_SECRET`.
//
// Variables en Vercel: IG_ACCESS_TOKEN (token de la API de Instagram de la cuenta profesional),
// FIREBASE_SERVICE_ACCOUNT y CRON_SECRET. El token dura 60 días: acá se renueva solo cada semana y la
// versión renovada se guarda en Firestore (avisos_instagram/estado).

import { armarAviso, masReciente, posteosNuevos, type Aviso, type PosteoInstagram } from './_lib/instagram.js';
import { TEMA_NATIVO, TEMA_WEB, firestore, messaging } from './_lib/firebaseAdmin.js';

const API = 'https://graph.instagram.com/v23.0';
const CAMPOS = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
const RENOVAR_CADA_MS = 7 * 24 * 60 * 60 * 1000;

interface Estado {
  /** Timestamp del último posteo ya avisado (o visto en la primera corrida). */
  ultimoTimestamp?: string;
  token?: string;
  /** Últimos 8 caracteres del IG_ACCESS_TOKEN del que salió `token`: si cambia la variable, se usa la nueva. */
  tokenOrigen?: string;
  tokenRenovado?: string;
}

async function leerPosteos(token: string): Promise<PosteoInstagram[]> {
  const res = await fetch(`${API}/me/media?fields=${CAMPOS}&limit=10&access_token=${encodeURIComponent(token)}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Instagram respondió ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { data?: PosteoInstagram[] };
  return json.data ?? [];
}

async function renovarToken(token: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return null;
    return ((await res.json()) as { access_token?: string }).access_token ?? null;
  } catch {
    return null;
  }
}

async function enviar(aviso: Aviso): Promise<void> {
  const data = { link: aviso.link, posteoId: aviso.posteoId, titulo: aviso.titulo, cuerpo: aviso.cuerpo, imagen: aviso.imagen ?? '' };
  await messaging().send({
    topic: TEMA_NATIVO,
    notification: { title: aviso.titulo, body: aviso.cuerpo, imageUrl: aviso.imagen },
    data,
    android: {
      priority: 'high',
      notification: { channelId: 'instagram', icon: 'ic_stat_bus', color: '#068136' },
    },
    apns: { payload: { aps: { sound: 'default' } } },
  });
  // Web: solo datos, así el service worker (public/avisos-sw.js) arma la notificación y abre el link.
  await messaging().send({ topic: TEMA_WEB, data, webpush: { headers: { Urgency: 'high' } } });
}

export async function GET(request: Request): Promise<Response> {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get('authorization') !== `Bearer ${secreto}`) {
    return new Response('no autorizado', { status: 401 });
  }
  const tokenEnv = process.env.IG_ACCESS_TOKEN;
  if (!tokenEnv) return new Response('Falta IG_ACCESS_TOKEN', { status: 500 });

  try {
    const ref = firestore().doc('avisos_instagram/estado');
    const estado = ((await ref.get()).data() ?? {}) as Estado;
    const origen = tokenEnv.slice(-8);
    let token = estado.token && estado.tokenOrigen === origen ? estado.token : tokenEnv;
    const cambios: Estado = {};

    // Renovar el token antes de que venza (Instagram permite renovarlo si tiene más de 24 h).
    const renovado = estado.tokenOrigen === origen && estado.tokenRenovado ? Date.parse(estado.tokenRenovado) : 0;
    if (Date.now() - renovado > RENOVAR_CADA_MS) {
      const nuevo = await renovarToken(token);
      if (nuevo) {
        token = nuevo;
        Object.assign(cambios, { token: nuevo, tokenOrigen: origen, tokenRenovado: new Date().toISOString() });
      }
    }

    const posteos = await leerPosteos(token);
    const ultimo = masReciente(posteos);
    const enviados: string[] = [];

    if (!estado.ultimoTimestamp) {
      // Primera corrida: se toma lo publicado hasta hoy como visto, sin avisar posteos viejos.
      if (ultimo) cambios.ultimoTimestamp = ultimo;
    } else {
      const nuevos = posteosNuevos(posteos, estado.ultimoTimestamp);
      for (const p of nuevos) {
        await enviar(armarAviso(p));
        // Se guarda posteo a posteo: si falla un envío, el siguiente intento no repite los ya enviados.
        await ref.set({ ultimoTimestamp: p.timestamp }, { merge: true });
        enviados.push(p.id);
      }
    }

    if (Object.keys(cambios).length > 0) await ref.set(cambios, { merge: true });
    return Response.json({ ok: true, revisados: posteos.length, enviados, primeraCorrida: !estado.ultimoTimestamp });
  } catch (e) {
    console.error('instagram-avisos', e);
    return new Response(`error: ${String(e).slice(0, 300)}`, { status: 502 });
  }
}
