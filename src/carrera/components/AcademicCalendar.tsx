import React, { useState, useMemo, useEffect } from 'react';
import type { ExamDate } from '../types';
import {
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  CalendarDays,
  ListFilter,
  Check,
  CalendarPlus
} from 'lucide-react';
import {
  MONTH_NAMES,
  ACADEMIC_MILESTONES_2026,
  getMonthCalendarData,
  getAllExamDates2026
} from '../data/calendar';
import type { SubjectEvaluation, StudentProgress } from '../types';

interface AcademicCalendarProps {
  evaluations: Record<string, SubjectEvaluation>;
  progress: StudentProgress;
  onSubjectSelect?: (code: string) => void;
  /** Abre "¿Cómo llego?" (colectivos Rosario → Casilda) para esa mesa */
  onComoLlego?: (exam: ExamDate) => void;
  /** Link "Agendar en Google Calendar" para esa mesa */
  linkAgendar?: (exam: ExamDate) => string;
}

/** Botón "Agendar en Google Calendar" de cada mesa (abre Google Calendar con el evento precargado) */
const AgendarBtn: React.FC<{ exam: ExamDate; linkAgendar?: (exam: ExamDate) => string; compact?: boolean }> = ({ exam, linkAgendar, compact }) => {
  if (!linkAgendar) return null;
  return (
    <a
      href={linkAgendar(exam)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={compact
        ? 'mt-1 w-full inline-flex items-center justify-center gap-1 rounded-md border border-[#068136] bg-white text-[#054b26] text-[10px] font-bold px-1.5 py-1 active:scale-95 transition-all no-underline'
        : 'inline-flex items-center gap-1.5 rounded-xl border border-[#068136] bg-white text-[#054b26] text-xs font-bold px-3 py-2 shadow-xs hover:bg-[#f0f7f2] active:scale-95 transition-all no-underline'}
      aria-label={`Agendar la mesa de ${exam.subjectName} en Google Calendar`}
    >
      <CalendarPlus className={compact ? 'w-3 h-3' : 'w-4 h-4'} aria-hidden /> {compact ? 'Agendar' : 'Agendar en Google Calendar'}
    </a>
  );
};

/** Botón "🚌 ¿Cómo llego?" de cada mesa (integración con los colectivos) */
const ComoLlegoBtn: React.FC<{ exam: ExamDate; onComoLlego?: (exam: ExamDate) => void; compact?: boolean }> = ({ exam, onComoLlego, compact }) => {
  if (!onComoLlego) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onComoLlego(exam);
      }}
      className={compact
        ? 'mt-1 w-full inline-flex items-center justify-center gap-1 rounded-md bg-[#003217] text-white text-[10px] font-bold px-1.5 py-1 hover:bg-[#054b26] active:scale-95 transition-all'
        : 'inline-flex items-center gap-1.5 rounded-xl bg-[#003217] text-white text-xs font-bold px-3 py-2 shadow-xs hover:bg-[#054b26] active:scale-95 transition-all'}
      aria-label={`¿Cómo llego a la mesa de ${exam.subjectName}?`}
    >
      <span aria-hidden>🚌</span> ¿Cómo llego?
    </button>
  );
};

