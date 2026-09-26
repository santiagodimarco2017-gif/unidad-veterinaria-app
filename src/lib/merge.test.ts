import { describe, expect, it } from 'vitest';
import type { DiasServicio, Direccion, EmpresaId, FuenteDatos, Servicio } from './types';
import { NOTA_TERMINAL, construirServicios, detectarCambios } from './merge';

const KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', 'feriados'] as const;
const dias = (mask: string): DiasServicio =>
  Object.fromEntries(KEYS.map((k, i) => [k, mask[i] === '1'])) as DiasServicio;

function svc(
  sale: string,
  o: { llega?: string; mask?: string; empresa?: EmpresaId; dir?: Direccion; fuente?: FuenteDatos; viajeId?: number } = {},
): Servicio {
  const { llega = '09:00', mask = '11111111', empresa = 'linea339', dir = 'CR', fuente = 'terminal' } = o;
  return {
    id: `${dir}-${empresa}-${sale}-${mask}`,
    direccion: dir,
    empresa,
    sale,
    llega,
    dias: dias(mask),
    tipoServicio: 'Aire acondicionado',
    observaciones: '',
    fuente,
    ...(o.viajeId ? { viajeId: o.viajeId } : {}),
    ...(fuente === 'municipio' ? { paradas: [{ nombre: 'Terminal Casilda', hora: sale }] } : {}),
  };
}

describe('construirServicios', () => {
  const municipio = [
    svc('06:21', { mask: '11111000', fuente: 'municipio', llega: '07:40' }),
    svc('07:45', { fuente: 'municipio', llega: '09:05' }),
    svc('05:30', { dir: 'RC', fuente: 'municipio', llega: '06:45' }),
  ];
  const terminal = [
    svc('06:21', { mask: '11111000', llega: '08:38', viajeId: 1 }), // coincide → se descarta
    svc('07:45', { mask: '11111110', viajeId: 2 }), // mismo horario, otros días → igual se descarta
    svc('13:08', { mask: '11111000' }), // variante solo en terminal
    svc('12:24', { empresa: 'ranqueles' }),
    svc('12:24', { empresa: 'ranqueles' }), // duplicado exacto
    svc('12:24', { empresa: 'ranqueles', mask: '11111000' }), // mismo horario, otros días → se conserva
    svc('05:30', { dir: 'RC', empresa: 'arito' }), // otra empresa al mismo horario → se conserva
  ];
  const r = construirServicios(terminal, municipio);

  it('el 33/9 municipal prevalece sobre la terminal', () => {
    const l339 = r.filter((s) => s.empresa === 'linea339');
    expect(l339.map((s) => `${s.direccion} ${s.sale} ${s.fuente}`)).toEqual([
      'CR 06:21 ambas',
      'CR 07:45 ambas',
      'CR 13:08 terminal',
      'RC 05:30 municipio',
    ]);
    const s0621 = l339.find((s) => s.sale === '06:21')!;
    expect(s0621.llega).toBe('07:40');
    expect(s0621.paradas).toBeDefined();
    expect(s0621.viajeId).toBe(1);
  });

  it('variantes 33/9 de la terminal llevan la nota', () => {
    expect(r.find((s) => s.sale === '13:08')?.observaciones).toBe(NOTA_TERMINAL);
    expect(r.filter((s) => s.fuente === 'municipio' || s.fuente === 'ambas').every((s) => s.observaciones === '')).toBe(true);
  });

  it('otras empresas tal cual, sin duplicados exactos', () => {
    expect(r.filter((s) => s.empresa === 'ranqueles')).toHaveLength(2);
    expect(r.filter((s) => s.empresa === 'arito')).toHaveLength(1);
    expect(r).toHaveLength(7);
    expect(new Set(r.map((s) => s.id)).size).toBe(r.length);
  });

  it('ordena por sentido y hora', () => {
    expect(r.map((s) => `${s.direccion} ${s.sale}`)).toEqual([
      'CR 06:21', 'CR 07:45', 'CR 12:24', 'CR 12:24', 'CR 13:08', 'RC 05:30', 'RC 05:30',
    ]);
  });

  it('normaliza horas sin cero ("5:30") antes de comparar y recalcula el id', () => {
    const m = { ...svc('05:30', { dir: 'RC', fuente: 'municipio', llega: '06:45' }), sale: '5:30', llega: '6:45', id: 'x' };
    m.paradas = [{ nombre: 'Terminal Rosario', hora: '5:30' }];
    const t = svc('05:30', { dir: 'RC', llega: '06:45' });
    const [unico, ...resto] = construirServicios([t], [m]);
    expect(resto).toEqual([]);
    expect(unico).toMatchObject({ id: 'RC-linea339-05:30-11111111', sale: '05:30', llega: '06:45', fuente: 'ambas' });
    expect(unico.paradas?.[0].hora).toBe('05:30');
  });

  it('no muta las entradas', () => {
    expect(terminal[2].observaciones).toBe('');
    expect(municipio[0].fuente).toBe('municipio');
  });
});

describe('detectarCambios', () => {
  it('detecta agregados, quitados y modificados', () => {
    const antes = [
      svc('06:00'),
      svc('07:00', { llega: '08:00' }),
      svc('08:00', { mask: '11111000' }),
      svc('09:00', { empresa: 'arito' }),
    ];
    const despues = [
      svc('06:00'), // igual
      svc('07:00', { llega: '08:15' }), // cambia llegada (mismo id)
      svc('08:00', { mask: '11111100' }), // cambia días (distinto id, misma clave)
      svc('10:00', { empresa: 'arito' }), // nuevo
    ];
    const c = detectarCambios(antes, despues);
    expect(c.agregados.map((s) => s.id)).toEqual(['CR-arito-10:00-11111111']);
    expect(c.quitados.map((s) => s.id)).toEqual(['CR-arito-09:00-11111111']);
    expect(c.modificados.map((s) => s.id).sort()).toEqual(['CR-linea339-07:00-11111111', 'CR-linea339-08:00-11111100']);
  });

  it('sin cambios → vacío', () => {
    const s = [svc('06:00'), svc('07:00')];
    expect(detectarCambios(s, [...s].reverse())).toEqual({ agregados: [], quitados: [], modificados: [] });
  });

  it('servicios repetidos con misma clave se emparejan de a uno', () => {
    const antes = [svc('13:45', { mask: '00000100' }), svc('13:45', { mask: '00001100' })];
    const despues = [svc('13:45', { mask: '00000110' })];
    const c = detectarCambios(antes, despues);
    expect(c.modificados).toHaveLength(1);
    expect(c.quitados).toHaveLength(1);
    expect(c.agregados).toHaveLength(0);
  });
});
