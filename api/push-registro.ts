// Función de Vercel: suscribe (o da de baja) un celular o navegador a los avisos de Instagram.
// Recibe el token de FCM que genera la app y lo agrega al tema correspondiente; no se guarda nada más.

import { TEMA_NATIVO, TEMA_WEB, messaging } from './_lib/firebaseAdmin.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request): Promise<Response> {
  let body: { token?: unknown; plataforma?: unknown; activo?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response('JSON inválido', { status: 400, headers: CORS });
  }
  const { token, plataforma, activo } = body;
  if (typeof token !== 'string' || token.length < 20 || token.length > 4096 || !/^[\w:.-]+$/.test(token)) {
    return new Response('token inválido', { status: 400, headers: CORS });
  }
  if (plataforma !== 'web' && plataforma !== 'nativo') return new Response('plataforma inválida', { status: 400, headers: CORS });

  const tema = plataforma === 'web' ? TEMA_WEB : TEMA_NATIVO;
  try {
    const r = activo === false
      ? await messaging().unsubscribeFromTopic([token], tema)
      : await messaging().subscribeToTopic([token], tema);
    if (r.failureCount > 0) return new Response('FCM rechazó el token', { status: 400, headers: CORS });
    return Response.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error('push-registro', e);
    return new Response('no se pudo registrar', { status: 502, headers: CORS });
  }
}