export const AcademicCalendar: React.FC<AcademicCalendarProps> = ({
  evaluations,
  onSubjectSelect,
  onComoLlego,
  linkAgendar
}) => {
  // Mes inicial: el actual si estamos en 2026 (la app es un calendario 2026); si no, febrero.
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const hoy = new Date();
    return hoy.getFullYear() === 2026 ? hoy.getMonth() + 1 : 2;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [onlyCanTakeExams, setOnlyCanTakeExams] = useState<boolean>(false);
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'exams' | 'milestones' | 'escalonadas'>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [yearSelected] = useState<number>(2026);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Month data
  const daysInSelectedMonth = useMemo(() => {
    return getMonthCalendarData(yearSelected, selectedMonth);
  }, [yearSelected, selectedMonth]);

  // Count totals per month for month badges
  const monthStats = useMemo(() => {
    const allExams = getAllExamDates2026();
    const stats: Record<number, { exams: number; milestones: number }> = {};

    for (let m = 1; m <= 12; m++) {
      const monthStr = m.toString().padStart(2, '0');
      const monthExams = allExams.filter((e) => e.dateStr.startsWith(`2026-${monthStr}`));
      const monthMilestones = ACADEMIC_MILESTONES_2026.filter((mil) =>
        mil.dateStr.startsWith(`2026-${monthStr}`)
      );
      stats[m] = {
        exams: monthExams.length,
        milestones: monthMilestones.length
      };
    }
    return stats;
  }, []);

  // Filter logic for a day's exams
  const filterExam = (exam: ReturnType<typeof getAllExamDates2026>[0]) => {
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = exam.subjectName.toLowerCase().includes(term);
      const matchCode = exam.subjectCode.toLowerCase().includes(term);
      const matchTurn = exam.turnName.toLowerCase().includes(term);
      if (!matchName && !matchCode && !matchTurn) return false;
    }

    // Event type filter
    if (selectedEventType === 'escalonadas' && !exam.turnName.includes('Escalonada')) {
      return false;
    }

    // Student availability filter
    if (onlyCanTakeExams) {
      const evalItem = evaluations[exam.subjectCode];
      if (!evalItem) return false;
      // Already approved -> don't need to take
      if (evalItem.state === 'aprobada') return false;
      // Is regular OR pending with all prerequisites met
      const canTake = evalItem.state === 'regular' || (evalItem.state === 'pendiente' && evalItem.isEnabled);
      if (!canTake) return false;
    }

    return true;
  };

  // Filter logic for milestones
  const filterMilestone = (milestone: (typeof ACADEMIC_MILESTONES_2026)[0]) => {
    if (selectedEventType === 'exams' || selectedEventType === 'escalonadas') {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchTitle = milestone.title.toLowerCase().includes(term);
      const matchDesc = milestone.description?.toLowerCase().includes(term) ?? false;
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  };

  // Days with filtered events
  const filteredDays = useMemo(() => {
    return daysInSelectedMonth.map((day) => {
      const filteredExams = day.exams.filter(filterExam);
      const filteredMilestones = day.milestones.filter(filterMilestone);
      return {
        ...day,
        filteredExams,
        filteredMilestones,
        hasEvents: filteredExams.length > 0 || filteredMilestones.length > 0
      };
    });
  }, [daysInSelectedMonth, searchTerm, onlyCanTakeExams, selectedEventType, evaluations]);

  // Auto select first day with events when filters/month change
  useEffect(() => {
    const firstEventDay = filteredDays.find((d) => d.hasEvents);
    if (firstEventDay) {
      setSelectedDayNumber(firstEventDay.dayNumber);
    } else {
      setSelectedDayNumber(1);
    }
  }, [selectedMonth, searchTerm, onlyCanTakeExams, selectedEventType]);

  // First day of month padding for grid layout
  const firstDayOffset = useMemo(() => {
    const firstDate = new Date(yearSelected, selectedMonth - 1, 1);
    const day = firstDate.getDay(); // 0 is Sunday
    return day === 0 ? 6 : day - 1; // Monday start
  }, [yearSelected, selectedMonth]);

  // Quick Stats for selected month
  const selectedMonthExamsCount = useMemo(() => {
    return filteredDays.reduce((acc, d) => acc + d.filteredExams.length, 0);
  }, [filteredDays]);

  const selectedMonthMilestonesCount = useMemo(() => {
    return filteredDays.reduce((acc, d) => acc + d.filteredMilestones.length, 0);
  }, [filteredDays]);

  // Selected day object for mobile view
  const selectedDayObj = useMemo(() => {
    if (!selectedDayNumber) return null;
    return filteredDays.find((d) => d.dayNumber === selectedDayNumber) || null;
  }, [filteredDays, selectedDayNumber]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Encabezado compacto */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black tracking-tight font-serif text-slate-900 leading-tight">
          Mesas de examen 2026
        </h2>
        <p className="text-[14px] text-slate-700 mt-1">
          <strong className="text-[#05672b]">{selectedMonthExamsCount}</strong> exámenes en {MONTH_NAMES[selectedMonth - 1]}
          {' · '}
          <strong className="text-[#7a5718]">{selectedMonthMilestonesCount}</strong> hitos / feriados
        </p>
        <p className="text-[13px] text-slate-600 mt-1">
          Tocá <strong>Agendar</strong> en una mesa para sumarla a tu Google Calendar, o <strong>¿Cómo llego?</strong> para ver qué colectivo tomar.
        </p>
      </div>
      {/* Month Navigation Tab Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Seleccionar Mes (Año 2026)
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedMonth((prev) => (prev > 1 ? prev - 1 : 12))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 px-2">
              {MONTH_NAMES[selectedMonth - 1]} 2026
            </span>
            <button
              onClick={() => setSelectedMonth((prev) => (prev < 12 ? prev + 1 : 1))}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Month Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {MONTH_NAMES.map((name, idx) => {
            const monthNum = idx + 1;
            const isSelected = selectedMonth === monthNum;
            const stats = monthStats[monthNum];
            return (
              <button
                key={name}
                onClick={() => setSelectedMonth(monthNum)}
                className={`flex flex-col items-center min-w-[85px] py-2 px-3 rounded-xl text-xs font-medium transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="font-semibold text-sm">{name.slice(0, 3)}</span>
                <div className="flex items-center gap-1 mt-1 text-[10px] opacity-90">
                  {stats.exams > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full ${
                        isSelected
                          ? 'bg-emerald-800 text-emerald-100'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {stats.exams} rinden
                    </span>
                  )}
                  {stats.exams === 0 && (
                    <span className="opacity-60 text-[10px]">Sin mesa</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar materia por nombre, código (ej: 1.1.1) o turno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Event Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setSelectedEventType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
                selectedEventType === 'all'
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200'
              }`}
            >
              Todos los eventos
            </button>
            <button
              onClick={() => setSelectedEventType('exams')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
                selectedEventType === 'exams'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Solo Exámenes
            </button>
            <button
              onClick={() => setSelectedEventType('escalonadas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
                selectedEventType === 'escalonadas'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              Mesas Escalonadas
            </button>
            <button
              onClick={() => setSelectedEventType('milestones')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
                selectedEventType === 'milestones'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
              }`}
            >
              Hitos e Inscripciones
            </button>
          </div>

          {/* View mode toggle */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Vista Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Vista Lista
            </button>
          </div>
        </div>

        {/* Student Progress Filter Checkbox */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <label className="flex items-start sm:items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
            <div
              className={`w-4 h-4 mt-0.5 sm:mt-0 shrink-0 rounded border flex items-center justify-center transition-colors ${
                onlyCanTakeExams
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
              }`}
            >
              {onlyCanTakeExams && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <input
              type="checkbox"
              checked={onlyCanTakeExams}
              onChange={(e) => setOnlyCanTakeExams(e.target.checked)}
              className="sr-only"
            />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Filtrar y mostrar <strong>únicamente las materias que PUEDO RENDIR</strong> según mi progreso
            </span>
          </label>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* MOBILE CALENDAR MATRIX VIEW (< sm) */}
          <div className="sm:hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-0.5">
              <span className="font-medium">Tocá un día para ver los exámenes:</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Examen
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Hito
                </span>
              </div>
            </div>

            {/* Mobile Header Days of Week */}
            <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 py-1.5 border-b border-slate-100 dark:border-slate-800">
              <div>Lu</div>
              <div>Ma</div>
              <div>Mi</div>
              <div>Ju</div>
              <div>Vi</div>
              <div className="text-rose-500">Sá</div>
              <div className="text-rose-500">Do</div>
            </div>

            {/* Mobile Days Matrix */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`mob-offset-${i}`} className="aspect-square bg-slate-50/50 dark:bg-slate-950/20 rounded-xl" />
              ))}

              {filteredDays.map((day) => {
                const isSelected = selectedDayNumber === day.dayNumber;
                const isWeekend = day.dayOfWeekName === 'Sábado' || day.dayOfWeekName === 'Domingo';
                const hasExams = day.filteredExams.length > 0;
                const hasMilestones = day.filteredMilestones.length > 0;

                return (
                  <button
                    key={`mob-day-${day.dateStr}`}
                    type="button"
                    onClick={() => setSelectedDayNumber(day.dayNumber)}
                    className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-between transition-all relative border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30 font-bold scale-105 z-10'
                        : hasExams
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100 font-bold'
                        : hasMilestones
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100 font-semibold'
                        : isWeekend || day.isNonWorkingDay
                        ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xs font-mono">{day.dayNumber}</span>

                    {/* Dot badges */}
                    <div className="flex items-center justify-center gap-0.5 mb-0.5">
                      {hasExams && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-600'}`} />
                      )}
                      {hasMilestones && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-500'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Day Details Drawer / Card */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedDayObj ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono font-bold flex flex-col items-center justify-center shadow-xs">
                        <span className="text-[10px] leading-none opacity-80 uppercase">
                          {selectedDayObj.dayOfWeekName.slice(0, 3)}
                        </span>
                        <span className="text-sm font-bold leading-none mt-0.5">
                          {selectedDayObj.dayNumber}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {selectedDayObj.dayOfWeekName} {selectedDayObj.dayNumber} de {MONTH_NAMES[selectedDayObj.monthNumber - 1]} 2026
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {selectedDayObj.filteredExams.length} exámenes • {selectedDayObj.filteredMilestones.length} hitos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Day Milestones */}
                  {selectedDayObj.filteredMilestones.map((m, idx) => (
                    <div
                      key={`mob-m-${idx}`}
                      className="p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100 text-xs flex items-start gap-2.5"
                    >
                      <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-xs">{m.title}</span>
                        {m.description && <p className="text-[11px] opacity-85 mt-0.5">{m.description}</p>}
                      </div>
                    </div>
                  ))}

                  {/* Day Exams */}
                  {selectedDayObj.filteredExams.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDayObj.filteredExams.map((exam, idx) => {
                        const evalItem = evaluations[exam.subjectCode];
                        const canTake = evalItem?.state === 'regular' || (evalItem?.state === 'pendiente' && evalItem?.isEnabled);
                        const isApproved = evalItem?.state === 'aprobada';

                        return (
                          <div
                            key={`mob-e-${idx}`}
                            onClick={() => onSubjectSelect && onSubjectSelect(exam.subjectCode)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                              isApproved
                                ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-75'
                                : canTake
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-mono font-bold">
                                {exam.subjectCode}
                              </span>
                              {isApproved ? (
                                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                                  Aprobada
                                </span>
                              ) : canTake ? (
                                <span className="text-[10px] bg-emerald-600 text-white font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                  <Check className="w-3 h-3" /> Podés rendir
                                </span>
                              ) : null}
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {exam.subjectName}
                            </h5>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-700/50">
                              <span className="font-medium bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                                {exam.turnName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {exam.timeStr}
                              </span>
                            </div>
                            {(onComoLlego || linkAgendar) && (
                              <div className="pt-1 flex flex-wrap justify-end gap-2">
                                <AgendarBtn exam={exam} linkAgendar={linkAgendar} />
                                <ComoLlegoBtn exam={exam} onComoLlego={onComoLlego} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    selectedDayObj.filteredMilestones.length === 0 && (
                      <div className="text-center py-4 space-y-1">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          Sin exámenes ni hitos para este día.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tocá en los días marcados con verde o amarillo arriba.
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">
                  Tocá un día en el calendario de arriba para ver sus exámenes.
                </p>
              )}
            </div>
          </div>

          {/* DESKTOP CALENDAR GRID VIEW (sm:block) */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header Days of Week */}
            <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold text-slate-600 dark:text-slate-300 py-2.5">
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div className="text-rose-600 dark:text-rose-400">Sáb</div>
              <div className="text-rose-600 dark:text-rose-400">Dom</div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 dark:divide-slate-800">
              {/* Blank offset cells for start of month */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div
                  key={`offset-${i}`}
                  className="bg-slate-50/50 dark:bg-slate-950/30 min-h-[110px] sm:min-h-[130px]"
                />
              ))}

              {/* Days of month */}
              {filteredDays.map((day) => {
                const isWeekend = day.dayOfWeekName === 'Sábado' || day.dayOfWeekName === 'Domingo';
                const hasExams = day.filteredExams.length > 0;

                return (
                  <div
                    key={day.dateStr}
                    className={`min-h-[120px] sm:min-h-[140px] p-2 flex flex-col justify-between transition-colors ${
                      day.isNonWorkingDay
                        ? 'bg-rose-50/30 dark:bg-rose-950/10'
                        : 'bg-white dark:bg-slate-900'
                    } ${
                      hasExams ? 'hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs sm:text-sm font-bold font-mono px-2 py-0.5 rounded-lg ${
                          hasExams
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isWeekend || day.isNonWorkingDay
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                      {hasExams && (
                        <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-full">
                          {day.filteredExams.length} {day.filteredExams.length === 1 ? 'materia' : 'materias'}
                        </span>
                      )}
                    </div>

                    {/* Day items content */}
                    <div className="space-y-1 flex-1 overflow-y-auto max-h-[130px] scrollbar-thin scrollbar-thumb-slate-200">
                      {/* Milestones / Holidays */}
                      {day.filteredMilestones.map((m, idx) => (
                        <div
                          key={`m-${idx}`}
                          className={`p-1.5 rounded-lg text-[11px] leading-tight border ${
                            m.type === 'feriado'
                              ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                              : m.type === 'inscripcion_guarani'
                              ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                              : 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                          }`}
                          title={m.description}
                        >
                          <span className="font-semibold block">{m.title}</span>
                        </div>
                      ))}

                      {/* Exams */}
                      {day.filteredExams.map((exam, idx) => {
                        const evalItem = evaluations[exam.subjectCode];
                        const canTake = evalItem?.state === 'regular' || (evalItem?.state === 'pendiente' && evalItem?.isEnabled);
                        const isApproved = evalItem?.state === 'aprobada';

                        return (
                          <div
                            key={`e-${idx}`}
                            onClick={() => onSubjectSelect && onSubjectSelect(exam.subjectCode)}
                            className={`p-1.5 rounded-lg text-[11px] leading-tight border transition-all cursor-pointer group ${
                              isApproved
                                ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-75'
                                : canTake
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500 hover:shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                {exam.subjectCode}
                              </span>
                              {isApproved ? (
                                <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1 rounded">
                                  Aprobada
                                </span>
                              ) : canTake ? (
                                <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-semibold px-1 rounded flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5" /> Podés rendir
                                </span>
                              ) : null}
                            </div>
                            <div className="font-medium line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-300">
                              {exam.subjectName}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                              <span className="truncate">{exam.turnName}</span>
                              <span>{exam.timeStr}</span>
                            </div>
                            <ComoLlegoBtn exam={exam} onComoLlego={onComoLlego} compact />
                            <AgendarBtn exam={exam} linkAgendar={linkAgendar} compact />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* CHRONOLOGICAL LIST VIEW */
        <div className="space-y-4">
          {filteredDays
            .filter((d) => d.hasEvents)
            .map((day) => (
              <div
                key={day.dateStr}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Date header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex flex-col items-center justify-center font-mono shadow-sm">
                      <span className="text-xs font-semibold leading-none opacity-80 uppercase">
                        {day.dayOfWeekName.slice(0, 3)}
                      </span>
                      <span className="text-lg font-bold leading-none mt-0.5">
                        {day.dayNumber}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {day.dayOfWeekName} {day.dayNumber} de {MONTH_NAMES[day.monthNumber - 1]} 2026
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {day.filteredExams.length} exámenes programados • {day.filteredMilestones.length} hitos
                      </p>
                    </div>
                  </div>

                  {day.isNonWorkingDay && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                      Día No Laborable / Receso
                    </span>
                  )}
                </div>

                {/* Day events list */}
                <div className="space-y-3">
                  {/* Milestones */}
                  {day.filteredMilestones.map((m, idx) => (
                    <div
                      key={`list-m-${idx}`}
                      className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-start gap-3"
                    >
                      <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sm block">{m.title}</span>
                        {m.description && (
                          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Exam list cards */}
                  {day.filteredExams.map((exam, idx) => {
                    const evalItem = evaluations[exam.subjectCode];
                    const canTake = evalItem?.state === 'regular' || (evalItem?.state === 'pendiente' && evalItem?.isEnabled);
                    const isApproved = evalItem?.state === 'aprobada';

                    return (
                      <div
                        key={`list-e-${idx}`}
                        onClick={() => onSubjectSelect && onSubjectSelect(exam.subjectCode)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isApproved
                            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'
                            : canTake
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-500 hover:shadow-md'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold">
                              {exam.subjectCode}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              {evalItem?.subject.year ? `${evalItem.subject.year}º Año` : ''}
                            </span>
                          </div>
                          <h5 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            {exam.subjectName}
                          </h5>
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                              {exam.turnName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {exam.timeStr}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 flex flex-wrap items-center gap-2">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                              Materia Aprobada
                            </span>
                          ) : canTake ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              ¡Podés rendirla!
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                              Faltan correlativas
                            </span>
                          )}
                          <AgendarBtn exam={exam} linkAgendar={linkAgendar} />
                          <ComoLlegoBtn exam={exam} onComoLlego={onComoLlego} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {filteredDays.filter((d) => d.hasEvents).length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">
                No hay exámenes ni hitos para los filtros seleccionados
              </h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Probá cambiando el mes o desactivando el filtro de "materias que puedo rendir".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
