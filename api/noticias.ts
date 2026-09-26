// Función de Vercel: RSS de Google News para detectar paros en la versión web (el RSS no habilita CORS).
// Solo acepta las búsquedas fijas de la app (por índice): no es un proxy abierto.

const QUERIES = ['paro colectivos Rosario', 'paro UTA Santa Fe', 'colectivos Casilda'];

export async function GET(request: Request): Promise<Response> {
  const i = Number(new URL(request.url).searchParams.get('q'));
  const query = QUERIES[i];
  if (!Number.isInteger(i) || !query) return new Response('q inválido', { status: 400 });

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=es-419&gl=AR&ceid=AR:es-419`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return new Response(`google news respondió ${res.status}`, { status: 502 });
    return new Response(await res.text(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new Response('no se pudo consultar las noticias', { status: 504 });
  }
}
