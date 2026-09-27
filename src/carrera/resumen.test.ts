import { afterEach, describe, expect, it, vi } from 'vitest';
import { resumenPlan } from './resumen';
import { STORAGE_KEY } from './proximaMesa';
import { SUBJECTS } from './data/subjects';

function conProgreso(p: Record<string, string>) {
  const datos: Record<string, string> = { [STORAGE_KEY]: JSON.stringify(p) };
  vi.stubGlobal('localStorage', { getItem: (k: string) => datos[k] ?? null });
}

afterEach(() => vi.unstubAllGlobals());

describe('resumenPlan', () => {
  it('sin avance guardado: 0 aprobadas sobre el total del plan', () => {
    conProgreso({});
    const r = resumenPlan(new Date(2026, 8, 27));
    expect(r.total).toBe(SUBJECTS.length);
    expect(r.aprobadas).toBe(0);
    expect(r.porcentaje).toBe(0);
  });

  it('cuenta aprobadas y regulares y redondea el porcentaje', () => {
    const [a, b, c] = SUBJECTS;
    conProgreso({ [a.code]: 'aprobada', [b.code]: 'aprobada', [c.code]: 'regular' });
    const r = resumenPlan(new Date(2026, 8, 27));
    expect(r.aprobadas).toBe(2);
    expect(r.regulares).toBe(1);
    expect(r.porcentaje).toBe(Math.round((2 / SUBJECTS.length) * 100));
  });

  it('muestra el próximo evento de la facultad vigente', () => {
    conProgreso({});
    expect(resumenPlan(new Date(2026, 8, 27)).evento?.dateStr).toBe('2026-10-01');
  });
});
