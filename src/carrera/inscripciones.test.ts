import { describe, expect, it } from 'vitest';
import {
  avisosInscripcion,
  inscripcionesCursado,
  listarMaterias,
  materiasParaCursar,
  materiasParaRendir,
  proximaInscripcionCursado,
} from './inscripciones';
import { MAIL_CATEDRA } from './data/fcv';
import { SUBJECTS } from './data/subjects';

describe('materias sugeridas', () => {
  it('solo sugiere rendir materias regularizadas con las correlativas aprobadas', () => {
    // Química Biológica II pide Física Biológica y Química Biológica I aprobadas para rendir.
    const sinCorrelativa = materiasParaRendir({ '1.7.2': 'regular', '1.1.1': 'regular' }).map((s) => s.code);
    expect(sinCorrelativa).toContain('1.1.1');
    expect(sinCorrelativa).not.toContain('1.7.2');
    const conCorrelativa = materiasParaRendir({ '1.7.2': 'regular', '1.1.1': 'aprobada', '1.2.1': 'aprobada' }).map((s) => s.code);
    expect(conCorrelativa).toEqual(['1.7.2']);
  });

  it('sin avance se pueden cursar las de primer año sin correlativas', () => {
    const cursables = materiasParaCursar({});
    expect(cursables.length).toBeGreaterThan(0);
    expect(cursables.every((s) => s.year === 1)).toBe(true);
    expect(materiasParaRendir({})).toEqual([]);
  });
});

describe('avisos', () => {
  it('empareja apertura y cierre de cada cuatrimestre', () => {
    const insc = inscripcionesCursado();
    expect(insc.map((i) => [i.apertura.dateStr, i.cierre?.dateStr])).toEqual([
      ['2026-02-16', '2026-03-06'],
      ['2026-07-01', '2026-07-19'],
    ]);
  });

  it('avisa el día anterior a que abra la inscripción a cursado, con materias sugeridas', () => {
    const avisos = avisosInscripcion({}, new Date(2026, 5, 1));
    const abre = avisos.find((a) => a.clave === 'cursado-abre-2026-07-01');
    expect(abre?.fecha).toEqual(new Date(2026, 5, 30, 19));
    expect(abre?.titulo).toMatch(/^Mañana abre la inscripción/);
    expect(abre?.cuerpo).toMatch(/Podés cursar/);
    expect(avisos.find((a) => a.clave === 'cursado-cierra-2026-07-19')?.fecha).toEqual(new Date(2026, 6, 18, 19));
  });

  it('avisa días antes de cada mesa de una materia que puede rendir y descarta lo pasado', () => {
    const ahora = new Date(2026, 8, 27, 12);
    const avisos = avisosInscripcion({ '1.1.1': 'regular' }, ahora);
    expect(avisos.length).toBeGreaterThan(0);
    expect(avisos.every((a) => a.fecha > ahora)).toBe(true);
    // Física Biológica: mesa escalonada de octubre el 14/10 → aviso el 9/10 a las 19.
    const oct = avisos.find((a) => a.clave === 'mesa-2026-10-14');
    expect(oct?.fecha).toEqual(new Date(2026, 9, 9, 19));
    expect(oct?.cuerpo).toMatch(/Física Biológica/);
    expect(avisos.some((a) => a.clave.startsWith('cursado'))).toBe(false);
  });

  it('no hay próxima inscripción a cursado después de julio', () => {
    expect(proximaInscripcionCursado(new Date(2026, 8, 27))).toBeNull();
    expect(proximaInscripcionCursado(new Date(2026, 6, 10))?.apertura.dateStr).toBe('2026-07-01');
  });

  it('lista materias abreviando', () => {
    const m = (n: string) => ({ name: n });
    expect(listarMaterias([m('A')])).toBe('A');
    expect(listarMaterias([m('A'), m('B')])).toBe('A y B');
    expect(listarMaterias([m('A'), m('B'), m('C'), m('D'), m('E')])).toBe('A, B, C y 2 más');
  });
});

describe('mails de cátedra', () => {
  it('solo usa códigos del plan', () => {
    const codigos = new Set(SUBJECTS.map((s) => s.code));
    expect(Object.keys(MAIL_CATEDRA).filter((c) => !codigos.has(c))).toEqual([]);
  });
});
