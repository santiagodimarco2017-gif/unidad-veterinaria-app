import { describe, expect, it } from 'vitest';
import type { DiasServicio, EmpresaId, Servicio } from './types';
import { opcionesParaLlegar, parsearHoraMesa } from './comoLlego';

const KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', 'feriados'] as const;
const dias = (mask: string): DiasServicio =>
  Object.fromEntries(KEYS.map((k, i) => [k, mask[i] === '1'])) as DiasServicio;

function rc(sale: string, llega: string, empresa: EmpresaId = 'linea339', mask = '11111000'): Servicio {
  return {
    id: `RC-${empresa}-${sale}-${mask}`,
    direccion: 'RC',
    empresa,
    sale,
    llega,
    dias: dias(mask),
    tipoServicio: '',
    observaciones: '',
    fuente: 'terminal',
  };
}

const SERVICIOS = [
  rc('05:30', '06:40'),
  rc('06:00', '07:05', 'arito'),
  rc('06:45', '07:55'),
  rc('07:00', '08:10'),
  rc('10:00', '11:10'),
  rc('13:00', '14:10'),
];
// Martes 8 de diciembre de 2026 (hábil)
const MARTES = new Date(2026, 11, 8);

describe('parsearHoraMesa', () => {
  it('entiende formatos del calendario académico', () => {
    expect(parsearHoraMesa('8.30 hs')).toBe('08:30');
    expect(parsearHoraMesa('14:00')).toBe('14:00');
    expect(parsearHoraMesa('9 hs')).toBe('09:00');
    expect(parsearHoraMesa(undefined)).toBeUndefined();
    expect(parsearHoraMesa('a confirmar')).toBeUndefined();
  });
});

describe('opcionesParaLlegar', () => {
  it('elige las que llegan con 30 min de margen y recomienda la más tardía', () => {
    const r = opcionesParaLlegar(SERVICIOS, MARTES, [], '08:30');
    expect(r.modo).toBe('a-tiempo');
    expect(r.limite).toBe('08:00');
    expect(r.salidas.map((s) => s.servicio.sale)).toEqual(['05:30', '06:00', '06:45']);
    expect(r.mejorId).toBe('RC-linea339-06:45-11111000');
  });
  it('sin hora devuelve las salidas de la mañana', () => {
    const r = opcionesParaLlegar(SERVICIOS, MARTES, []);
    expect(r.modo).toBe('manana');
    expect(r.salidas.map((s) => s.servicio.sale)).toEqual(['05:30', '06:00', '06:45', '07:00', '10:00']);
  });
  it('avisa si ninguna llega a tiempo', () => {
    const r = opcionesParaLlegar(SERVICIOS, MARTES, [], '06:00');
    expect(r.modo).toBe('ninguna');
    expect(r.mejorId).toBeUndefined();
  });
  it('respeta los días en que corre (domingo sin servicios)', () => {
    const r = opcionesParaLlegar(SERVICIOS, new Date(2026, 11, 6), [], '08:30');
    expect(r.salidas).toHaveLength(0);
  });
});
