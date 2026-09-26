// Clima actual vía Open-Meteo (sin API key). Cache en memoria de 30 minutos por ciudad.

export interface Clima {
  tempC: number;
  codigo: number;
  descripcion: string;
  lluviaProxHoras: boolean;
}

const COORDENADAS: Record<'Rosario' | 'Casilda', { lat: number; lon: number }> = {
  Rosario: { lat: -32.9468, lon: -60.6393 },
  Casilda: { lat: -33.0442, lon: -61.1681 },
};

const TREINTA_MIN_MS = 30 * 60 * 1000;
const TIMEOUT_MS = 10_000;

/** Descripción en español + emoji para códigos WMO (weathercode de Open-Meteo). */
function describirCodigo(codigo: number): string {
  const mapa: Record<number, string> = {
    0: 'Despejado ☀️',
    1: 'Mayormente despejado 🌤️',
    2: 'Parcialmente nublado ⛅',
    3: 'Nublado ☁️',
    45: 'Niebla 🌫️',
    48: 'Niebla escarchada 🌫️',
    51: 'Llovizna débil 🌦️',
    53: 'Llovizna 🌦️',
    55: 'Llovizna intensa 🌧️',
    56: 'Llovizna helada 🌧️',
    57: 'Llovizna helada intensa 🌧️',
    61: 'Lluvia débil 🌧️',
    63: 'Lluvia 🌧️',
    65: 'Lluvia intensa 🌧️',
    66: 'Lluvia helada 🌧️',
    67: 'Lluvia helada intensa 🌧️',
    71: 'Nevada débil 🌨️',
    73: 'Nevada 🌨️',
    75: 'Nevada intensa 🌨️',
    77: 'Granos de nieve 🌨️',
    80: 'Chubascos débiles 🌦️',
    81: 'Chubascos 🌧️',
    82: 'Chubascos intensos ⛈️',
    85: 'Chubascos de nieve débiles 🌨️',
    86: 'Chubascos de nieve intensos 🌨️',
    95: 'Tormenta ⛈️',
    96: 'Tormenta con granizo ⛈️',
    99: 'Tormenta fuerte con granizo ⛈️',
  };
  return mapa[codigo] ?? 'Sin datos 🌡️';
}

/** Códigos WMO que indican lluvia/nieve (para decidir "lluviaProxHoras"). */
function esCondicionDeAgua(codigo: number): boolean {
  return (codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 99);
}

interface CacheEntry {
  obtenidoEn: number;
  valor: Clima;
}

const cacheEnMemoria = new Map<'Rosario' | 'Casilda', CacheEntry>();

async function fetchConTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

interface RespuestaOpenMeteo {
  current_weather?: { temperature: number; weathercode: number };
  hourly?: { time: string[]; precipitation_probability: number[] };
}

/** Clima actual para 'Rosario' o 'Casilda'. Devuelve null si falla la red. Cachea 30 min en memoria. */
export async function climaActual(ciudad: 'Rosario' | 'Casilda'): Promise<Clima | null> {
  const cacheado = cacheEnMemoria.get(ciudad);
  if (cacheado && Date.now() - cacheado.obtenidoEn < TREINTA_MIN_MS) {
    return cacheado.valor;
  }

  const { lat, lon } = COORDENADAS[ciudad];
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&hourly=precipitation_probability&forecast_days=1&timezone=auto`;

  try {
    const res = await fetchConTimeout(url, TIMEOUT_MS);
    if (!res.ok) return cacheado?.valor ?? null;
    const json = (await res.json()) as RespuestaOpenMeteo;
    if (!json.current_weather) return cacheado?.valor ?? null;

    let lluviaProxHoras = esCondicionDeAgua(json.current_weather.weathercode);
    if (json.hourly?.time && json.hourly.precipitation_probability) {
      const ahoraMs = Date.now();
      const proximas = json.hourly.time
        .map((t, i) => ({ t: new Date(t).getTime(), p: json.hourly!.precipitation_probability[i] }))
        .filter((x) => x.t >= ahoraMs && x.t <= ahoraMs + 6 * 60 * 60 * 1000);
      if (proximas.some((x) => x.p >= 50)) lluviaProxHoras = true;
    }

    const valor: Clima = {
      tempC: Math.round(json.current_weather.temperature),
      codigo: json.current_weather.weathercode,
      descripcion: describirCodigo(json.current_weather.weathercode),
      lluviaProxHoras,
    };
    cacheEnMemoria.set(ciudad, { obtenidoEn: Date.now(), valor });
    return valor;
  } catch {
    return cacheado?.valor ?? null;
  }
}
