import { describe, expect, it } from 'vitest';
import type { DiasServicio, Direccion, EmpresaId, Feriado, Servicio } from './types';
import {
  corre,
  correFeriados,
  crearSalida,
  diasTexto,
  fechaISO,
  formatearDuracion,
  formatearEspera,
  generarICS,
  horaAMinutos,
  mascaraDias,
  proximaSalidaDeServicio,
  proximasSalidas,
  resumenDia,
  serviciosDelDia,
  tipoDeDia,
} from './schedule';

const KEYS = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom', 'feriados'] as const;
const dias = (mask: string): DiasServicio =>
  Object.fromEntries(KEYS.map((k, i) => [k, mask[i] === '1'])) as DiasServicio;

function svc(sale: string, llega: string, mask = '11111111', empresa: EmpresaId = 'linea339', direccion: Direccion = 'CR'): Servicio {
  return {
    id: `${direccion}-${empresa}-${sale}-${mask}`,
    direccion,
    empresa,
    sale,
    llega,
    dias: dias(mask),
    tipoServicio: 'Aire acondicionado',
    observaciones: '',
    fuente: 'terminal',
  };
}

/** Fecha local */
const d = (y: number, m: number, day: number, h = 0, min = 0, s = 0) => new Date(y, m - 1, day, h, min, s);

// 12/10/2026 es lunes y feriado (Día del Respeto a la Diversidad Cultural)
const FERIADOS: Feriado[] = [{ fecha: '2026-10-12', nombre: 'Diversidad Cultural', tipo: 'trasladable' }];

describe('fechas', () => {
  it('fechaISO usa hora local', () => {
    expect(fechaISO(d(2026, 1, 5, 23, 59))).toBe('2026-01-05');
    expect(fechaISO(d(2026, 10, 12, 0, 1))).toBe('2026-10-12');
  });
  it('horaAMinutos', () => {
    expect(horaAMinutos('00:30')).toBe(30);
    expect(horaAMinutos('23:59')).toBe(1439);
  });
  it('mascaraDias', () => {
    expect(mascaraDias(dias('11111000'))).toBe('11111000');
  });
});

describe('tipoDeDia y corre', () => {
  it('clasifica días', () => {
    expect(tipoDeDia(d(2026, 10, 12), FERIADOS)).toBe('feriado');
    expect(tipoDeDia(d(2026, 10, 13), FERIADOS)).toBe('habil');
    expect(tipoDeDia(d(2026, 10, 10), FERIADOS)).toBe('sabado');
    expect(tipoDeDia(d(2026, 10, 11), FERIADOS)).toBe('domingo');
    expect(tipoDeDia(d(2026, 10, 12), [])).toBe('habil');
  });

  it('en feriado corre sii dias.feriados, aunque sea lunes', () => {
    const lv = svc('06:00', '07:00', '11111000');
    const domFer = svc('07:00', '08:00', '00000011');
    const lunes = svc('08:00', '09:00', '10000000');
    const lunesYFer = svc('09:00', '10:00', '10000001');
    const feriado = d(2026, 10, 12);
    expect(corre(lv, feriado, FERIADOS)).toBe(false);
    expect(corre(lunes, feriado, FERIADOS)).toBe(false);
    expect(corre(domFer, feriado, FERIADOS)).toBe(true);
    expect(corre(lunesYFer, feriado, FERIADOS)).toBe(true);
    // martes normal
    expect(corre(lv, d(2026, 10, 13), FERIADOS)).toBe(true);
    expect(corre(domFer, d(2026, 10, 13), FERIADOS)).toBe(false);
    // domingo normal
    expect(corre(domFer, d(2026, 10, 11), FERIADOS)).toBe(true);
  });

  it('serviciosDelDia filtra por sentido, día y empresa, y ordena', () => {
    const s = [
      svc('10:00', '11:00', '11111111', 'arito'),
      svc('06:00', '07:00', '11111000'),
      svc('07:00', '08:00', '00000011'),
      svc('05:00', '06:00', '11111111', 'linea339', 'RC'),
    ];
    expect(serviciosDelDia(s, 'CR', d(2026, 10, 12), FERIADOS).map((x) => x.sale)).toEqual(['07:00', '10:00']);
    expect(serviciosDelDia(s, 'CR', d(2026, 10, 13), FERIADOS).map((x) => x.sale)).toEqual(['06:00', '10:00']);
    expect(serviciosDelDia(s, 'CR', d(2026, 10, 13), FERIADOS, ['arito']).map((x) => x.sale)).toEqual(['10:00']);
  });
});

