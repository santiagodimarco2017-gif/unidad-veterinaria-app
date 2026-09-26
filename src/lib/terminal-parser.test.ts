import { describe, expect, it } from 'vitest';
import { empresaDesdeNombre, parseResultados, snapshotAServicios } from './terminal-parser';
import type { TerminalSnapshot } from './terminal-parser';
import snapshot from '../data/terminal-snapshot.json';
// ?raw: sin dependencias de Node (tsconfig.app solo trae tipos de vite/client)
import htmlRC from './__fixtures__/term_rc.html?raw';
import htmlCR from './__fixtures__/term_cr.html?raw';

describe('parseResultados (HTML real)', () => {
  const rc = parseResultados(htmlRC, 'RC');
  const cr = parseResultados(htmlCR, 'CR');

  it('parsea todos los servicios', () => {
    expect(rc).toHaveLength(60);
    expect(cr).toHaveLength(59);
  });

  it('primera fila R→C: Los Ranqueles 00:30 solo lunes', () => {
    expect(rc[0]).toMatchObject({
      id: 'RC-ranqueles-00:30-10000000',
      direccion: 'RC',
      empresa: 'ranqueles',
      sale: '00:30',
      llega: '01:40',
      tipoServicio: 'Aire acondicionado',
      observaciones: '',
      fuente: 'terminal',
      viajeId: 17210,
    });
    expect(rc[0].dias).toEqual({
      lun: true, mar: false, mie: false, jue: false, vie: false, sab: false, dom: false, feriados: false,
    });
  });

  it('mapea las 7 empresas sin caer en "otra"', () => {
    const empresas = new Set([...rc, ...cr].map((s) => s.empresa));
    expect([...empresas].sort()).toEqual(
      ['arito', 'flechabus', 'laverde', 'linea339', 'nandu', 'ranqueles', 'viatac'],
    );
  });

  it('ids únicos y horas HH:MM', () => {
    const all = [...rc, ...cr];
    expect(new Set(all.map((s) => s.id)).size).toBe(all.length);
    for (const s of all) {
      expect(s.sale).toMatch(/^\d{2}:\d{2}$/);
      expect(s.llega).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  it('coincide con el snapshot generado por tools/scrape-terminal.mjs', () => {
    const snap = snapshotAServicios(snapshot as TerminalSnapshot);
    expect(snap.filter((s) => s.direccion === 'RC')).toEqual(rc);
    expect(snap.filter((s) => s.direccion === 'CR')).toEqual(cr);
  });

  it('HTML sin tabla → []', () => {
    expect(parseResultados('<html></html>', 'RC')).toEqual([]);
  });
});

describe('empresaDesdeNombre', () => {
  it.each([
    ['33/9 Azul América', 'linea339'],
    ['33/9 AZUL AMERICA', 'linea339'],
    ['Los Ranqueles', 'ranqueles'],
    ['Arito', 'arito'],
    ['La Verde', 'laverde'],
    ['VIA TAC', 'viatac'],
    ['Vía Tac', 'viatac'],
    ['Ñandu del Sur', 'nandu'],
    ['ÑANDÚ DEL SUR', 'nandu'],
    ['Flechabus', 'flechabus'],
    ['Chevallier', 'otra'],
  ] as const)('%s → %s', (nombre, id) => {
    expect(empresaDesdeNombre(nombre)).toBe(id);
  });
});
