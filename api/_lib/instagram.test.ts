import { describe, expect, it } from 'vitest';
import { armarAviso, extraerLink, masReciente, posteosNuevos, type PosteoInstagram } from './instagram';

const post = (id: string, timestamp: string, caption?: string): PosteoInstagram => ({
  id,
  timestamp,
  caption,
  permalink: `https://www.instagram.com/p/${id}/`,
  media_type: 'IMAGE',
  media_url: `https://cdn.example/${id}.jpg`,
});

describe('extraerLink', () => {
  it('toma el primer link con https', () => {
    expect(extraerLink('Charla de equinos 🐴\nInscripción: https://forms.gle/abc123 y más info en https://otro.com'))
      .toBe('https://forms.gle/abc123');
  });
  it('agrega https a links pegados sin esquema', () => {
    expect(extraerLink('Anotate en forms.gle/XyZ!')).toBe('https://forms.gle/XyZ');
    expect(extraerLink('Info: www.fveter.unr.edu.ar/charlas.')).toBe('https://www.fveter.unr.edu.ar/charlas');
  });
  it('saca puntuación pegada al final', () => {
    expect(extraerLink('Link (https://meet.google.com/abc-defg-hij).')).toBe('https://meet.google.com/abc-defg-hij');
  });
  it('null si no hay link', () => {
    expect(extraerLink('Torneo de fútbol este sábado ⚽ link en bio')).toBeNull();
    expect(extraerLink(undefined)).toBeNull();
  });
});

describe('posteosNuevos', () => {
  const lista = [
    post('c', '2026-09-26T20:00:00+0000'),
    post('b', '2026-09-25T20:00:00+0000'),
    post('a', '2026-09-24T20:00:00+0000'),
  ];
  it('devuelve solo lo posterior al último visto, del más viejo al más nuevo', () => {
    expect(posteosNuevos(lista, '2026-09-24T20:00:00+0000').map((p) => p.id)).toEqual(['b', 'c']);
  });
  it('nada si no hay novedades', () => {
    expect(posteosNuevos(lista, '2026-09-26T20:00:00+0000')).toEqual([]);
  });
  it('limita la ráfaga a los 3 más recientes', () => {
    const muchos = [1, 2, 3, 4, 5].map((d) => post(`p${d}`, `2026-09-0${d}T10:00:00+0000`));
    expect(posteosNuevos(muchos, '2026-08-01T00:00:00+0000').map((p) => p.id)).toEqual(['p3', 'p4', 'p5']);
  });
  it('masReciente', () => {
    expect(masReciente(lista)).toBe('2026-09-26T20:00:00+0000');
    expect(masReciente([])).toBeNull();
  });
});

describe('armarAviso', () => {
  it('con link en la descripción, el aviso lleva a ese link', () => {
    const a = armarAviso(post('x', '2026-09-26T20:00:00+0000', '#charla #fcv\nCharla: Bienestar animal 🐶\nInscribite https://forms.gle/q1'));
    expect(a.link).toBe('https://forms.gle/q1');
    expect(a.linkDeDescripcion).toBe(true);
    expect(a.cuerpo).toBe('Charla: Bienestar animal 🐶\nTocá para abrir el link.');
  });
  it('sin link, lleva al posteo de Instagram', () => {
    const a = armarAviso(post('y', '2026-09-26T20:00:00+0000', 'Ganamos el interfacultades 🏆'));
    expect(a.link).toBe('https://www.instagram.com/p/y/');
    expect(a.linkDeDescripcion).toBe(false);
    expect(a.cuerpo).toBe('Ganamos el interfacultades 🏆');
  });
  it('sin descripción usa un texto genérico', () => {
    expect(armarAviso(post('z', '2026-09-26T20:00:00+0000')).cuerpo).toBe('Mirá la nueva publicación en Instagram.');
  });
});