describe('medianoche', () => {
  it('llegada después de medianoche es al día siguiente', () => {
    const s = crearSalida(svc('23:30', '00:30'), d(2026, 10, 9), d(2026, 10, 9, 23, 0));
    expect(s.salida).toEqual(d(2026, 10, 9, 23, 30));
    expect(s.llegada).toEqual(d(2026, 10, 10, 0, 30));
    expect(s.duracionMin).toBe(60);
    expect(s.minutos).toBe(30);
  });

  it('un servicio de las 00:30 pertenece a ese día calendario', () => {
    const lunes0030 = svc('00:30', '01:40', '10000000', 'ranqueles', 'RC');
    // domingo 4/10 23:50 → sale lunes 5/10 00:30
    const [p] = proximasSalidas([lunes0030], 'RC', d(2026, 10, 4, 23, 50), FERIADOS, 1);
    expect(p.salida).toEqual(d(2026, 10, 5, 0, 30));
    expect(p.minutos).toBe(40);
    expect(corre(lunes0030, d(2026, 10, 4), FERIADOS)).toBe(false);
  });
});

describe('proximasSalidas', () => {
  const diarios = [svc('05:30', '06:45'), svc('22:00', '23:10'), svc('23:55', '01:00')];

  it('a las 23:50 cruza al día siguiente', () => {
    const r = proximasSalidas(diarios, 'CR', d(2026, 9, 28, 23, 50), FERIADOS, 3);
    expect(r.map((x) => [fechaISO(x.salida), x.servicio.sale, x.minutos])).toEqual([
      ['2026-09-28', '23:55', 5],
      ['2026-09-29', '05:30', 340],
      ['2026-09-29', '22:00', 1330],
    ]);
    expect(r[0].llegada).toEqual(d(2026, 9, 29, 1, 0));
  });

  it('incluye lo que salió hace ≤ 1 min', () => {
    const s = [svc('10:00', '11:00')];
    expect(proximasSalidas(s, 'CR', d(2026, 9, 28, 10, 0, 30), [], 1)[0].minutos).toBe(-1);
    const luego = proximasSalidas(s, 'CR', d(2026, 9, 28, 10, 1, 30), [], 1);
    expect(fechaISO(luego[0].salida)).toBe('2026-09-29');
  });

  it('respeta feriados al cruzar de día', () => {
    const s = [svc('06:00', '07:00', '11111000'), svc('07:00', '08:00', '00000011')];
    // domingo 11/10 23:50 → lunes 12/10 es feriado: solo el de Dom/Feriados
    const r = proximasSalidas(s, 'CR', d(2026, 10, 11, 23, 50), FERIADOS, 2);
    expect(r.map((x) => `${fechaISO(x.salida)} ${x.servicio.sale}`)).toEqual([
      '2026-10-12 07:00',
      '2026-10-13 06:00',
    ]);
  });

  it('filtro de empresas y límite n', () => {
    const s = [svc('10:00', '11:00', '11111111', 'arito'), ...diarios];
    const r = proximasSalidas(s, 'CR', d(2026, 9, 28, 9, 0), [], 10, ['arito']);
    expect(r).toHaveLength(8); // hoy + 7 días siguientes
    expect(r.every((x) => x.servicio.empresa === 'arito')).toBe(true);
    expect(proximasSalidas(s, 'CR', d(2026, 9, 28, 9, 0), [], 2)).toHaveLength(2);
    expect(proximasSalidas(s, 'RC', d(2026, 9, 28, 9, 0), [], 5)).toEqual([]);
  });

  it('proximaSalidaDeServicio', () => {
    const domFer = svc('07:00', '08:00', '00000011');
    const p = proximaSalidaDeServicio(domFer, d(2026, 10, 6, 12, 0), FERIADOS);
    expect(p?.salida).toEqual(d(2026, 10, 11, 7, 0));
    const p2 = proximaSalidaDeServicio(domFer, d(2026, 10, 11, 8, 0), FERIADOS);
    expect(p2?.salida).toEqual(d(2026, 10, 12, 7, 0)); // lunes feriado
    expect(proximaSalidaDeServicio(svc('07:00', '08:00', '00000000'), d(2026, 10, 6), FERIADOS)).toBeNull();
  });
});

