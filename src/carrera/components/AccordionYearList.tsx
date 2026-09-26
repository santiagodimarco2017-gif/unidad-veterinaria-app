import React, { useState } from 'react';
import type { SubjectEvaluation, SubjectState, ViewMode } from '../types';
import { SubjectCard } from './SubjectCard';
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface AccordionYearListProps {
  evaluations: Map<string, SubjectEvaluation>;
  viewMode: ViewMode;
  onStateChange: (code: string, newState: SubjectState) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  highlightedSubjectCode?: string;
  onSelectSubject?: (code: string) => void;
}

const YEAR_TITLES: Record<number, string> = {
  1: '1er Año • Formación Básica',
  2: '2do Año • Formación Pre-clínica',
  3: '3er Año • Formación Pre-clínica y Diagnóstica',
  4: '4to Año • Patología y Terapéutica',
  5: '5to Año • Producciones Animales y Salud Pública',
  6: '6to Año • Clínica y Ciclo Orientado',
};

export const AccordionYearList: React.FC<AccordionYearListProps> = ({
  evaluations,
  viewMode,
  onStateChange,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  highlightedSubjectCode,
  onSelectSubject
}) => {
  // Years open state (default all open)
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleYear = (year: number) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const expandAll = () => setOpenYears({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true });
  const collapseAll = () => setOpenYears({ 1: false, 2: false, 3: false, 4: false, 5: false, 6: false });

  // Convert map values to list
  const allList: SubjectEvaluation[] = Array.from(evaluations.values());

  // Filter logic
  const filteredList = allList.filter((ev) => {
    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = ev.subject.name.toLowerCase().includes(q);
      const matchCode = ev.subject.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    // Status / Availability filter
    if (activeFilter === 'aprobada') return ev.state === 'aprobada';
    if (activeFilter === 'regular') return ev.state === 'regular';
    if (activeFilter === 'habilitada') return ev.isEnabled && ev.state !== 'aprobada';
    if (activeFilter === 'bloqueada') return !ev.isEnabled && ev.state !== 'aprobada';

    return true; // 'todos'
  });

  // Group by year
  const years = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e1e3dd] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#707970] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar materia por nombre o código (ej. Semiología, 3.18.1)..."
              className="w-full pl-9 pr-4 py-2 bg-[#f8faf4] border border-[#c0c9be] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#054b26] focus:bg-white text-[#191c19] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#707970] hover:text-[#191c19] bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'todos'
                  ? 'bg-[#003217] text-white shadow-xs'
                  : 'bg-[#f2f4ee] text-[#404941] hover:bg-[#e6e9e3]'
              }`}
            >
              Todas (48)
            </button>

            <button
              onClick={() => setActiveFilter('habilitada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'habilitada'
                  ? 'bg-[#054b26] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Habilitadas
            </button>

            <button
              onClick={() => setActiveFilter('regular')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'regular'
                  ? 'bg-[#7e570b] text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              Regularizadas
            </button>

            <button
              onClick={() => setActiveFilter('aprobada')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === 'aprobada'
                  ? 'bg-[#003217] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              Aprobadas
            </button>
          </div>

        </div>

        {/* Accordion Expand/Collapse All controls */}
        <div className="flex justify-between items-center text-xs text-[#707970] pt-1 border-t border-[#e1e3dd]/60">
          <span>
            Mostrando <strong>{filteredList.length}</strong> de 48 materias
          </span>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="hover:text-[#003217] font-medium transition-colors"
            >
              Expandir todos
            </button>
            <span>•</span>
            <button
              onClick={collapseAll}
              className="hover:text-[#003217] font-medium transition-colors"
            >
              Colapsar todos
            </button>
          </div>
        </div>

      </div>

      {/* Accordion List by Year */}
      <div className="space-y-4">
        {years.map((year) => {
          const yearEvaluations = filteredList.filter((ev) => ev.subject.year === year);
          if (yearEvaluations.length === 0) return null;

          const totalYearCount = allList.filter((ev) => ev.subject.year === year).length;
          const approvedYearCount = yearEvaluations.filter((ev) => ev.state === 'aprobada').length;
          const isOpen = openYears[year];

          return (
            <div
              key={year}
              className="bg-white rounded-2xl border border-[#e1e3dd] shadow-xs overflow-hidden transition-all"
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleYear(year)}
                className="w-full px-5 py-4 bg-[#f8faf4] hover:bg-[#f2f4ee] flex items-center justify-between border-b border-[#e1e3dd] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#003217] text-white font-serif font-bold text-base flex items-center justify-center shadow-xs">
                    {year}º
                  </div>
                  <div>
                    <h2 className="text-base font-bold font-serif text-[#191c19]">
                      {YEAR_TITLES[year]}
                    </h2>
                    <span className="text-xs text-[#707970]">
                      {approvedYearCount} de {totalYearCount} aprobadas • {yearEvaluations.length} visibles
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Progress bar inside accordion header */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 bg-[#e1e3dd] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#003217] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(approvedYearCount / totalYearCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#003217] font-mono">
                      {Math.round((approvedYearCount / totalYearCount) * 100)}%
                    </span>
                  </div>

                  <div className="p-1 rounded-lg text-[#707970] bg-white border border-[#c0c9be]">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div className="p-4 space-y-3 bg-[#f8faf4]/50">
                  {yearEvaluations.map((evaluation) => (
                    <div
                      key={evaluation.subject.code}
                      id={`subject-${evaluation.subject.code}`}
                      className={
                        highlightedSubjectCode === evaluation.subject.code
                          ? 'ring-2 ring-[#054b26] rounded-xl transition-all scale-[1.01]'
                          : ''
                      }
                    >
                      <SubjectCard
                        evaluation={evaluation}
                        viewMode={viewMode}
                        onStateChange={onStateChange}
                        onSelectSubject={onSelectSubject}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e1e3dd] p-8">
            <BookOpen className="w-12 h-12 text-[#707970] mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold font-serif text-[#191c19]">No se encontraron materias</h3>
            <p className="text-xs text-[#707970] mt-1 max-w-md mx-auto">
              Prueba cambiando la búsqueda o seleccionando un filtro diferente en la barra superior.
            </p>
            <button
              onClick={() => {
                setActiveFilter('todos');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-[#003217] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#054b26] transition-colors"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
