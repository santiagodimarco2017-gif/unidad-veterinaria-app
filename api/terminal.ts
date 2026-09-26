// Función de Vercel: trae el buscador de la Terminal de Ómnibus de Rosario para la versión web
// (el sitio de la terminal no habilita CORS). Solo acepta los dos sentidos fijos: no es un proxy abierto.
// En la app nativa no se usa: allí CapacitorHttp consulta la terminal directamente.

const URLS: Record<string, string> = {
  rc: 'http://www.terminalrosario.gob.ar/buscador/2000/221/rosario-casilda/',
  cr: 'http://www.terminalrosario.gob.ar/buscador/221/2000/casilda-rosario/',
};

export async function GET(request: Request): Promise<Response> {
  const sentido = new URL(request.url).searchParams.get('sentido') ?? '';
  const url = URLS[sentido];
  if (!url) return new Response('sentido debe ser rc o cr', { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'UnidadVeterinaria/1.0 (+https://github.com/unidadveterinaria-arch)' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return new Response(`terminal respondió ${res.status}`, { status: 502 });
    return new Response(await res.text(), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // 30 min en la CDN de Vercel; mientras revalida sirve la copia anterior hasta 1 día.
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response('no se pudo consultar la terminal', { status: 504 });
  }
}
