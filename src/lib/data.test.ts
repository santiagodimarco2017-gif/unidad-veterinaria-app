// Integración con los datos incluidos (src/data).
import { describe, expect, it } from 'vitest';
import { FERIADOS_INCLUIDOS, SERVICIOS_INCLUIDOS, SNAPSHOT_FECHA } from '../data';
import { proximasSalidas, serviciosDelDia } from './schedule';

describe('SERVICIOS_INCLUIDOS', () => {
  it('ids únicos, horas HH:MM, ordenados', () => {
    expect(SERVICIOS_INCLUIDOS.length).toBeGreaterThan(100);
    expect(new Set(SERVICIOS_INCLUIDOS.map((s) => s.id)).size).toBe(SERVICIOS_INCLUIDOS.length);
    for (const s of SERVICIOS_INCLUIDOS) {
      expect(s.sale).toMatch(/^\d{2}:\d{2}$/);
      expect(s.llega).toMatch(/^\d{2}:\d{2}$/);
      expect(s.id.startsWith(`${s.direccion}-${s.empresa}-${s.sale}-`)).toBe(true);
    }
    const claves = SERVICIOS_INCLUIDOS.map((s) => `${s.direccion} ${s.sale}`);
    expect(claves).toEqual([...claves].sort());
  });

  it('el 33/9 municipal trae paradas', () => {
    const municipales = SERVICIOS_INCLUIDOS.filter((s) => s.fuente === 'municipio' || s.fuente === 'ambas');
    expect(municipales.length).toBeGreaterThan(0);
    expect(municipales.every((s) => s.empresa === 'linea339' && (s.paradas?.length ?? 0) > 1)).toBe(true);
  });

  it('SNAPSHOT_FECHA es ISO', () => {
    expect(Number.isNaN(Date.parse(SNAPSHOT_FECHA))).toBe(false);
  });

  it('el 12/10/2026 (feriado) solo corren servicios con feriados', () => {
    const lunesFeriado = new Date(2026, 9, 12);
    const del = serviciosDelDia(SERVICIOS_INCLUIDOS, 'CR', lunesFeriado, FERIADOS_INCLUIDOS);
    expect(del.length).toBeGreaterThan(0);
    expect(del.every((s) => s.dias.feriados)).toBe(true);
    expect(proximasSalidas(SERVICIOS_INCLUIDOS, 'RC', new Date(2026, 9, 11, 23, 50), FERIADOS_INCLUIDOS, 5)).toHaveLength(5);
  });
});
