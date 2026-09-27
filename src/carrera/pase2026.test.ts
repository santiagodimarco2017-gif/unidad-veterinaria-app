import { describe, expect, it } from 'vitest';
import { estadoPlazos, simularPase } from './pase2026';
import { MATERIAS_2026, ORIENTACIONES, RESUMEN_2026, origenes2009 } from './data/plan2026';

describe('datos del Plan 2026', () => {
  it('las materias más una orientación suman las 4.000 hs del plan', () => {
    expect(MATERIAS_2026.reduce((s, m) => s + m.horas, 0) + RESUMEN_2026.orientacion.total).toBe(RESUMEN_2026.horas);
  });

  it('las correlativas apuntan a materias que existen y son de años anteriores o del mismo año', () => {
    const porCodigo = new Map(MATERIAS_2026.map((m) => [m.code, m]));
    for (const m of MATERIAS_2026) {
      for (const c of [...m.regulares, ...m.aprobadas]) {
        expect(porCodigo.has(c), `${m.code} → ${c}`).toBe(true);
        expect(porCodigo.get(c)!.anio).toBeLessThanOrEqual(m.anio);
      }
    }
  });

  it('hay 12 sub orientaciones y cada una trae su práctica de 200 hs', () => {
    const subs = ORIENTACIONES.flatMap((o) => o.subs);
    expect(subs).toHaveLength(12);
    for (const s of subs) expect(s.cursos.some((c) => c.obligatorio && c.horas === 200)).toBe(true);
  });

  it('Histofisiología viene de Histología II y Fisiología', () => {
    expect(origenes2009('2.9').map((o) => o.code).sort()).toEqual(['2.12', '2.9.1']);
  });
});

describe('simularPase', () => {
  it('Fisiología aprobada da Histofisiología total; regular, sólo parcial', () => {
    expect(simularPase({ '2.12': 'aprobada' }).porCodigo['2.9'].estado).toBe('aprobada');
    expect(simularPase({ '2.12': 'regular' }).porCodigo['2.9'].estado).toBe('regular-parcial');
  });

  it('se queda con la mejor equivalencia entre varias materias', () => {
    const r = simularPase({ '3.19.1': 'aprobada', '3.22.2': 'aprobada' });
    expect(r.porCodigo['3.17']).toEqual({ estado: 'aprobada', desde: ['3.19.1', '3.22.2'] });
    expect(r.aprobadas).toBe(1);
    expect(r.horas).toBe(190);
  });

  it('las pendientes no cuentan', () => {
    expect(simularPase({ '1.1.1': 'pendiente' }).aprobadas).toBe(0);
  });
});

describe('estadoPlazos', () => {
  it('marca qué falta para no pasar automáticamente al Plan 2026', () => {
    const [art6, art7] = estadoPlazos({ '1.2.1': 'regular', '2.9.1': 'aprobada', '2.8.1': 'regular' }, new Date(2026, 8, 27));
    expect(art6.cumple).toBe(false);
    expect(art6.faltan).toEqual(['1.2.1']);
    expect(art7.faltan).toEqual(['2.12']);
    expect(art6.dias).toBe(461);
  });
});
