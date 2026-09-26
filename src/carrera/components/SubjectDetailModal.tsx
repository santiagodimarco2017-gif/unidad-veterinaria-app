// Detalle de una materia (adaptación móvil para Unidad Veterinaria): reutiliza SubjectCard con el
// detalle desplegado, en modo "Para cursar" o "Para rendir", a pantalla completa en el teléfono.
import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck } from 'lucide-react';
import type { StudentProgress, SubjectState, ViewMode } from '../types';
import { evaluateAllSubjects } from '../data/subjects';
import { SubjectCard } from './SubjectCard';

interface SubjectDetailModalProps {
  code: string;
  progress: StudentProgress;
  initialMode: ViewMode;
  onStateChange: (code: string, newState: SubjectState) => void;
  onSelectSubject: (code: string) => void;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  code,
  progress,
  initialMode,
  onStateChange,
  onSelectSubject,
  onClose,
}) => {
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const evaluation = evaluateAllSubjects(progress, mode).get(code);
  if (!evaluation) return null;

  return (
    <div
      className="carrera-overlay bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Materia ${evaluation.subject.name}`}
      onClick={onClose}
    >
      <div
        className="bg-[#f3f6f3] w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#003217] text-white px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-bold bg-[#fec975] text-[#003217] px-2 py-0.5 rounded">
              {evaluation.subject.code}
            </span>
            <h2 className="font-serif font-bold text-lg leading-tight mt-1">{evaluation.subject.name}</h2>
            <p className="text-[11px] text-emerald-100/90">{evaluation.subject.year}º año • Requisito: {evaluation.subject.rawPrereqsText || 'Ninguno'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle de materia"
            className="w-9 h-9 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 flex gap-1 bg-white border-b border-[#e1e3dd]">
          <button
            type="button"
            onClick={() => setMode('cursar')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'cursar' ? 'bg-[#003217] text-white shadow-xs' : 'bg-[#f2f4ee] text-[#404941]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Para cursar
          </button>
          <button
            type="button"
            onClick={() => setMode('rendir')}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'rendir' ? 'bg-[#fec975] text-[#003217] shadow-xs' : 'bg-[#f2f4ee] text-[#404941]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Para rendir
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          <SubjectCard
            key={`${code}-${mode}`}
            evaluation={evaluation}
            viewMode={mode}
            onStateChange={onStateChange}
            onSelectSubject={onSelectSubject}
            defaultExpanded
          />
        </div>
      </div>
    </div>
  );
};
