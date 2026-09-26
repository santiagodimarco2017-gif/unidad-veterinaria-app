import React, { useState } from 'react';
import type { SubjectEvaluation, SubjectState, ViewMode } from '../types';
import { 
  CheckCircle2, 
  BookmarkCheck, 
  Lock, 
  Unlock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  AlertTriangle,
  Info,
  Check
} from 'lucide-react';

interface SubjectCardProps {
  evaluation: SubjectEvaluation;
  viewMode: ViewMode;
  onStateChange: (code: string, newState: SubjectState) => void;
  onSelectSubject?: (code: string) => void;
  /** Mostrar el detalle (correlativas y materias que destraba) abierto de entrada */
  defaultExpanded?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  evaluation,
  viewMode,
  onStateChange,
  onSelectSubject,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { subject, state, isEnabled, missingPrereqs, completedPrereqs, effectivePrereqs, unlocksSubjects } = evaluation;
  const totalReqsCount = effectivePrereqs?.length ?? subject.prerequisites.length;

  // Colors according to Academic Precision specification:
  // Approved: Green (#003217 / #054b26)
  // Regularized: Gold (#b98b3e / #fec975)
  // Pendiente/Habilitada: Soft Green (#32CD32 / #054b26)
  // Pendiente/Bloqueada: Neutral / Soft Red / Muted

  const getStateBadge = () => {
    switch (state) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1 bg-[#003217] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#fec975]" />
            <span>Aprobada</span>
          </span>
        );
      case 'regular':
        return (
          <span className="inline-flex items-center gap-1 bg-[#fec975] text-[#785205] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs border border-[#b98b3e]/30">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#785205]" />
            <span>Regularizada</span>
          </span>
        );
      case 'pendiente':
      default:
        if (isEnabled) {
          return (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-[#003217] text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-300">
              <Unlock className="w-3.5 h-3.5 text-[#054b26]" />
              <span>Habilitada</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 bg-[#ecefe9] text-[#707970] text-xs font-medium px-2.5 py-1 rounded-full border border-[#c0c9be]">
            <Lock className="w-3.5 h-3.5 text-[#707970]" />
            <span>Bloqueada</span>
          </span>
        );
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
        state === 'aprobada'
          ? 'border-[#054b26]/30 bg-emerald-50/20 shadow-xs'
          : state === 'regular'
          ? 'border-[#fec975] bg-amber-50/20 shadow-xs'
          : isEnabled
          ? 'border-emerald-300 shadow-xs hover:border-[#054b26]'
          : 'border-[#e1e3dd] opacity-90 hover:opacity-100'
      }`}
    >
      {/* Main Bar */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Code badge */}
          <div className="flex-shrink-0">
            <span className="inline-block bg-[#f2f4ee] text-[#191c19] text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-[#c0c9be]">
              {subject.code}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-semibold font-sans text-[#191c19] leading-snug">
                {subject.name}
              </h3>
              {getStateBadge()}
            </div>

            {/* Prerequisite summary subtitle */}
            <div className="mt-1 flex items-center gap-2 text-xs text-[#707970] flex-wrap">
              <span>{subject.year}º Año</span>
              <span>•</span>
              {totalReqsCount === 0 ? (
                <span className="text-emerald-700 font-medium">Sin correlativas previas</span>
              ) : (
                <span>
                  Requisitos ({viewMode === 'cursar' ? 'cursar' : 'rendir'}):{' '}
                  <strong className={missingPrereqs.length > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                    {completedPrereqs.length}/{totalReqsCount} cumplidos
                  </strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e1e3dd]">
          
          {/* Status Buttons */}
          <div className="inline-flex p-0.5 bg-[#f2f4ee] rounded-lg border border-[#c0c9be]">
            <button
              onClick={() => onStateChange(subject.code, 'pendiente')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                state === 'pendiente'
                  ? 'bg-white text-[#191c19] shadow-xs'
                  : 'text-[#707970] hover:text-[#191c19]'
              }`}
              title="Marcar como Pendiente"
            >
              Pendiente
            </button>

            <button
              onClick={() => onStateChange(subject.code, 'regular')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                state === 'regular'
                  ? 'bg-[#fec975] text-[#785205] shadow-xs font-bold'
                  : 'text-[#707970] hover:text-[#785205]'
              }`}
              title="Marcar como Regularizada"
            >
              Regular
            </button>

            <button
              onClick={() => onStateChange(subject.code, 'aprobada')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                state === 'aprobada'
                  ? 'bg-[#003217] text-white shadow-xs font-bold'
                  : 'text-[#707970] hover:text-[#003217]'
              }`}
              title="Marcar como Aprobada"
            >
              Aprobada
            </button>
          </div>

          {/* Expand Details Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[#707970] hover:text-[#003217] hover:bg-[#f2f4ee] rounded-lg transition-colors"
            title="Ver correlativas e impacto"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Expandable Details Drawer */}
      {isExpanded && (
        <div className="bg-[#f8faf4] border-t border-[#e1e3dd] p-4 text-xs space-y-4">
          
          {/* Official Rule text */}
          <div className="flex items-start gap-2 bg-white p-3 rounded-lg border border-[#e1e3dd]">
            <Info className="w-4 h-4 text-[#054b26] flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#191c19]">Requisito según Resolución Plan 2009: </span>
              <span className="font-mono text-[#003217] font-semibold">{subject.rawPrereqsText || 'Ninguno'}</span>
              <p className="text-[#707970] mt-0.5">
                Modo activo (<strong>{viewMode === 'cursar' ? 'Para Cursar' : 'Para Rendir'}</strong>): Requiere que las materias previas estén {viewMode === 'cursar' ? 'Regularizadas o Aprobadas' : 'Aprobadas'}.
              </p>
            </div>
          </div>

          {/* Prerequisites Grid */}
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#404941] block mb-2">
              Correlativas Exigidas ({totalReqsCount})
            </span>

            {totalReqsCount === 0 ? (
              <p className="text-emerald-700 italic">Materia de primer año sin requisitos previos.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Completed */}
                {completedPrereqs.map((req) => (
                  <div
                    key={req.code}
                    onClick={() => onSelectSubject && onSelectSubject(req.code)}
                    className="flex items-center justify-between p-2 rounded-md bg-emerald-50 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="font-mono font-bold text-[#003217]">{req.code}</span>
                      <span className="text-[#191c19] truncate">{req.name}</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                      Cumplido
                    </span>
                  </div>
                ))}

                {/* Missing */}
                {missingPrereqs.map((req) => (
                  <div
                    key={req.code}
                    onClick={() => onSelectSubject && onSelectSubject(req.code)}
                    className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      <span className="font-mono font-bold text-amber-900">{req.code}</span>
                      <span className="text-[#191c19] truncate">{req.name}</span>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                      Falta
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unlocks Downstream Subjects */}
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#404941] block mb-2">
              Materias que Desbloquea ({unlocksSubjects.length})
            </span>

            {unlocksSubjects.length === 0 ? (
              <p className="text-[#707970] italic">Es una materia terminal del ciclo superior.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {unlocksSubjects.map((down) => (
                  <button
                    key={down.code}
                    onClick={() => onSelectSubject && onSelectSubject(down.code)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-[#003217] hover:text-white text-[#191c19] rounded-md border border-[#c0c9be] transition-colors font-sans"
                  >
                    <span className="font-mono font-bold text-xs">{down.code}</span>
                    <span className="text-xs">{down.name}</span>
                    <ArrowRight className="w-3 h-3 text-[#707970]" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
