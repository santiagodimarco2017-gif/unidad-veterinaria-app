import { afterEach, describe, expect, it, vi } from 'vitest';
import { COD_TO_CODE, SUBJECTS, evaluateAllSubjects, getUnlockedSubjects, isSubjectEnabled } from '../data/subjects';
import { ACADEMIC_MILESTONES_2026, getAllExamDates2026, getMonthCalendarData } from '../data/calendar';
import { STORAGE_KEY, leerProgreso, proximaMesaRegular } from '../proximaMesa';
import type { StudentProgress, Subject } from '../types';

const materia = (code: string): Subject => {
  const s = SUBJECTS.find((x) => x.code === code);
  if (!s) throw new Error(`No existe ${code}`);
  return s;
};
const ISO = /^2026-\d{2}-\d{2}$/;
const esFechaReal = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const f = new Date(y, m - 1, d);
  return f.getFullYear() === y && f.getMonth() === m - 1 && f.getDate() === d;
};

describe('plan de estudios', () => {
  it('tiene las 48 materias con códigos únicos que coinciden con COD_TO_CODE', () => {
    expect(SUBJECTS).toHaveLength(48);
    expect(new Set(SUBJECTS.map((s) => s.code)).size).toBe(48);
    for (const s of SUBJECTS) expect(COD_TO_CODE[s.numCode]).toBe(s.code);
  });

  it('todas las correlativas apuntan a materias existentes y anteriores', () => {
    for (const s of SUBJECTS) {
      const todas = [
        ...s.prerequisites,
        ...(s.cursarRegularPrereqs ?? []),
        ...(s.cursarAprobadaPrereqs ?? []),
        ...(s.rendirAprobadaPrereqs ?? []),
      ];
      for (const code of todas) {
        expect(code, `${s.code} tiene una correlativa indefinida`).toBeDefined();
        const req = materia(code);
        expect(req.numCode, `${s.code} depende de ${code}`).toBeLessThan(s.numCode);
      }
    }
  });
});

describe('isSubjectEnabled', () => {
  const histologia = materia('1.6.2'); // Cursar: 2 Reg. | Rendir: 1, 2, 3 Aprob.

  it('las materias sin correlativas están habilitadas desde el inicio', () => {
    expect(isSubjectEnabled(materia('1.1.1'), {}, 'cursar').isEnabled).toBe(true);
    expect(isSubjectEnabled(materia('1.1.1'), {}, 'rendir').isEnabled).toBe(true);
  });

  it('para cursar alcanza con tener la correlativa regular', () => {
    expect(isSubjectEnabled(histologia, {}, 'cursar').isEnabled).toBe(false);
    const r = isSubjectEnabled(histologia, { '1.2.1': 'regular' }, 'cursar');
    expect(r.isEnabled).toBe(true);
    expect(r.completedPrereqs.map((s) => s.code)).toEqual(['1.2.1']);
  });

  it('para rendir exige todas las correlativas aprobadas', () => {
    const regulares: StudentProgress = { '1.1.1': 'regular', '1.2.1': 'aprobada', '1.3.1': 'aprobada' };
    const r = isSubjectEnabled(histologia, regulares, 'rendir');
    expect(r.isEnabled).toBe(false);
    expect(r.missingPrereqs.map((s) => s.code)).toEqual(['1.1.1']);

    const ok = isSubjectEnabled(histologia, { ...regulares, '1.1.1': 'aprobada' }, 'rendir');
    expect(ok.isEnabled).toBe(true);
    expect(ok.missingPrereqs).toEqual([]);
  });

  it('una correlativa que exige aprobada para cursar no se cumple con regular', () => {
    const conAprobada = SUBJECTS.find((s) => (s.cursarAprobadaPrereqs ?? []).length > 0);
    expect(conAprobada).toBeDefined();
    const s = conAprobada!;
    const todasRegulares: StudentProgress = Object.fromEntries(
      [...(s.cursarRegularPrereqs ?? []), ...(s.cursarAprobadaPrereqs ?? [])].map((c) => [c, 'regular']),
    );
    expect(isSubjectEnabled(s, todasRegulares, 'cursar').isEnabled).toBe(false);
    const todasAprobadas: StudentProgress = Object.fromEntries(Object.keys(todasRegulares).map((c) => [c, 'aprobada']));
    expect(isSubjectEnabled(s, todasAprobadas, 'cursar').isEnabled).toBe(true);
  });

  it('con todo aprobado, todas las materias quedan habilitadas en ambos modos', () => {
    const todo: StudentProgress = Object.fromEntries(SUBJECTS.map((s) => [s.code, 'aprobada']));
    for (const modo of ['cursar', 'rendir'] as const) {
      for (const [, e] of evaluateAllSubjects(todo, modo)) expect(e.isEnabled).toBe(true);
    }
  });
});

