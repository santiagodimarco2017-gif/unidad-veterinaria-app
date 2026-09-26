import { describe, expect, it } from 'vitest';
import { rangoFechas, urlGoogleCalendar } from './googleCalendar';

describe('googleCalendar', () => {
  it('arma el rango con hora y duración', () => {
    expect(rangoFechas('2026-02-11', '08:30', 180)).toBe('20260211T083000/20260211T113000');
  });

  it('cruza la medianoche', () => {
    expect(rangoFechas('2026-12-31', '23:00', 120)).toBe('20261231T230000/20270101T010000');
  });

  it('sin hora agenda el día completo (fin exclusivo)', () => {
    expect(rangoFechas('2026-02-28')).toBe('20260228/20260301');
  });

  it('genera la URL de plantilla con zona horaria, detalles y lugar', () => {
    const url = new URL(urlGoogleCalendar({
      titulo: 'Mesa: Anatomía I',
      fecha: '2026-07-15',
      hora: '08:30',
      detalles: 'Turno Julio',
      lugar: 'FCV-UNR, Casilda',
    }));
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Mesa: Anatomía I');
    expect(url.searchParams.get('dates')).toBe('20260715T083000/20260715T113000');
    expect(url.searchParams.get('ctz')).toBe('America/Argentina/Buenos_Aires');
    expect(url.searchParams.get('details')).toBe('Turno Julio');
    expect(url.searchParams.get('location')).toBe('FCV-UNR, Casilda');
  });
});
