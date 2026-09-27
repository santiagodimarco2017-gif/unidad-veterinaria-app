import { describe, expect, it } from 'vitest';
import { horarioDelMes } from '../data/comedores';

describe('horarioDelMes', () => {
  it('de marzo a noviembre abre hasta las 22 con cena', () => {
    expect(horarioDelMes(new Date(2026, 2, 2))?.horario).toBe('7:45 a 22:00');
    expect(horarioDelMes(new Date(2026, 10, 30))?.horario).toBe('7:45 a 22:00');
  });
  it('en febrero cierra a las 16', () => {
    expect(horarioDelMes(new Date(2026, 1, 10))?.horario).toBe('7:45 a 16:00');
  });
  it('en diciembre y enero no hay horario publicado', () => {
    expect(horarioDelMes(new Date(2026, 11, 15))).toBeNull();
    expect(horarioDelMes(new Date(2027, 0, 15))).toBeNull();
  });
});
