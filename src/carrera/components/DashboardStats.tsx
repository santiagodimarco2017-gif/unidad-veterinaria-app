import React from 'react';
import type { ViewMode, StudentProgress } from '../types';
import { SUBJECTS } from '../data/subjects';
import { CheckCircle2, BookmarkCheck, Lock, Unlock, Sparkles, Award } from 'lucide-react';

interface DashboardStatsProps {
  progress: StudentProgress;
  viewMode: ViewMode;
  readyToCourseCount: number;
  readyToExamCount: number;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
  onQuickAction?: (action: 'approveYear1' | 'approveAllRegular') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  progress,
  viewMode,
  readyToCourseCount,
  readyToExamCount,
  onFilterChange,
  activeFilter = 'todos',
  onQuickAction
}) => {
  const total = SUBJECTS.length;
  let aprobadas = 0;
  let regularizadas = 0;
  let pendientes = 0;

  for (const s of SUBJECTS) {
    const st = progress[s.code] || 'pendiente';
    if (st === 'aprobada') aprobadas++;
    else if (st === 'regular') regularizadas++;
    else pendientes++;
  }

  const activeReadyCount = viewMode === 'cursar' ? readyToCourseCount : readyToExamCount;

  // Year completion stats
  const yearStats = [1, 2, 3, 4, 5, 6].map((yr) => {
    const yrSubjects = SUBJECTS.filter((s) => s.year === yr);
    const yrApproved = yrSubjects.filter((s) => progress[s.code] === 'aprobada').length;
    const yrRegular = yrSubjects.filter((s) => progress[s.code] === 'regular').length;
    return {
      year: yr,
      total: yrSubjects.length,
      approved: yrApproved,
      regular: yrRegular,
      pct: Math.round((yrApproved / yrSubjects.length) * 100)
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e1e3dd] mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          
          {/* Card 1: Aprobadas */}
          <button
            onClick={() => onFilterChange && onFilterChange('aprobada')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeFilter === 'aprobada'
                ? 'bg-[#003217] text-white border-[#003217] shadow-md ring-2 ring-[#054b26]'
                : 'bg-[#f8faf4] border-[#e1e3dd] hover:border-[#003217]/40 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${activeFilter === 'aprobada' ? 'text-emerald-200' : 'text-[#404941]'}`}>
                Aprobadas
              </span>
              <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'aprobada' ? 'text-[#fec975]' : 'text-[#054b26]'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-serif ${activeFilter === 'aprobada' ? 'text-white' : 'text-[#191c19]'}`}>
                {aprobadas}
              </span>
              <span className={`text-xs ${activeFilter === 'aprobada' ? 'text-emerald-200' : 'text-[#707970]'}`}>
                / {total}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {Math.round((aprobadas / total) * 100)}% de la carrera
            </div>
          </button>

          {/* Card 2: Regularizadas */}
          <button
            onClick={() => onFilterChange && onFilterChange('regular')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeFilter === 'regular'
                ? 'bg-[#7e570b] text-white border-[#7e570b] shadow-md ring-2 ring-[#b98b3e]'
                : 'bg-[#fffdf8] border-[#fec975]/60 hover:border-[#7e570b] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${activeFilter === 'regular' ? 'text-amber-100' : 'text-[#785205]'}`}>
                Regularizadas
              </span>
              <BookmarkCheck className={`w-4 h-4 ${activeFilter === 'regular' ? 'text-[#fec975]' : 'text-[#b98b3e]'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-serif ${activeFilter === 'regular' ? 'text-white' : 'text-[#191c19]'}`}>
                {regularizadas}
              </span>
              <span className={`text-xs ${activeFilter === 'regular' ? 'text-amber-100' : 'text-[#707970]'}`}>
                pend. final
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-[#785205]">
              Listas para rendir
            </div>
          </button>

          {/* Card 3: Habilitadas */}
          <button
            onClick={() => onFilterChange && onFilterChange('habilitada')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeFilter === 'habilitada'
                ? 'bg-[#054b26] text-white border-[#054b26] shadow-md ring-2 ring-[#7bbb8b]'
                : 'bg-[#f2f9f4] border-[#c0c9be] hover:border-[#054b26] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${activeFilter === 'habilitada' ? 'text-emerald-100' : 'text-[#054b26]'}`}>
                Habilitadas ({viewMode === 'cursar' ? 'Cursar' : 'Rendir'})
              </span>
              <Unlock className={`w-4 h-4 ${activeFilter === 'habilitada' ? 'text-[#fec975]' : 'text-[#054b26]'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-serif ${activeFilter === 'habilitada' ? 'text-white' : 'text-[#191c19]'}`}>
                {activeReadyCount}
              </span>
              <span className={`text-xs ${activeFilter === 'habilitada' ? 'text-emerald-200' : 'text-[#707970]'}`}>
                disponibles
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-[#054b26]">
              Cumplen requisitos
            </div>
          </button>

          {/* Card 4: Bloqueadas / Pendientes */}
          <button
            onClick={() => onFilterChange && onFilterChange('bloqueada')}
            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
              activeFilter === 'bloqueada'
                ? 'bg-[#191c19] text-white border-[#191c19] shadow-md'
                : 'bg-[#f8faf4] border-[#e1e3dd] hover:border-[#404941] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${activeFilter === 'bloqueada' ? 'text-gray-300' : 'text-[#404941]'}`}>
                Bloqueadas
              </span>
              <Lock className={`w-4 h-4 ${activeFilter === 'bloqueada' ? 'text-gray-300' : 'text-[#707970]'}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-bold font-serif ${activeFilter === 'bloqueada' ? 'text-white' : 'text-[#191c19]'}`}>
                {pendientes}
              </span>
              <span className={`text-xs ${activeFilter === 'bloqueada' ? 'text-gray-400' : 'text-[#707970]'}`}>
                materias
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-[#707970]">
              Faltan correlativas
            </div>
          </button>

        </div>

        {/* Quick Actions / Helpers */}
        {onQuickAction && (
          <div className="flex flex-wrap lg:flex-col justify-end gap-2 border-t lg:border-t-0 lg:border-l border-[#e1e3dd] pt-3 lg:pt-0 lg:pl-5 min-w-[180px]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#707970] w-full">
              Acciones Rápidas
            </span>
            <button
              onClick={() => onQuickAction('approveYear1')}
              className="text-xs font-medium text-[#003217] bg-[#f2f4ee] hover:bg-[#003217] hover:text-white px-3 py-2 rounded-lg border border-[#c0c9be] transition-all flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[#b98b3e]" />
              <span>Aprobar 1º Año completo</span>
            </button>
            <button
              onClick={() => onQuickAction('approveAllRegular')}
              className="text-xs font-medium text-[#785205] bg-[#fffdf8] hover:bg-[#7e570b] hover:text-white px-3 py-2 rounded-lg border border-[#fec975] transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#b98b3e]" />
              <span>Aprobar Regularizadas</span>
            </button>
          </div>
        )}

      </div>

      {/* Mini Year Progress Badges */}
      <div className="mt-5 pt-4 border-t border-[#e1e3dd]/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#404941]">
            Avance por Año Académico
          </span>
          <span className="text-[11px] text-[#707970]">
            Pasa el cursor o toca cada año para detalles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {yearStats.map((st) => (
            <div 
              key={st.year}
              className="bg-[#f2f4ee] p-2 rounded-lg border border-[#e1e3dd] flex flex-col justify-between"
            >
              <div className="flex justify-between items-center text-xs font-medium text-[#191c19] mb-1">
                <span>{st.year}º Año</span>
                <span className="font-bold text-[#003217] text-[11px]">
                  {st.approved}/{st.total}
                </span>
              </div>
              
              <div className="w-full bg-[#e1e3dd] h-1.5 rounded-full overflow-hidden flex">
                {/* Approved bar */}
                <div 
                  className="bg-[#003217] h-full transition-all duration-300"
                  style={{ width: `${(st.approved / st.total) * 100}%` }}
                  title={`${st.approved} aprobadas`}
                />
                {/* Regular bar */}
                <div 
                  className="bg-[#b98b3e] h-full transition-all duration-300"
                  style={{ width: `${(st.regular / st.total) * 100}%` }}
                  title={`${st.regular} regularizadas`}
                />
              </div>

              <div className="text-[10px] text-[#707970] mt-1 flex justify-between">
                <span>{st.pct}% Aprob.</span>
                {st.regular > 0 && <span className="text-[#785205]">{st.regular} Reg.</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
