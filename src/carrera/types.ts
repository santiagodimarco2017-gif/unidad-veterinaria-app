export type SubjectState = 'pendiente' | 'regular' | 'aprobada';

export type ViewMode = 'cursar' | 'rendir';

export type TabType = 'lista' | 'arbol' | 'simulador' | 'estadisticas' | 'calendario';

export interface ExamDate {
  subjectCode: string;
  subjectName: string;
  dateStr: string; // YYYY-MM-DD (e.g. "2026-02-11")
  turnName: string; // e.g. "Febrero-Marzo (1er Llamado)", "Abril", "Julio (2do Llamado)", "Mesas Escalonadas Mayo"
  timeStr?: string; // e.g. "8.30 hs"
}

export interface AcademicMilestone {
  dateStr: string; // YYYY-MM-DD
  title: string;
  type: 'inicio_clases' | 'fin_clases' | 'inscripcion_guarani' | 'feriado' | 'receso' | 'inicio_cuatrimestre' | 'otro';
  description?: string;
}

export interface CalendarDayEvents {
  dateStr: string;
  dayNumber: number;
  monthNumber: number; // 1-12
  yearNumber: number; // 2026
  dayOfWeekName: string; // "Lunes", "Martes", etc.
  exams: ExamDate[];
  milestones: AcademicMilestone[];
  isNonWorkingDay: boolean;
}

export interface Subject {
  code: string;
  numCode: number; // 1 to 48
  name: string;
  year: number;
  cursarRegularPrereqs?: string[];  // Required as Regular or Aprobada to Cursar
  cursarAprobadaPrereqs?: string[]; // Required as Aprobada to Cursar
  rendirAprobadaPrereqs?: string[]; // Required as Aprobada to Rendir
  prerequisites: string[];          // Combined/fallback list
  rawPrereqsText?: string;
}

export type StudentProgress = Record<string, SubjectState>;

export interface SubjectEvaluation {
  subject: Subject;
  state: SubjectState;
  isEnabled: boolean;
  missingPrereqs: Subject[];
  completedPrereqs: Subject[];
  effectivePrereqs: Subject[];
  unlocksSubjects: Subject[];
}
