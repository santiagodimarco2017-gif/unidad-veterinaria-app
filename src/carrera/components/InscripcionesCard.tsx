// Tarjeta de Mesas: próxima inscripción en Guaraní, materias que el alumno puede rendir o cursar según sus
// correlativas, aviso por notificación, eventos de la facultad y mails de cátedras (datos de fveter).
import React from 'react';
import { Bell, BellOff, ExternalLink, Mail } from 'lucide-react';
import type { StudentProgress } from '../types';
import { getAllExamDates2026 } from '../data/calendar';
import { SUBJECTS } from '../data/subjects';
import { MAIL_CATEDRA, MAILS_OPTATIVAS, URL_FCV_NOTICIAS, eventosVigentes } from '../data/fcv';
import {
  URL_GUARANI,
  diaCorto,
  listarMaterias,
  materiasParaCursar,
  materiasParaRendir,
  proximaInscripcionCursado,
} from '../inscripciones';

interface Props {
  progress: StudentProgress;
  avisosActivos: boolean;
  onToggleAvisos: (activo: boolean) => void;
  onSubjectSelect: (code: string) => void;
}

const hoyIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const linkExterno = 'inline-flex items-center gap-1.5 rounded-xl font-bold no-underline active:scale-95 transition-all';

export const InscripcionesCard: React.FC<Props> = ({ progress, avisosActivos, onToggleAvisos, onSubjectSelect }) => {
  const hoy = hoyIso();
  const rendir = materiasParaRendir(progress);
  const cursar = materiasParaCursar(progress);
  const cursado = proximaInscripcionCursado();
  const mesas = getAllExamDates2026()
    .filter((e) => e.dateStr >= hoy)
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  const proximaMesa = (code: string) => mesas.find((e) => e.subjectCode === code);
  const eventos = eventosVigentes();
  const sinAvance = Object.keys(progress).length === 0;

  return (
    <div className="space-y-4">
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-3" aria-labelledby="insc-titulo">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="insc-titulo" className="text-lg font-black text-slate-900 leading-tight">Inscripciones en Guaraní</h2>
            <p className="text-[13px] text-slate-600 leading-snug mt-0.5">
              {cursado
                ? `Cursado ${cursado.apertura.title.split(' - ')[1] ?? ''}: abre el ${diaCorto(cursado.apertura.dateStr)}${
                    cursado.cierre ? ` y cierra el ${diaCorto(cursado.cierre.dateStr)}` : ''
                  }.`
                : 'No quedan inscripciones a cursado en el calendario 2026. Para mesas, avisamos 5 días antes.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onToggleAvisos(!avisosActivos)}
            aria-pressed={avisosActivos}
            className={`shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl text-[13px] font-bold transition-all ${
              avisosActivos ? 'bg-[#068136] text-white' : 'bg-white text-[#054b26] border border-[#068136]'
            }`}
          >
            {avisosActivos ? <Bell className="w-4 h-4" aria-hidden /> : <BellOff className="w-4 h-4" aria-hidden />}
            {avisosActivos ? 'Avisos activos' : 'Avisarme'}
          </button>
        </div>

        {sinAvance ? (
          <p className="text-[14px] text-slate-700">
            Marcá tus materias aprobadas y regularizadas en Materias para ver qué podés rendir y cursar.
          </p>
        ) : (
          <>
            <div>
              <h3 className="text-[14px] font-bold text-slate-900">Podés rendir ({rendir.length})</h3>
              {rendir.length === 0 ? (
                <p className="text-[13px] text-slate-600">Ninguna regularizada con las correlativas aprobadas.</p>
              ) : (
                <ul className="mt-1 divide-y divide-slate-100">
                  {rendir.map((s) => {
                    const mesa = proximaMesa(s.code);
                    return (
                      <li key={s.code}>
                        <button
                          type="button"
                          onClick={() => onSubjectSelect(s.code)}
                          className="w-full min-h-[44px] flex items-center justify-between gap-3 py-1.5 text-left"
                        >
                          <span className="text-[14px] font-semibold text-slate-800">{s.name}</span>
                          <span className="text-[12px] text-slate-600 shrink-0">
                            {mesa ? `Mesa ${diaCorto(mesa.dateStr)}` : 'Sin mesas en 2026'}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {cursado && cursar.length > 0 && (
              <p className="text-[13px] text-slate-700">
                <span className="font-bold">Podés cursar ({cursar.length}):</span> {listarMaterias(cursar, 4)}.
              </p>
            )}
          </>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <a
            href={URL_GUARANI}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkExterno} bg-[#068136] text-white text-[13px] px-3.5 py-2.5`}
          >
            Inscribirme en Guaraní <ExternalLink className="w-4 h-4" aria-hidden />
          </a>
        </div>
        <p className="text-[12px] text-slate-500 leading-snug">
          Lo calculamos con lo que marcaste en Correlativas y el calendario 2026. Confirmá siempre en Guaraní.
        </p>
      </section>

      {eventos.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 space-y-2" aria-labelledby="ev-titulo">
          <h2 id="ev-titulo" className="text-lg font-black text-slate-900 leading-tight">Eventos de la facultad</h2>
          <ul className="space-y-2">
            {eventos.map((e) => (
              <li key={e.url}>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
                  <span className="block text-[12px] font-bold text-[#05672b]">
                    {e.dateStr ? diaCorto(e.dateStr) : 'Fecha a confirmar'}
                  </span>
                  <span className="block text-[14px] font-semibold text-slate-900">{e.titulo}</span>
                  <span className="block text-[13px] text-slate-600">{e.detalle}</span>
                </a>
              </li>
            ))}
          </ul>
          <a href={URL_FCV_NOTICIAS} target="_blank" rel="noopener noreferrer" className={`${linkExterno} text-[#054b26] text-[13px]`}>
            Todas las novedades en fveter.unr.edu.ar <ExternalLink className="w-4 h-4" aria-hidden />
          </a>
        </section>
      )}

      <details className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4">
        <summary className="text-[15px] font-bold text-slate-900 cursor-pointer min-h-[28px]">Mails de cátedras</summary>
        <p className="text-[12px] text-slate-500 mt-1">
          Según fveter.unr.edu.ar. El mail de cada materia también está en su detalle.
        </p>
        <ul className="mt-2 divide-y divide-slate-100">
          {SUBJECTS
            .filter((s) => MAIL_CATEDRA[s.code])
            .map((s) => ({ nombre: s.name, mail: MAIL_CATEDRA[s.code] }))
            .concat(MAILS_OPTATIVAS)
            .map(({ nombre, mail }) => (
              <li key={mail}>
                <a href={`mailto:${mail}`} className="flex items-center gap-2 min-h-[44px] py-1 no-underline">
                  <Mail className="w-4 h-4 text-[#05672b] shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-slate-900">{nombre}</span>
                    <span className="block text-[12px] text-slate-600 break-all">{mail}</span>
                  </span>
                </a>
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
};
