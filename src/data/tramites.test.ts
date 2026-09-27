import { describe, expect, it } from 'vitest';
import { LUGARES } from './mapaFacu';
import { OFICINAS, TRAMITES } from './tramites';

const numeros = new Set(LUGARES.map((l) => l.n));

describe('guía de trámites', () => {
  it('cada oficina de un paso existe en el mapa', () => {
    const lugares = [...TRAMITES.flatMap((t) => t.pasos.map((p) => p.lugar)), ...OFICINAS.map((o) => o.lugar)]
      .filter((n): n is number => n !== undefined);
    expect(lugares.length).toBeGreaterThan(0);
    for (const n of lugares) expect(numeros.has(n), `lugar ${n}`).toBe(true);
  });

  it('los ids son únicos y los enlaces son https', () => {
    expect(new Set(TRAMITES.map((t) => t.id)).size).toBe(TRAMITES.length);
    const urls = TRAMITES.flatMap((t) => [t.fuente.url, ...t.pasos.flatMap((p) => (p.enlace ? [p.enlace.url] : []))]);
    for (const u of urls) expect(u.startsWith('https://'), u).toBe(true);
  });
});
