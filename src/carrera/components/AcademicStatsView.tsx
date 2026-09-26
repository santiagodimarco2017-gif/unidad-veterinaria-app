import React from 'react';
import type { StudentProgress, ViewMode } from '../types';
import { SUBJECTS } from '../data/subjects';
import { Award, CheckCircle2, BookmarkCheck, Clock } from 'lucide-react';

interface AcademicStatsViewProps {
  progress: StudentProgress;
  viewMode: ViewMode;
}

export const AcademicStatsView: React.FC<AcademicStatsViewProps> = ({
  progress
}) => {
  const total = SUBJECTS.length;

  let totalAprobadas = 0;
  let totalRegularizadas = 0;
  let totalPendientes = 0;

  for (const s of SUBJECTS) {
    const st = progress[s.code] || 'pendiente';
    if (st === 'aprobada') totalAprobadas++;
    else if (st === 'regular') totalRegularizadas++;
    else totalPendientes++;
  }

  const overallPct = Math.round((totalAprobadas / total) * 100);

  // Stats by year
  const yearBreakdowns = [1, 2, 3, 4, 5, 6].map((yr) => {
    const yrSubjects = SUBJECTS.filter((s) => s.year === yr);
    const yrApproved = yrSubjects.filter((s) => progress[s.code] === 'aprobada').length;
    const yrRegular = yrSubjects.filter((s) => progress[s.code] === 'regular').length;
    const yrPending = yrSubjects.length - yrApproved - yrRegular;
    const pct = Math.round((yrApproved / yrSubjects.length) * 100);

    return {
      year: yr,
      subjects: yrSubjects,
      approved: yrApproved,
      regular: yrRegular,
      pending: yrPending,
      total: yrSubjects.length,
      pct,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#e1e3dd] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-[#003217] text-[#fec975] rounded-2xl shadow-sm">
              <Award className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-[#054b26] tracking-wider">
                Resumen de Avance Curricular
              </span>
              <h2 className="text-2xl font-bold font-serif text-[#191c19]">
                Medicina Veterinaria • FCV-UNR
              </h2>
              <p className="text-xs text-[#707970] mt-0.5">
                Plan de Estudios 2009 • Modificación de Correlatividades Res. CD 90/2026
              </p>
            </div>
          </div>

          <div className="bg-[#f8faf4] p-4 rounded-xl border border-[#e1e3dd] flex items-center gap-4 min-w-[220px]">
            <div className="text-3xl font-bold font-serif text-[#003217]">
              {overallPct}%
            </div>
            <div>
              <span className="text-xs font-bold text-[#191c19] block">
                Completado
              </span>
              <span className="text-xs text-[#707970]">
                {totalAprobadas} de {total} materias
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-[#003217] rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#191c19] block">
              {totalAprobadas}
            </span>
            <span className="text-xs font-semibold text-[#404941]">
              Materias Aprobadas ({Math.round((totalAprobadas / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-[#785205] rounded-xl">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#191c19] block">
              {totalRegularizadas}
            </span>
            <span className="text-xs font-semibold text-[#404941]">
              Regularizadas (Listas para Final)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs flex items-center gap-4">
          <div className="p-3 bg-gray-100 text-[#707970] rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold font-serif text-[#191c19] block">
              {totalPendientes}
            </span>
            <span className="text-xs font-semibold text-[#404941]">
              Materias Pendientes
            </span>
          </div>
        </div>
      </div>

      {/* Year-by-Year Detailed Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-serif text-[#191c19]">
          Desglose por Año Académico
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {yearBreakdowns.map((yb) => (
            <div
              key={yb.year}
              className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold font-serif text-[#191c19]">
                    {yb.year}º Año
                  </span>
                  <span className="text-xs font-bold text-[#003217] font-mono bg-[#f2f4ee] px-2 py-0.5 rounded">
                    {yb.approved}/{yb.total} Aprobadas
                  </span>
                </div>

                <div className="w-full bg-[#e1e3dd] h-2.5 rounded-full overflow-hidden flex mb-3">
                  <div
                    className="bg-[#003217] h-full transition-all duration-500"
                    style={{ width: `${(yb.approved / yb.total) * 100}%` }}
                  />
                  <div
                    className="bg-[#b98b3e] h-full transition-all duration-500"
                    style={{ width: `${(yb.regular / yb.total) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 text-center text-xs py-2 bg-[#f8faf4] rounded-xl border border-[#e1e3dd] mb-3">
                  <div>
                    <span className="font-bold text-[#003217] block">{yb.approved}</span>
                    <span className="text-[10px] text-[#707970]">Aprob.</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#785205] block">{yb.regular}</span>
                    <span className="text-[10px] text-[#707970]">Reg.</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#707970] block">{yb.pending}</span>
                    <span className="text-[10px] text-[#707970]">Pend.</span>
                  </div>
                </div>
              </div>

              {/* Subject list badges */}
              <div className="space-y-1">
                {yb.subjects.map((sub) => {
                  const st = progress[sub.code] || 'pendiente';
                  return (
                    <div
                      key={sub.code}
                      className="flex items-center justify-between text-[11px] py-0.5"
                    >
                      <span className="text-[#191c19] truncate max-w-[200px]">
                        <strong className="font-mono">{sub.code}</strong> {sub.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        st === 'aprobada'
                          ? 'bg-[#003217] text-white'
                          : st === 'regular'
                          ? 'bg-[#fec975] text-[#785205]'
                          : 'bg-[#e1e3dd] text-[#707970]'
                      }`}>
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
