import { describe, expect, it } from 'vitest';
import { compararSimulacion, siguienteEstado } from '../lib/simulador';

describe('siguienteEstado', () => {
  it('rota pendiente → regular → aprobada → pendiente', () => {
    expect(siguienteEstado(undefined)).toBe('regular');
    expect(siguienteEstado('pendiente')).toBe('regular');
    expect(siguienteEstado('regular')).toBe('aprobada');
    expect(siguienteEstado('aprobada')).toBe('pendiente');
  });
});

describe('compararSimulacion', () => {
  it('sin cambios no hay nada nuevo', () => {
    const real = { '1.1.1': 'regular' as const };
    expect(compararSimulacion(real, { ...real }, 'cursar')).toEqual({ nuevasAprobadas: [], nuevasDestrabadas: [] });
  });

  it('regularizar Química Biológica I destraba cursar Histología I', () => {
    const r = compararSimulacion({}, { '1.2.1': 'regular' }, 'cursar');
    expect(r.nuevasAprobadas).toEqual([]);
    expect(r.nuevasDestrabadas).toContain('1.6.2');
  });

  it('para rendir Histología I hay que aprobar sus tres correlativas', () => {
    const real = { '1.1.1': 'aprobada' as const, '1.2.1': 'aprobada' as const, '1.3.1': 'regular' as const };
    const r = compararSimulacion(real, { ...real, '1.3.1': 'aprobada' }, 'rendir');
    expect(r.nuevasAprobadas).toEqual(['1.3.1']);
    expect(r.nuevasDestrabadas).toContain('1.6.2');

    const soloRegular = compararSimulacion(real, { ...real, '1.3.1': 'regular' }, 'rendir');
    expect(soloRegular.nuevasDestrabadas).not.toContain('1.6.2');
  });

  it('una materia ya aprobada en el real no cuenta como nueva', () => {
    const real = { '1.1.1': 'aprobada' as const };
    expect(compararSimulacion(real, { ...real }, 'rendir').nuevasAprobadas).toEqual([]);
  });

  it('una materia destrabada que la simulación ya aprueba no se lista como destrabada', () => {
    const r = compararSimulacion({}, { '1.2.1': 'regular', '1.6.2': 'aprobada' }, 'cursar');
    expect(r.nuevasAprobadas).toEqual(['1.6.2']);
    expect(r.nuevasDestrabadas).not.toContain('1.6.2');
  });
});
