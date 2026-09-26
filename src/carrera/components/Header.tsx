import React from 'react';
import type { ViewMode, TabType } from '../types';
import { UnidadVeterinariaLogoHorizontal } from './UnidadVeterinariaLogo';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  GitFork, 
  Sparkles, 
  BarChart3, 
  Calendar as CalendarIcon,
  RotateCcw, 
  Download, 
  Upload, 
  Printer,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  approvedCount: number;
  totalCount: number;
  regularizedCount: number;
  readyToCourseCount: number;
  readyToExamCount: number;
  onReset: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onPrint: () => void;
  isSimulating: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activeTab,
  setActiveTab,
  approvedCount,
  totalCount,
  readyToCourseCount,
  readyToExamCount,
  onReset,
  onExport,
  onImportClick,
  onPrint,
  isSimulating
}) => {
  const percentage = Math.round((approvedCount / totalCount) * 100);

  return (
    <header className="bg-gradient-to-r from-[#003217] via-[#054b26] to-[#0d5c32] text-white shadow-lg sticky top-0 z-40">
      {/* Top Banner / Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <UnidadVeterinariaLogoHorizontal className="hidden sm:inline-flex shrink-0 scale-95" />
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner sm:hidden">
              <GraduationCap className="w-8 h-8 text-[#fec975]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider bg-[#fec975] text-[#003217] px-2 py-0.5 rounded-full font-sans">
                  FCV - UNR
                </span>
                <span className="text-xs font-medium text-emerald-200/90 bg-white/10 px-2 py-0.5 rounded-full">
                  Plan 2009 • Res. CD 30/2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white mt-0.5">
                Correlativas FCV-UNR
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-sans">
                Medicina Veterinaria • Casilda
              </p>
            </div>
          </div>

          {/* Overall Progress Indicator Header Widget */}
          <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/10 backdrop-blur-sm self-start md:self-auto min-w-[280px]">
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-white/20"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-[#fec975] transition-all duration-700 ease-out"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - approvedCount / totalCount)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold font-serif text-[#fec975]">
                {percentage}%
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs text-emerald-100 font-medium">Progreso General</span>
                <span className="text-xs font-bold text-[#fec975]">
                  {approvedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#fec975] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-200 mt-1 flex justify-between">
                <span>Habilitadas cursar: <strong className="text-white">{readyToCourseCount}</strong></span>
                <span>Rendir: <strong className="text-white">{readyToExamCount}</strong></span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Toolbar */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          
          {/* View Mode Toggle: Para Cursar vs Para Rendir */}
          <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setViewMode('cursar')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cursar'
                  ? 'bg-white text-[#003217] shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Para Cursar</span>
              <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                viewMode === 'cursar' ? 'bg-[#003217] text-white' : 'bg-white/20 text-white'
              }`}>
                {readyToCourseCount}
              </span>
            </button>

            <button
              onClick={() => setViewMode('rendir')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'rendir'
                  ? 'bg-[#fec975] text-[#003217] shadow-md'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Para Rendir</span>
              <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                viewMode === 'rendir' ? 'bg-[#003217] text-white' : 'bg-white/20 text-white'
              }`}>
                {readyToExamCount}
              </span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-black/20 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveTab('lista')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'lista'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Materias</span>
            </button>

            <button
              onClick={() => setActiveTab('arbol')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'arbol'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Mapa de Correlativas</span>
            </button>

            <button
              onClick={() => setActiveTab('simulador')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulador'
                  ? 'bg-[#fec975] text-[#003217] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#fec975]" />
              <span>Simulador</span>
              {isSimulating && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('estadisticas')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'estadisticas'
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab('calendario')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'calendario'
                  ? 'bg-[#fec975] text-[#003217] font-bold shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendario 2026</span>
            </button>
          </nav>

          {/* Quick Tools (Backup, Restore, Print, Reset) */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onPrint}
              title="Ver / Imprimir Reporte Académico"
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Reporte</span>
            </button>

            <button
              onClick={onExport}
              title="Exportar copia de seguridad (JSON)"
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Guardar</span>
            </button>

            <button
              onClick={onImportClick}
              title="Cargar copia de seguridad"
              className="p-1.5 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg text-xs flex items-center gap-1 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Cargar</span>
            </button>

            <button
              onClick={onReset}
              title="Reiniciar todo el avance"
              className="p-1.5 text-red-200 hover:text-white hover:bg-red-500/30 rounded-lg text-xs flex items-center gap-1 transition-all ml-1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
