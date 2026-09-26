import React, { useRef } from 'react';
import type { StudentProgress } from '../types';
import { SUBJECTS } from '../data/subjects';
import { X, Printer, Copy, Check, GraduationCap, Calendar, Share2 } from 'lucide-react';
import { esNativo } from '../../services/plataforma';

interface AcademicReportModalProps {
  progress: StudentProgress;
  onClose: () => void;
}

export const AcademicReportModal: React.FC<AcademicReportModalProps> = ({
  progress,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const total = SUBJECTS.length;
  let aprobadasCount = 0;
  let regularizedCount = 0;

  for (const s of SUBJECTS) {
    const st = progress[s.code] || 'pendiente';
    if (st === 'aprobada') aprobadasCount++;
    else if (st === 'regular') regularizedCount++;
  }

  const percentage = Math.round((aprobadasCount / total) * 100);
  const todayDate = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const armarResumen = () => {
    let summaryText = `🎓 *Mi Avance en Medicina Veterinaria (FCV-UNR)* 🎓\n`;
    summaryText += `📅 Fecha: ${todayDate}\n`;
    summaryText += `📊 Avance General: ${percentage}% (${aprobadasCount}/${total} Aprobadas)\n`;
    summaryText += `⭐ Regularizadas (Listas para Final): ${regularizedCount}\n\n`;

    summaryText += `*Detalle por Año:*\n`;
    [1, 2, 3, 4, 5, 6].forEach((y) => {
      const yrSubs = SUBJECTS.filter((s) => s.year === y);
      const approvedYr = yrSubs.filter((s) => progress[s.code] === 'aprobada').length;
      summaryText += `• ${y}º Año: ${approvedYr}/${yrSubs.length} Aprobadas\n`;
    });

    summaryText += `\nGenerado con Correlativas FCV-UNR (Plan 2009 / Res. CD 90/2026)`;
    return summaryText;
  };

  const handleCopyText = () => {
    const summaryText = armarResumen();
    // navigator.clipboard puede no existir (contexto no seguro) o rechazar: no romper la UI
    navigator.clipboard?.writeText(summaryText).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // En la app nativa (WebView) window.print() no hace nada: se comparte el resumen.
  const nativo = esNativo();
  const handlePrint = async () => {
    if (!nativo) {
      window.print();
      return;
    }
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: 'Mi avance en Medicina Veterinaria', text: armarResumen(), dialogTitle: 'Compartir avance' });
    } catch {
      /* cancelado */
    }
  };

  return (
    <div className="carrera-overlay bg-black/60 backdrop-blur-sm flex items-stretch sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Reporte académico">
      <div className="bg-white sm:rounded-2xl shadow-2xl max-w-3xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:border border-[#e1e3dd]">
        
        {/* Header toolbar */}
        <div className="p-3 sm:p-4 bg-[#003217] text-white flex flex-wrap gap-2 justify-between items-center print:hidden">
          <div className="flex items-center space-x-2 min-w-0">
            <GraduationCap className="w-6 h-6 text-[#fec975] shrink-0" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
              Reporte Académico de Correlatividades
            </h3>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#fec975]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Resumen'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#fec975] text-[#003217] hover:bg-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {nativo ? <Share2 className="w-4 h-4" /> : <Printer className="w-4 h-4" />}
              <span>{nativo ? 'Compartir' : 'Imprimir / PDF'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Cerrar reporte"
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div ref={printRef} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-[#191c19] print:p-0 flex-1 min-h-0">
          
          {/* Institutional Header */}
          <div className="border-b-2 border-[#003217] pb-4 flex flex-col sm:flex-row gap-2 justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#054b26]">
                Universidad Nacional de Rosario • FCV
              </span>
              <h1 className="text-2xl font-bold font-serif text-[#003217] mt-1">
                Ficha de Avance Académico
              </h1>
              <p className="text-xs text-[#707970]">
                Carrera de Medicina Veterinaria (Plan de Estudios 2009 - Res. CD 90/2026)
              </p>
            </div>

            <div className="sm:text-right text-xs text-[#707970]">
              <div className="flex items-center sm:justify-end gap-1 font-semibold text-[#191c19]">
                <Calendar className="w-3.5 h-3.5 text-[#054b26]" />
                <span>{todayDate}</span>
              </div>
              <span className="mt-1 block font-mono font-bold text-[#003217]">
                Estado: {percentage}% Aprobado
              </span>
            </div>
          </div>

          {/* Overview badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-[#f8faf4] rounded-xl border border-[#e1e3dd] text-center">
            <div>
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#003217] block">
                {aprobadasCount} / {total}
              </span>
              <span className="text-xs text-[#707970]">Materias Aprobadas</span>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#785205] block">
                {regularizedCount}
              </span>
              <span className="text-xs text-[#707970]">Regularizadas</span>
            </div>
            <div>
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#191c19] block">
                {percentage}%
              </span>
              <span className="text-xs text-[#707970]">Avance de Carrera</span>
            </div>
          </div>

          {/* Full Table of Subjects */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-[#191c19] border-b border-[#e1e3dd] pb-1">
              Detalle de Asignaturas y Correlatividades
            </h4>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[520px] text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#003217] text-white">
                  <th className="p-2 font-mono">CÓD.</th>
                  <th className="p-2">ASIGNATURA</th>
                  <th className="p-2 text-center">AÑO</th>
                  <th className="p-2">REQUISITOS PARA RENDIR</th>
                  <th className="p-2 text-center">ESTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e3dd]">
                {SUBJECTS.map((sub) => {
                  const st = progress[sub.code] || 'pendiente';
                  return (
                    <tr key={sub.code} className="hover:bg-[#f8faf4]">
                      <td className="p-2 font-mono font-bold text-[#003217]">{sub.code}</td>
                      <td className="p-2 font-semibold text-[#191c19]">{sub.name}</td>
                      <td className="p-2 text-center">{sub.year}º</td>
                      <td className="p-2 text-[#707970] font-mono text-[11px]">{sub.rawPrereqsText}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          st === 'aprobada'
                            ? 'bg-[#003217] text-white'
                            : st === 'regular'
                            ? 'bg-[#fec975] text-[#785205]'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {st}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#707970] border-t border-[#e1e3dd] pt-4">
            Documento informativo personal para planificación de cursado y exámenes. Facultad de Ciencias Veterinarias, Universidad Nacional de Rosario (Casilda).
          </div>

        </div>

      </div>
    </div>
  );
};
