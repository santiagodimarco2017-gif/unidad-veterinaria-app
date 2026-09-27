// Lógica pura de los avisos de Instagram (sin red): qué posteos son nuevos, qué link traen y qué texto
// lleva la notificación. La usa api/instagram-avisos.ts y se prueba en instagram.test.ts.

export interface PosteoInstagram {
  id: string;
  caption?: string;
  media_type?: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string; // ISO, p.ej. "2026-09-26T21:14:03+0000"
}

export interface Aviso {
  titulo: string;
  cuerpo: string;
  /** Adónde lleva tocar la notificación: el link del posteo si trae uno, si no el posteo en Instagram. */
  link: string;
  /** true si `link` salió de la descripción (charla con inscripción, formulario, streaming, etc.). */
  linkDeDescripcion: boolean;
  imagen?: string;
  posteoId: string;
}

/** Máximo de posteos que se avisan en una sola corrida (evita una ráfaga si el cron estuvo caído). */
export const MAX_AVISOS_POR_CORRIDA = 3;

// URLs con esquema, con www. o con acortadores/dominios comunes que se suelen pegar sin https://.
const RE_URL =
  /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|(?:forms\.gle|bit\.ly|tinyurl\.com|linktr\.ee|meet\.google\.com|zoom\.us|us\d{2}web\.zoom\.us|youtu\.be|youtube\.com|docs\.google\.com|fveter\.unr\.edu\.ar|unr\.edu\.ar|chat\.whatsapp\.com|wa\.me)\/[^\s<>"']*)/i;

/** Primer link que aparece en la descripción, normalizado a https. null si no hay. */
export function extraerLink(caption: string | undefined): string | null {
  if (!caption) return null;
  const m = RE_URL.exec(caption);
  if (!m) return null;
  // Signos de puntuación pegados al final ("...inscribite en forms.gle/abc!") no son parte del link.
  let url = m[0].replace(/[).,;:!?¡¿…»"'\]]+$/u, '');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    return u.toString();
  } catch {
    return null;
  }
}

function ms(ts: string): number {
  // Instagram devuelve "+0000" (sin ":"), que Date.parse no siempre acepta.
  return Date.parse(ts.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'));
}

/**
 * Posteos publicados después de `ultimoTimestamp`, del más viejo al más nuevo, como mucho
 * MAX_AVISOS_POR_CORRIDA (los más recientes).
 */
export function posteosNuevos(posteos: PosteoInstagram[], ultimoTimestamp: string): PosteoInstagram[] {
  const corte = ms(ultimoTimestamp);
  return posteos
    .filter((p) => ms(p.timestamp) > corte)
    .sort((a, b) => ms(a.timestamp) - ms(b.timestamp))
    .slice(-MAX_AVISOS_POR_CORRIDA);
}

/** Timestamp del posteo más reciente (o null si la lista viene vacía). */
export function masReciente(posteos: PosteoInstagram[]): string | null {
  let mejor: string | null = null;
  for (const p of posteos) if (mejor == null || ms(p.timestamp) > ms(mejor)) mejor = p.timestamp;
  return mejor;
}

function recortar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max - 1).trimEnd()}…`;
}

export function armarAviso(p: PosteoInstagram): Aviso {
  const link = extraerLink(p.caption);
  // Primer renglón con texto de la descripción, sin hashtags sueltos.
  const primerRenglon =
    (p.caption ?? '')
      .split('\n')
      .map((l) => l.replace(/(^|\s)#[\p{L}\d_]+/gu, '').trim())
      .find((l) => l.length > 0) ?? '';
  const base = primerRenglon ? recortar(primerRenglon, 110) : 'Mirá la nueva publicación en Instagram.';
  return {
    titulo: 'Unidad Veterinaria publicó en Instagram',
    cuerpo: link ? `${base}\nTocá para abrir el link.` : base,
    link: link ?? p.permalink,
    linkDeDescripcion: link != null,
    imagen: p.media_type === 'VIDEO' ? p.thumbnail_url : p.media_url,
    posteoId: p.id,
  };
}