describe('getUnlockedSubjects', () => {
  it('Química Biológica I habilita Histología I', () => {
    expect(getUnlockedSubjects('1.2.1').map((s) => s.code)).toContain('1.6.2');
  });
});

describe('calendario 2026', () => {
  it('cada mesa tiene fecha válida de 2026 y una materia existente', () => {
    const mesas = getAllExamDates2026();
    expect(mesas.length).toBeGreaterThan(0);
    for (const m of mesas) {
      expect(m.dateStr, `${m.subjectCode} ${m.turnName}`).toMatch(ISO);
      expect(esFechaReal(m.dateStr), m.dateStr).toBe(true);
      materia(m.subjectCode);
    }
  });

  it('los hitos académicos tienen fechas válidas de 2026', () => {
    for (const h of ACADEMIC_MILESTONES_2026) {
      expect(h.dateStr).toMatch(ISO);
      expect(esFechaReal(h.dateStr), h.dateStr).toBe(true);
    }
  });

  it('arma el mes con un día por fecha y marca fines de semana y feriados', () => {
    const febrero = getMonthCalendarData(2026, 2);
    expect(febrero).toHaveLength(28);
    expect(febrero[0]).toMatchObject({ dateStr: '2026-02-01', dayOfWeekName: 'Domingo', isNonWorkingDay: true });
    const carnaval = febrero.find((d) => d.dateStr === '2026-02-16')!;
    expect(carnaval.dayOfWeekName).toBe('Lunes');
    expect(carnaval.isNonWorkingDay).toBe(true);
    const habil = febrero.find((d) => d.dateStr === '2026-02-18')!;
    expect(habil.isNonWorkingDay).toBe(false);
  });
});

describe('proximaMesaRegular', () => {
  const guardar = (p: StudentProgress | string) => {
    const store = new Map<string, string>([[STORAGE_KEY, typeof p === 'string' ? p : JSON.stringify(p)]]);
    vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null });
  };
  afterEach(() => vi.unstubAllGlobals());

  it('sin materias regulares no sugiere mesa', () => {
    guardar({ '1.1.1': 'aprobada' });
    expect(proximaMesaRegular(new Date(2026, 1, 1))).toBeNull();
  });

  it('con progreso corrupto devuelve progreso vacío', () => {
    guardar('{no es json');
    expect(leerProgreso()).toEqual({});
  });

  it('devuelve la primera mesa de una materia regular dentro de la ventana', () => {
    const mesa = getAllExamDates2026()
      .filter((m) => m.subjectCode !== '6.48.1')
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))[0];
    guardar({ [mesa.subjectCode]: 'regular' });
    const [y, mo, d] = mesa.dateStr.split('-').map(Number);
    const dosDiasAntes = new Date(y, mo - 1, d - 2, 10, 0);
    const r = proximaMesaRegular(dosDiasAntes, 7);
    expect(r?.subjectCode).toBe(mesa.subjectCode);
    expect(r?.dateStr).toBe(mesa.dateStr);

    // El mismo día, después de las 8.30 hs, esa mesa ya pasó
    const mismoDiaTarde = new Date(y, mo - 1, d, 12, 0);
    expect(proximaMesaRegular(mismoDiaTarde, 0)).toBeNull();
  });
});
