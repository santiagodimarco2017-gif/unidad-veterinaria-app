import React, { useState } from 'react';
import type { SubjectEvaluation, ViewMode } from '../types';
import { SUBJECTS } from '../data/subjects';
import { GitFork, Lock, CheckCircle2, BookmarkCheck, Sparkles } from 'lucide-react';

interface DependencyTreeGraphProps {
  evaluations: Map<string, SubjectEvaluation>;
  viewMode: ViewMode;
  onSelectSubject: (code: string) => void;
}

export const DependencyTreeGraph: React.FC<DependencyTreeGraphProps> = ({
  evaluations,
  viewMode,
  onSelectSubject
}) => {
  const [selectedCode, setSelectedCode] = useState<string | null>('2.12'); // Default to Fisiología
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');

  const selectedEvaluation = selectedCode ? evaluations.get(selectedCode) : null;

  // Compute prerequisites tree for selected subject (recursive ancestors)
  const getAncestorCodes = (code: string, visited = new Set<string>()): Set<string> => {
    const subj = SUBJECTS.find((s) => s.code === code);
    if (!subj) return visited;

    const reqs = viewMode === 'cursar'
      ? [...(subj.cursarRegularPrereqs || []), ...(subj.cursarAprobadaPrereqs || [])]
      : (subj.rendirAprobadaPrereqs || subj.prerequisites);

    for (const req of reqs) {
      if (!visited.has(req)) {
        visited.add(req);
        getAncestorCodes(req, visited);
      }
    }
    return visited;
  };

  // Compute downstream unlocked subjects (recursive descendants)
  const getDescendantCodes = (code: string, visited = new Set<string>()): Set<string> => {
    const unlocked = SUBJECTS.filter((s) => 
      s.prerequisites.includes(code) || 
      s.cursarRegularPrereqs?.includes(code) ||
      s.cursarAprobadaPrereqs?.includes(code) ||
      s.rendirAprobadaPrereqs?.includes(code)
    );
    for (const d of unlocked) {
      if (!visited.has(d.code)) {
        visited.add(d.code);
        getDescendantCodes(d.code, visited);
      }
    }
    return visited;
  };

  const ancestorSet = selectedCode ? getAncestorCodes(selectedCode) : new Set<string>();
  const descendantSet = selectedCode ? getDescendantCodes(selectedCode) : new Set<string>();

  const years = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#003217] text-[#fec975] rounded-xl shadow-xs">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#191c19]">
                Mapa Interactivo de Correlatividades
              </h2>
              <p className="text-xs text-[#707970] mt-0.5">
                Haz clic en cualquier materia para ver toda su cadena de correlativas previas y las materias futuras que destraba.
              </p>
            </div>
          </div>

          {/* Year selector filter for graph */}
          <div className="flex items-center gap-1 bg-[#f2f4ee] p-1 rounded-xl border border-[#c0c9be]">
            <button
              onClick={() => setFilterYear('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterYear === 'all'
                  ? 'bg-[#003217] text-white shadow-xs'
                  : 'text-[#404941] hover:text-[#191c19]'
              }`}
            >
              Todos los Años
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterYear === y
                    ? 'bg-[#003217] text-white shadow-xs'
                    : 'text-[#404941] hover:text-[#191c19]'
                }`}
              >
                {y}º
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-[#e1e3dd] flex flex-wrap items-center gap-4 text-xs text-[#404941]">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[#707970]">Leyenda:</span>
          
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#003217]"></span>
            <span>Aprobada</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#fec975] border border-[#b98b3e]"></span>
            <span>Regularizada</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-300"></span>
            <span>Habilitada</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#e1e3dd]"></span>
            <span>Bloqueada</span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-[#b98b3e]" />
            <span>Seleccionada: {selectedCode || 'Ninguna'}</span>
          </div>
        </div>
      </div>

      {/* Selected Subject Impact Inspector Panel */}
      {selectedEvaluation && (
        <div className="bg-gradient-to-r from-[#003217] to-[#054b26] text-white p-5 rounded-2xl shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/20">
            <div>
              <span className="text-xs font-mono font-bold bg-[#fec975] text-[#003217] px-2 py-0.5 rounded">
                {selectedEvaluation.subject.code}
              </span>
              <h3 className="text-xl font-bold font-serif mt-1">
                {selectedEvaluation.subject.name}
              </h3>
              <p className="text-xs text-emerald-100">
                {selectedEvaluation.subject.year}º Año • Requisito: {selectedEvaluation.subject.rawPrereqsText}
              </p>
            </div>

            <button
              onClick={() => onSelectSubject(selectedEvaluation.subject.code)}
              className="px-3 py-1.5 bg-white text-[#003217] hover:bg-[#fec975] hover:text-[#003217] rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
            >
              Ir a la lista de materias
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Direct & Indirect Ancestors */}
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-[#fec975] block mb-1">
                Chain Ancestors / Requisitos de esta materia ({ancestorSet.size}):
              </span>
              {ancestorSet.size === 0 ? (
                <span className="text-emerald-200 italic">No requiere ninguna materia previa.</span>
              ) : (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.from(ancestorSet).map((code) => {
                    const sub = SUBJECTS.find((s) => s.code === code);
                    const st = evaluations.get(code)?.state || 'pendiente';
                    return (
                      <span
                        key={code}
                        onClick={() => setSelectedCode(code)}
                        className={`px-2 py-1 rounded cursor-pointer text-[11px] font-mono font-bold transition-all ${
                          st === 'aprobada'
                            ? 'bg-[#fec975] text-[#003217]'
                            : st === 'regular'
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                        title={sub?.name}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct & Indirect Descendants */}
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <span className="font-bold text-[#fec975] block mb-1">
                Materias Futuras que Traba/Destraba ({descendantSet.size}):
              </span>
              {descendantSet.size === 0 ? (
                <span className="text-emerald-200 italic">No traba materias posteriores.</span>
              ) : (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.from(descendantSet).map((code) => {
                    const sub = SUBJECTS.find((s) => s.code === code);
                    return (
                      <span
                        key={code}
                        onClick={() => setSelectedCode(code)}
                        className="px-2 py-1 bg-white/20 hover:bg-white/40 text-white rounded cursor-pointer text-[11px] font-mono font-bold transition-all"
                        title={sub?.name}
                      >
                        {code}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grid of All Years & Subjects */}
      <div className="space-y-6">
        {years
          .filter((y) => filterYear === 'all' || filterYear === y)
          .map((year) => {
            const yearSubjects = SUBJECTS.filter((s) => s.year === year);

            return (
              <div key={year} className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e1e3dd]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#003217] text-white text-xs font-serif font-bold flex items-center justify-center">
                      {year}
                    </span>
                    <h3 className="font-serif font-bold text-base text-[#191c19]">
                      {year}º Año Académico
                    </h3>
                  </div>
                  <span className="text-xs text-[#707970]">
                    {yearSubjects.length} materias
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {yearSubjects.map((subject) => {
                    const ev = evaluations.get(subject.code);
                    const state = ev?.state || 'pendiente';
                    const isEnabled = ev?.isEnabled || false;

                    const isSelected = selectedCode === subject.code;
                    const isAncestor = selectedCode ? ancestorSet.has(subject.code) : false;
                    const isDescendant = selectedCode ? descendantSet.has(subject.code) : false;

                    let bgClass = 'bg-[#f8faf4] border-[#e1e3dd] text-[#191c19]';
                    if (state === 'aprobada') {
                      bgClass = 'bg-[#003217] text-white border-[#003217]';
                    } else if (state === 'regular') {
                      bgClass = 'bg-[#fffdf8] text-[#785205] border-[#fec975]';
                    } else if (isEnabled) {
                      bgClass = 'bg-emerald-50 text-[#003217] border-emerald-300';
                    }

                    // Highlight border if selected, ancestor, or descendant
                    let highlightRing = '';
                    if (isSelected) {
                      highlightRing = 'ring-4 ring-[#fec975] shadow-lg scale-[1.02] z-10';
                    } else if (isAncestor) {
                      highlightRing = 'ring-2 ring-amber-400 border-amber-400';
                    } else if (isDescendant) {
                      highlightRing = 'ring-2 ring-emerald-400 border-emerald-400';
                    }

                    return (
                      <button
                        key={subject.code}
                        onClick={() => setSelectedCode(subject.code)}
                        className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between min-h-[90px] relative ${bgClass} ${highlightRing}`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              state === 'aprobada' ? 'bg-white/20 text-white' : 'bg-black/10 text-current'
                            }`}>
                              {subject.code}
                            </span>

                            {state === 'aprobada' && <CheckCircle2 className="w-4 h-4 text-[#fec975]" />}
                            {state === 'regular' && <BookmarkCheck className="w-4 h-4 text-[#785205]" />}
                            {state === 'pendiente' && isEnabled && (
                              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-bold">
                                List
                              </span>
                            )}
                            {state === 'pendiente' && !isEnabled && <Lock className="w-3.5 h-3.5 text-[#707970]" />}
                          </div>

                          <span className="text-xs font-semibold leading-tight line-clamp-2">
                            {subject.name}
                          </span>
                        </div>

                        <div className="mt-2 text-[10px] opacity-80 truncate">
                          Req: {subject.rawPrereqsText}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};