describe('resumenDia', () => {
  it('calcula cantidad, extremos, frecuencia y porHora', () => {
    const s = [svc('06:00', '07:00'), svc('07:00', '08:00'), svc('09:00', '10:00'), svc('09:30', '10:30', '11111000')];
    const r = resumenDia(s, 'CR', d(2026, 10, 12), FERIADOS);
    expect(r).toMatchObject({
      fecha: '2026-10-12',
      tipoDia: 'feriado',
      cantidad: 3,
      primero: '06:00',
      ultimo: '09:00',
      frecuenciaPromedioMin: 90,
    });
    expect(r.feriado?.nombre).toBe('Diversidad Cultural');
    expect(r.porHora).toHaveLength(24);
    expect(r.porHora[6] + r.porHora[7] + r.porHora[9]).toBe(3);
  });

  it('frecuencia null con menos de 2 salidas', () => {
    const r = resumenDia([svc('06:00', '07:00')], 'CR', d(2026, 10, 13), FERIADOS);
    expect(r.frecuenciaPromedioMin).toBeNull();
    expect(r.feriado).toBeUndefined();
    expect(resumenDia([], 'CR', d(2026, 10, 13), FERIADOS)).toMatchObject({ cantidad: 0, primero: undefined });
  });
});

describe('diasTexto', () => {
  it.each([
    ['11111111', 'Todos los días'],
    ['11111110', 'Todos los días, excepto feriados'],
    ['11111000', 'Lun a Vie'],
    ['11111100', 'Lun a Sáb'],
    ['11111001', 'Lun a Vie y feriados'],
    ['11111101', 'Lun a Sáb y feriados'],
    ['00000111', 'Sáb, Dom y feriados'],
    ['00000011', 'Dom y feriados'],
    ['10000000', 'Solo lunes'],
    ['00000100', 'Solo sábados'],
    ['00100000', 'Solo miércoles'],
    ['10101000', 'Lun, Mié y Vie'],
    ['11111011', 'Lun a Vie, Dom y feriados'],
    ['00011110', 'Jue a Dom'],
    ['00000001', 'Solo feriados'],
  ])('%s → %s', (mask, texto) => {
    expect(diasTexto(dias(mask))).toBe(texto);
  });

  it('correFeriados', () => {
    expect(correFeriados(dias('11111000'))).toBe(false);
    expect(correFeriados(dias('00000011'))).toBe(true);
  });
});

describe('formatos', () => {
  it('formatearEspera', () => {
    expect(formatearEspera(0)).toBe('ahora');
    expect(formatearEspera(0.5)).toBe('ahora');
    expect(formatearEspera(5)).toBe('en 5 min');
    expect(formatearEspera(59)).toBe('en 59 min');
    expect(formatearEspera(60)).toBe('en 1 h');
    expect(formatearEspera(80)).toBe('en 1 h 20 min');
    expect(formatearEspera(-3)).toBe('salió hace 3 min');
  });
  it('formatearDuracion', () => {
    expect(formatearDuracion(80)).toBe('1 h 20 min');
    expect(formatearDuracion(55)).toBe('55 min');
    expect(formatearDuracion(120)).toBe('2 h');
  });
});

describe('generarICS', () => {
  it('genera un VEVENT con hora flotante y alarma', () => {
    const salida = crearSalida(svc('23:30', '00:30'), d(2026, 10, 9), d(2026, 10, 1));
    const ics = generarICS(salida, '33/9 Azul América', new Date(Date.UTC(2026, 9, 1, 12, 0, 0)));
    const lineas = ics.split('\r\n');
    expect(lineas[0]).toBe('BEGIN:VCALENDAR');
    expect(lineas).toContain('BEGIN:VEVENT');
    expect(lineas).toContain('DTSTART:20261009T233000');
    expect(lineas).toContain('DTEND:20261010T003000');
    expect(lineas).toContain('DTSTAMP:20261001T120000Z');
    expect(lineas).toContain('SUMMARY:Colectivo Casilda → Rosario (33/9 Azul América)');
    expect(lineas).toContain('TRIGGER:-PT15M');
    expect(lineas).toContain('END:VALARM');
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
  });
});
