import React, { useState } from 'react';
import type { StudentProgress, SubjectState, ViewMode } from '../types';
import { SUBJECTS, evaluateAllSubjects } from '../data/subjects';
import { Sparkles, ArrowRight, CheckCircle2, RotateCcw, Save, Zap } from 'lucide-react';

interface SimulatorModeProps {
  realProgress: StudentProgress;
  viewMode: ViewMode;
  onApplySimulation: (simulatedProgress: StudentProgress) => void;
}

export const SimulatorMode: React.FC<SimulatorModeProps> = ({
  realProgress,
  viewMode,
  onApplySimulation
}) => {
  // Temporary simulation state initialized from real progress
  const [simProgress, setSimProgress] = useState<StudentProgress>({ ...realProgress });

  // Evaluate baseline vs simulation
  const baselineEval = evaluateAllSubjects(realProgress, viewMode);
  const simEval = evaluateAllSubjects(simProgress, viewMode);

  // Find newly unlocked subjects
  const newlyUnlocked: string[] = [];
  const newlyApproved: string[] = [];

  for (const [code, simItem] of simEval.entries()) {
    const baseItem = baselineEval.get(code);

    if (simProgress[code] === 'aprobada' && realProgress[code] !== 'aprobada') {
      newlyApproved.push(code);
    }

    if (simItem.isEnabled && baseItem && !baseItem.isEnabled && simItem.state !== 'aprobada') {
      newlyUnlocked.push(code);
    }
  }

  const handleSimStateToggle = (code: string) => {
    setSimProgress((prev) => {
      const current = prev[code] || 'pendiente';
      let nextState: SubjectState = 'pendiente';
      if (current === 'pendiente') nextState = 'regular';
      else if (current === 'regular') nextState = 'aprobada';
      else nextState = 'pendiente';

      return { ...prev, [code]: nextState };
    });
  };

  const resetSim = () => setSimProgress({ ...realProgress });

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#7e570b] via-[#b98b3e] to-[#785205] text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white">
              <Sparkles className="w-6 h-6 text-[#fec975]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold bg-[#fec975] text-[#785205] px-2 py-0.5 rounded-full font-sans">
                  Modo Experimental
                </span>
                <span className="text-xs text-amber-100">Simulador de Mesas de Examen y Cursado</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-white mt-1">
                ¿Qué pasa si apruebo en la próxima mesa?
              </h2>
              <p className="text-xs text-amber-100/90 mt-0.5">
                Marca materias como simuladas (Regular o Aprobada) para ver en tiempo real qué materias del ciclo superior se destraban sin alterar tu avance real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetSim}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reiniciar Simulación</span>
            </button>

            {newlyApproved.length > 0 && (
              <button
                onClick={() => onApplySimulation(simProgress)}
                className="px-4 py-2 bg-[#fec975] text-[#785205] hover:bg-white hover:text-[#003217] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all animate-bounce"
              >
                <Save className="w-4 h-4" />
                <span>Aplicar a mi Progreso Real ({newlyApproved.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Impact Live Summary Box */}
      <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs">
        <h3 className="text-sm font-bold font-serif text-[#191c19] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#b98b3e]" />
          Impacto de la Simulación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Approved in Sim */}
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
            <span className="font-bold text-[#785205] block mb-1">
              Materias simuladas aprobadas ({newlyApproved.length}):
            </span>
            {newlyApproved.length === 0 ? (
              <p className="text-[#707970] italic">
                Toca en cualquier materia abajo para simular que la aprobaste.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newlyApproved.map((code) => {
                  const s = SUBJECTS.find((sub) => sub.code === code);
                  return (
                    <span
                      key={code}
                      className="px-2.5 py-1 bg-[#fec975] text-[#785205] font-bold rounded-lg font-mono text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {code} {s?.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Newly Unlocked Subjects */}
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
            <span className="font-bold text-[#003217] block mb-1">
              Nuevas materias destrabadas ({newlyUnlocked.length}):
            </span>
            {newlyUnlocked.length === 0 ? (
              <p className="text-[#707970] italic">
                No hay nuevas materias destrabadas por el momento.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {newlyUnlocked.map((code) => {
                  const s = SUBJECTS.find((sub) => sub.code === code);
                  return (
                    <span
                      key={code}
                      className="px-2.5 py-1 bg-[#003217] text-white font-bold rounded-lg font-mono text-xs flex items-center gap-1 shadow-xs"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-[#fec975]" />
                      {code} {s?.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Simulation List */}
      <div className="bg-white p-5 rounded-2xl border border-[#e1e3dd] shadow-xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#e1e3dd] pb-3">
          <span className="text-xs font-bold uppercase text-[#404941]">
            Selecciona materias para alternar estado simulado
          </span>
          <span className="text-xs text-[#707970]">
            Haz clic para alternar: Pendiente → Regular → Aprobada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUBJECTS.map((subject) => {
            const st = simProgress[subject.code] || 'pendiente';
            const isChanged = simProgress[subject.code] !== realProgress[subject.code];

            let buttonClass = 'bg-[#f8faf4] border-[#e1e3dd] text-[#191c19]';
            if (st === 'aprobada') buttonClass = 'bg-[#003217] border-[#003217] text-white font-bold';
            else if (st === 'regular') buttonClass = 'bg-[#fffdf8] border-[#fec975] text-[#785205] font-bold';

            return (
              <button
                key={subject.code}
                onClick={() => handleSimStateToggle(subject.code)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 relative ${buttonClass} ${
                  isChanged ? 'ring-2 ring-[#fec975] shadow-md' : 'hover:border-[#054b26]'
                }`}
              >
                {isChanged && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#fec975] text-[#785205] text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#b98b3e]">
                    Simulado
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    st === 'aprobada' ? 'bg-white/20 text-white' : 'bg-black/10 text-current'
                  }`}>
                    {subject.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    {st}
                  </span>
                </div>

                <div className="text-xs font-semibold leading-tight line-clamp-2">
                  {subject.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
