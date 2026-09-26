// Pestaña "Carrera" de Unidad Veterinaria: Correlativas FCV-UNR (Plan 2009 mod. 2026).
// Portado de la app web original y adaptado a una pestaña móvil con SOLO 3 secciones:
//   Materias (inicio) · Mesas (calendario, con "¿Cómo llego?") · Herramientas (menú: correlativas,
//   simulador, estadísticas, reporte, juego, borrar avance).
// Barra de secciones pegajosa (respeta el notch), relleno inferior para la barra de pestañas,
// modales a pantalla completa por encima de ella y botón atrás de Android que los cierra.
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { StudentProgress, SubjectState, Subject, ViewMode, ExamDate } from './types';
import { SUBJECTS, evaluateAllSubjects } from './data/subjects';
import { AcademicCalendar } from './components/AcademicCalendar';
import { DependencyTreeGraph } from './components/DependencyTreeGraph';
import { SimulatorMode } from './components/SimulatorMode';
import { AcademicStatsView } from './components/AcademicStatsView';
import { DashboardStats } from './components/DashboardStats';
import { AcademicReportModal } from './components/AcademicReportModal';
import { SubjectDetailModal } from './components/SubjectDetailModal';
import { STORAGE_KEY } from './proximaMesa';
import { useNav } from '../state/Nav';
import { useApp } from '../state/AppState';
import { opcionesParaLlegar, parsearHoraMesa } from '../lib/comoLlego';
import { urlGoogleCalendar } from '../lib/googleCalendar';
import { EMPRESAS } from '../data';
import {
  Clock,
  BookOpen,
  Search,
  Calendar,
  Download,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  CheckCircle2,
  GitFork,
  Sparkles,
  BarChart3,
  Wrench,
  Gamepad2,
  RotateCcw,
} from 'lucide-react';
import './carrera.css';

// El juego (y Firebase, para el ranking online) se descargan recién al abrirlo.
const FlappyUnidadModal = lazy(() =>
  import('./components/FlappyUnidadModal').then((m) => ({ default: m.FlappyUnidadModal })),
);

type Seccion = 'materias' | 'mesas' | 'herramientas';
type Herramienta = 'correlativas' | 'simulador' | 'estadisticas';
type Filtro = 'todas' | 'aprobadas' | 'regularizadas' | 'puedo_cursar' | 'puedo_rendir' | 'no_puedo_cursar';

const SECCIONES: { id: Seccion; etiqueta: string; Icono: typeof BookOpen }[] = [
  { id: 'materias', etiqueta: 'Materias', Icono: CheckCircle2 },
  { id: 'mesas', etiqueta: 'Mesas', Icono: Calendar },
  { id: 'herramientas', etiqueta: 'Herramientas', Icono: Wrench },
];

const HERRAMIENTA_TITULO: Record<Herramienta, string> = {
  correlativas: 'Correlativas',
  simulador: 'Simulador',
  estadisticas: 'Estadísticas',
};

// Se recuerda la sección mientras la app está abierta (la pestaña se desmonta al cambiar de tab).
let seccionRecordada: Seccion = 'materias';

export default function CarreraApp() {
  const nav = useNav();
  const app = useApp();
  const [progress, setProgress] = useState<StudentProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    return {};
  });

  const [seccion, setSeccionState] = useState<Seccion>(seccionRecordada);
  const [herramienta, setHerramientaState] = useState<Herramienta | null>(null);
  const [activeTab, setActiveTab] = useState<ViewMode>('cursar');
  const [activeFilter, setActiveFilter] = useState<Filtro>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFlappyOpen, setIsFlappyOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [detalleCodigo, setDetalleCodigo] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const setSeccion = useCallback((s: Seccion) => {
    seccionRecordada = s;
    setSeccionState(s);
    setHerramientaState(null);
    rootRef.current?.scrollTo({ top: 0 });
  }, []);

  const setHerramienta = useCallback((h: Herramienta | null) => {
    setHerramientaState(h);
    rootRef.current?.scrollTo({ top: 0 });
  }, []);

  // Collapse state for years (all open by default)
  const [openYears, setOpenYears] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true
  });

  // Save progress to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [progress]);

  // Botón atrás de Android: cierra primero los modales de Carrera y después la herramienta abierta.
  const abiertos = useRef({ isFlappyOpen, isReportOpen, detalleCodigo, herramienta });
  abiertos.current = { isFlappyOpen, isReportOpen, detalleCodigo, herramienta };
  useEffect(() => nav.registrarAtras(() => {
    const a = abiertos.current;
    if (a.isFlappyOpen) { setIsFlappyOpen(false); return true; }
    if (a.isReportOpen) { setIsReportOpen(false); return true; }
    if (a.detalleCodigo) { setDetalleCodigo(null); return true; }
    if (a.herramienta) { setHerramienta(null); return true; }
    return false;
  }), [nav.registrarAtras, setHerramienta]);

  // Evaluated subjects map
  const evalCursar = evaluateAllSubjects(progress, 'cursar');
  const evalRendir = evaluateAllSubjects(progress, 'rendir');

  // Stats calculation
  const totalSubjects = SUBJECTS.length; // 48
  let approvedCount = 0;
  let regularCount = 0;
  let readyToCourseCount = 0;
  let readyToExamCount = 0;
  let cannotCourseCount = 0;

  SUBJECTS.forEach((subject) => {
    const st = progress[subject.code] || 'pendiente';
    if (st === 'aprobada') approvedCount++;
    if (st === 'regular') regularCount++;

    const cursarEnable = evalCursar.get(subject.code)?.isEnabled;
    const rendirEnable = evalRendir.get(subject.code)?.isEnabled;

    if (cursarEnable && st !== 'aprobada') readyToCourseCount++;
    if (rendirEnable && st !== 'aprobada') readyToExamCount++;
    if (!cursarEnable && st === 'pendiente') cannotCourseCount++;
  });

  const generalPercentage = Math.round((approvedCount / totalSubjects) * 100);

  // Cycle state: pendiente -> regular (1 tap) -> aprobada (2 taps) -> pendiente
  const handleSubjectTap = (code: string) => {
    setProgress((prev) => {
      const current = prev[code] || 'pendiente';
      let next: SubjectState = 'pendiente';
      if (current === 'pendiente') {
        next = 'regular';
      } else if (current === 'regular') {
        next = 'aprobada';
      } else {
        next = 'pendiente';
      }
      return {
        ...prev,
        [code]: next,
      };
    });
  };

  const setSubjectState = (code: string, next: SubjectState) => {
    setProgress((prev) => ({ ...prev, [code]: next }));
  };

  const handleReset = () => {
    if (window.confirm('¿Querés borrar todo tu avance guardado? No se puede deshacer.')) {
      setProgress({});
    }
  };

  const toggleYear = (yearNum: number) => {
    setOpenYears((prev) => ({ ...prev, [yearNum]: !prev[yearNum] }));
  };

  const toggleAllYears = (expand: boolean) => {
    setOpenYears({
      1: expand,
      2: expand,
      3: expand,
      4: expand,
      5: expand,
      6: expand
    });
  };

  const allExpanded = Object.values(openYears).every(Boolean);

  // Ir a la lista de materias buscando una materia (desde calendario o mapa)
  const irAMateria = (code: string) => {
    setActiveFilter('todas');
    setSearchQuery(code);
    setSeccion('materias');
  };

  // "¿Cómo llego?" → hoja de colectivos Rosario → Casilda
  const comoLlego = (exam: ExamDate) => {
    nav.abrirComoLlego({
      fecha: exam.dateStr,
      hora: parsearHoraMesa(exam.timeStr),
      titulo: exam.subjectName,
      subtitulo: exam.turnName,
    });
  };

  // "Agendar en Google Calendar": evento con la mesa y, si hay, el colectivo que llega a tiempo.
  const linkAgendar = (exam: ExamDate): string => {
    const hora = parsearHoraMesa(exam.timeStr);
    const lineas = [`Mesa de examen · ${exam.turnName}`];
    if (hora) {
      const [a, m, d] = exam.dateStr.split('-').map(Number);
      const op = opcionesParaLlegar(app.visibles, new Date(a, m - 1, d), app.feriados, hora, 3);
      const mejor = op.salidas.find((s) => s.servicio.id === op.mejorId);
      if (op.modo === 'a-tiempo' && mejor) {
        const empresa = EMPRESAS[mejor.servicio.empresa]?.nombre ?? '';
        lineas.push(`🚌 Desde Rosario: ${empresa} de las ${mejor.servicio.sale} (llega ${mejor.servicio.llega}). Confirmá el horario en la app.`);
      }
    }
    lineas.push('Agendado desde la app Unidad Veterinaria.');
    return urlGoogleCalendar({
      titulo: `Mesa: ${exam.subjectName}`,
      fecha: exam.dateStr,
      hora,
      duracionMin: 180,
      detalles: lineas.join('\n'),
      lugar: 'Facultad de Ciencias Veterinarias (UNR), Casilda, Santa Fe',
    });
  };

  // Group subjects by Year (1 to 6)
  const years = [1, 2, 3, 4, 5, 6];

  // Helper labels for years
  const yearNames: { [key: number]: string } = {
    1: 'Primer año',
    2: 'Segundo año',
    3: 'Tercer año',
    4: 'Cuarto año',
    5: 'Quinto año',
    6: 'Sexto año / Orientación'
  };

  // Filter subject logic
  const filterSubject = (subject: Subject) => {
    const st = progress[subject.code] || 'pendiente';
    const canCourse = evalCursar.get(subject.code)?.isEnabled;
    const canExam = evalRendir.get(subject.code)?.isEnabled;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = subject.name.toLowerCase().includes(q);
      const matchCode = subject.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    // Secondary Filter Pill
    if (activeFilter === 'aprobadas') return st === 'aprobada';
    if (activeFilter === 'regularizadas') return st === 'regular';
    if (activeFilter === 'puedo_cursar') return st !== 'aprobada' && canCourse;
    if (activeFilter === 'puedo_rendir') return st !== 'aprobada' && canExam;
    if (activeFilter === 'no_puedo_cursar') return st === 'pendiente' && !canCourse;

    return true;
  };

  // Filtros de las tarjetas de estadísticas → filtros de la lista
  const filtroDesdeDashboard = (f: string) => {
    const mapa: Record<string, Filtro> = {
      aprobada: 'aprobadas',
      regular: 'regularizadas',
      habilitada: activeTab === 'rendir' ? 'puedo_rendir' : 'puedo_cursar',
      bloqueada: 'no_puedo_cursar',
    };
    setActiveFilter(mapa[f] ?? 'todas');
    setSearchQuery('');
    setSeccion('materias');
  };

  const pill = (activo: boolean) =>
    `px-3.5 py-2 rounded-full font-bold transition-all text-[13px] whitespace-nowrap ${
      activo ? 'bg-[#068136] text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
    }`;

  return (
    <div ref={rootRef} className="carrera-root print:bg-white">

      {/* Barra de secciones (pegajosa, toma el inset superior): 3 botones grandes con texto */}
      <nav className="carrera-subnav border-b border-slate-200/80 print:hidden" aria-label="Secciones de Carrera">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-2 px-4 pt-3 pb-3">
          {SECCIONES.map(({ id, etiqueta, Icono }) => {
            const on = seccion === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSeccion(id)}
                aria-current={on ? 'page' : undefined}
                className={`min-h-[52px] inline-flex flex-col items-center justify-center gap-0.5 px-1 rounded-2xl text-[13px] font-bold transition-all ${
                  on
                    ? 'bg-[#068136] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <Icono className="w-5 h-5" />
                {etiqueta}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto w-full px-4 pt-4 space-y-5">

        {seccion === 'materias' && (
          <>
            {/* Tarjeta de avance (compacta) */}
            <header className="bg-[#068136] text-white rounded-3xl p-5 shadow-md relative overflow-hidden print:shadow-none print:bg-emerald-800">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" aria-hidden>
                    <path
                      className="text-white/25"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#f0c979] transition-all duration-700 ease-out"
                      strokeDasharray={`${generalPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center flex flex-col items-center justify-center leading-none">
                    <span className="text-xl font-black">{approvedCount}</span>
                    <span className="text-[11px] opacity-90">de {totalSubjects}</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-[1.45rem] leading-tight font-black tracking-tight text-white font-serif">
                    Tu carrera
                  </h1>
                  <p className="text-[15px] font-bold text-white mt-0.5">{generalPercentage}% aprobado</p>
                  <p className="text-[13px] text-white/90 mt-0.5">
                    {regularCount} regularizadas · {readyToCourseCount} para cursar
                  </p>
                  <p className="text-[12px] text-white/80 mt-1">Medicina Veterinaria · Plan 2009 · FCV-UNR</p>
                </div>
              </div>
            </header>

            {/* Qué puedo cursar / Qué puedo rendir */}
            <div className="grid grid-cols-2 gap-2.5 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('cursar');
                  setActiveFilter(activeFilter === 'puedo_cursar' ? 'todas' : 'puedo_cursar');
                }}
                aria-pressed={activeTab === 'cursar' && activeFilter === 'puedo_cursar'}
                className={`min-h-[56px] py-3 px-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 text-center leading-tight ${
                  activeTab === 'cursar' && activeFilter === 'puedo_cursar'
                    ? 'bg-[#068136] text-white shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                Qué puedo cursar ({readyToCourseCount})
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('rendir');
                  setActiveFilter(activeFilter === 'puedo_rendir' ? 'todas' : 'puedo_rendir');
                }}
                aria-pressed={activeTab === 'rendir' && activeFilter === 'puedo_rendir'}
                className={`min-h-[56px] py-3 px-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 text-center leading-tight ${
                  activeTab === 'rendir' && activeFilter === 'puedo_rendir'
                    ? 'bg-[#068136] text-white shadow-md'
                    : 'bg-white text-slate-800 border border-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                Qué puedo rendir ({readyToExamCount})
              </button>
            </div>

            <div className="space-y-4">

              {/* Buscador */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar materia por nombre o código"
                  aria-label="Buscar materia"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-5 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl text-[15px] text-slate-800 placeholder-slate-500 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#068136]"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-sm font-bold text-slate-500"
                  >
                    ✕
                  </button>
                ) : (
                  <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                )}
              </div>

              {/* Filtros (fila desplazable) */}
              <div className="flex items-center gap-2 overflow-x-auto carrera-scroll-x -mx-4 px-4 pb-0.5" role="group" aria-label="Filtrar materias">
                <button type="button" onClick={() => setActiveFilter('todas')} className={pill(activeFilter === 'todas')}>
                  Todas ({totalSubjects})
                </button>
                <button type="button" onClick={() => setActiveFilter('aprobadas')} className={pill(activeFilter === 'aprobadas')}>
                  Aprobadas ({approvedCount})
                </button>
                <button type="button" onClick={() => setActiveFilter('regularizadas')} className={pill(activeFilter === 'regularizadas')}>
                  Regularizadas ({regularCount})
                </button>
                <button type="button" onClick={() => setActiveFilter('no_puedo_cursar')} className={pill(activeFilter === 'no_puedo_cursar')}>
                  Bloqueadas ({cannotCourseCount})
                </button>
              </div>

              {/* Cómo se usa */}
              <div className="bg-[#e6f2ea] border border-[#bfdcc9] text-[#0b3a1d] text-[14px] px-4 py-3 rounded-2xl leading-snug">
                <strong>Cómo marcar:</strong> tocá una materia <strong>1 vez</strong> = Regularizada, <strong>2 veces</strong> = Aprobada, 3 = vuelve a Pendiente. Con <strong>ⓘ</strong> ves sus correlativas.
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toggleAllYears(!allExpanded)}
                  className="text-[#05672b] font-bold text-sm underline min-h-[40px] px-1"
                >
                  {allExpanded ? 'Cerrar todos los años' : 'Abrir todos los años'}
                </button>
              </div>

              {/* Años (plegables) */}
              <div className="space-y-4">
                {years.map((yearNum) => {
                  const yearSubjects = SUBJECTS.filter((s) => s.year === yearNum).filter(filterSubject);
                  const yearTotal = SUBJECTS.filter((s) => s.year === yearNum).length;
                  const yearApproved = SUBJECTS.filter((s) => s.year === yearNum && progress[s.code] === 'aprobada').length;

                  if (yearSubjects.length === 0 && searchQuery) return null;

                  const isOpen = openYears[yearNum];

                  return (
                    <div
                      key={yearNum}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleYear(yearNum)}
                        aria-expanded={isOpen}
                        className="w-full p-4 flex items-center justify-between text-left select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#e6f2ea] text-[#05672b] font-black text-sm flex items-center justify-center shrink-0">
                            {yearNum}
                          </div>
                          <h2 className="text-base font-bold text-slate-800 leading-tight">
                            {yearNames[yearNum]}{' '}
                            <span className="text-[13px] font-semibold text-slate-500 ml-1 whitespace-nowrap">
                              {yearApproved}/{yearTotal} aprobadas
                            </span>
                          </h2>
                        </div>
                        <span className="text-slate-500 p-1">
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 pt-0 grid grid-cols-1 gap-2.5 border-t border-slate-100">
                          {yearSubjects.length === 0 && (
                            <p className="text-[13px] text-slate-500 pt-3">Ninguna materia de este año con el filtro elegido.</p>
                          )}
                          {yearSubjects.map((subject) => {
                            const st = progress[subject.code] || 'pendiente';
                            const canCourse = evalCursar.get(subject.code)?.isEnabled;
                            const canExam = evalRendir.get(subject.code)?.isEnabled;

                            const isApproved = st === 'aprobada';
                            const isRegular = st === 'regular';

                            let badgeText = 'Faltan correlativas';
                            let badgeBg = 'text-slate-500';

                            if (isApproved) {
                              badgeText = 'Aprobada';
                              badgeBg = 'text-emerald-700 font-bold';
                            } else if (isRegular) {
                              badgeText = 'Regularizada';
                              badgeBg = 'text-amber-800 font-bold';
                            } else if (canExam && (activeTab === 'rendir' || activeFilter === 'puedo_rendir')) {
                              badgeText = 'Puedo rendir';
                              badgeBg = 'text-blue-700 font-bold';
                            } else if (canCourse) {
                              badgeText = 'Puedo cursar';
                              badgeBg = 'text-emerald-700 font-bold';
                            }

                            return (
                              <div
                                key={subject.code}
                                onClick={() => handleSubjectTap(subject.code)}
                                className={`first:mt-3 p-3 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 ${
                                  isApproved
                                    ? 'bg-emerald-50/80 border-emerald-300'
                                    : isRegular
                                    ? 'bg-amber-50/80 border-amber-300'
                                    : canExam && (activeTab === 'rendir' || activeFilter === 'puedo_rendir')
                                    ? 'bg-blue-50/80 border-blue-300'
                                    : canCourse
                                    ? 'bg-white border-[#dfd8cc]'
                                    : 'bg-slate-50/50 border-slate-200 opacity-80'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                    isApproved
                                      ? 'bg-emerald-600 text-white'
                                      : isRegular
                                      ? 'bg-amber-500 text-white'
                                      : canCourse
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}>
                                    {isApproved ? (
                                      <Check className="w-5 h-5 stroke-[3]" />
                                    ) : isRegular ? (
                                      <Clock className="w-4 h-4" />
                                    ) : canCourse ? (
                                      <BookOpen className="w-4 h-4" />
                                    ) : (
                                      <Lock className="w-4 h-4" />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-slate-700">{subject.code}</span>
                                      <span>•</span>
                                      <span className={badgeBg}>{badgeText}</span>
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900 leading-snug line-clamp-2">
                                      {subject.name}
                                    </h3>
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1">
                                  <span className={`text-[12px] px-2.5 py-1 rounded-xl font-extrabold ${
                                    isApproved
                                      ? 'bg-emerald-700 text-white'
                                      : isRegular
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {isApproved ? 'Aprobada' : isRegular ? 'Regular' : 'Pendiente'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDetalleCodigo(subject.code);
                                    }}
                                    aria-label={`Ver correlativas de ${subject.name}`}
                                    className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-all"
                                  >
                                    <Info className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </>
        )}

        {/* MESAS (calendario académico, con "¿Cómo llego?") */}
        {seccion === 'mesas' && (
          <AcademicCalendar
            evaluations={Object.fromEntries(evalRendir)}
            progress={progress}
            onSubjectSelect={irAMateria}
            onComoLlego={comoLlego}
            linkAgendar={linkAgendar}
          />
        )}

        {/* HERRAMIENTAS: menú simple */}
        {seccion === 'herramientas' && !herramienta && (
          <div className="space-y-5">
            <MenuGrupo>
              <MenuFila
                Icono={GitFork}
                titulo="Correlativas"
                sub="Qué materia habilita a cuál (árbol)"
                onClick={() => setHerramienta('correlativas')}
              />
              <MenuFila
                Icono={Sparkles}
                titulo="Simulador"
                sub="Probá qué se habilita si aprobás materias"
                onClick={() => setHerramienta('simulador')}
              />
              <MenuFila
                Icono={BarChart3}
                titulo="Estadísticas"
                sub="Tu avance en números y gráficos"
                onClick={() => setHerramienta('estadisticas')}
              />
              <MenuFila
                Icono={Download}
                titulo="Reporte de avance"
                sub="Copiá, compartí o imprimí tu ficha"
                onClick={() => setIsReportOpen(true)}
              />
            </MenuGrupo>

            <MenuGrupo>
              <MenuFila
                Icono={Gamepad2}
                titulo="Flappy Unidad"
                sub="Un juego para cortar el estudio"
                onClick={() => setIsFlappyOpen(true)}
                dorado
              />
              <MenuFila
                Icono={RotateCcw}
                titulo="Borrar mi avance"
                sub="Deja todas las materias como pendientes"
                onClick={handleReset}
                peligro
              />
            </MenuGrupo>

            <p className="text-center text-[13px] text-slate-600 px-4">
              Correlativas FCV-UNR · Plan 2009 · Res. C.D. Nº 30/2026 · Unidad Veterinaria
            </p>
          </div>
        )}

        {seccion === 'herramientas' && herramienta && (
          <>
            <div className="flex items-center gap-2 -mt-1">
              <button
                type="button"
                onClick={() => setHerramienta(null)}
                className="inline-flex items-center gap-1 min-h-[44px] pr-3 pl-1 rounded-xl text-[#05672b] font-bold text-[15px]"
              >
                <ChevronLeft className="w-5 h-5" />
                Herramientas
              </button>
              <h2 className="text-lg font-black text-slate-900 ml-auto pr-1">{HERRAMIENTA_TITULO[herramienta]}</h2>
            </div>

            <ModoSwitch modo={activeTab} setModo={setActiveTab} />

            {herramienta === 'correlativas' && (
              <div className="overflow-x-hidden">
                <DependencyTreeGraph
                  evaluations={activeTab === 'rendir' ? evalRendir : evalCursar}
                  viewMode={activeTab}
                  onSelectSubject={irAMateria}
                />
              </div>
            )}

            {herramienta === 'simulador' && (
              <SimulatorMode
                key={JSON.stringify(progress)}
                realProgress={progress}
                viewMode={activeTab}
                onApplySimulation={(sim) => {
                  setProgress(sim);
                  setSeccion('materias');
                }}
              />
            )}

            {herramienta === 'estadisticas' && (
              <>
                <DashboardStats
                  progress={progress}
                  viewMode={activeTab}
                  readyToCourseCount={readyToCourseCount}
                  readyToExamCount={readyToExamCount}
                  onFilterChange={filtroDesdeDashboard}
                />
                <AcademicStatsView progress={progress} viewMode={activeTab} />
              </>
            )}
          </>
        )}

      </div>

      <div className="h-6" aria-hidden />

      {/* Modales (por encima de la barra de pestañas; atrás de Android los cierra) */}
      {detalleCodigo && (
        <SubjectDetailModal
          code={detalleCodigo}
          progress={progress}
          initialMode={activeTab}
          onStateChange={setSubjectState}
          onSelectSubject={(code) => setDetalleCodigo(code)}
          onClose={() => setDetalleCodigo(null)}
        />
      )}

      {isReportOpen && (
        <AcademicReportModal progress={progress} onClose={() => setIsReportOpen(false)} />
      )}

      {isFlappyOpen && (
        <Suspense fallback={null}>
          <FlappyUnidadModal
            isOpen={isFlappyOpen}
            onClose={() => setIsFlappyOpen(false)}
          />
        </Suspense>
      )}

    </div>
  );
}

function MenuGrupo({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
      {children}
    </div>
  );
}

function MenuFila({ Icono, titulo, sub, onClick, dorado, peligro }: {
  Icono: typeof BookOpen;
  titulo: string;
  sub: string;
  onClick: () => void;
  dorado?: boolean;
  peligro?: boolean;
}) {
  const color = peligro ? 'bg-red-50 text-red-700' : dorado ? 'bg-[#f6ecd9] text-[#7a5718]' : 'bg-[#e6f2ea] text-[#05672b]';
  return (
    <button type="button" onClick={onClick} className="w-full min-h-[72px] flex items-center gap-3.5 px-4 py-3 text-left active:bg-slate-50">
      <span className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icono className="w-[22px] h-[22px]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className={`block text-base font-bold ${peligro ? 'text-red-700' : 'text-slate-900'}`}>{titulo}</span>
        <span className="block text-[14px] text-slate-600 leading-snug">{sub}</span>
      </span>
      <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
    </button>
  );
}

/** Selector "Para cursar / Para rendir" para Correlativas, Simulador y Estadísticas */
function ModoSwitch({ modo, setModo }: { modo: ViewMode; setModo: (m: ViewMode) => void }) {
  return (
    <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-xs" role="radiogroup" aria-label="Ver requisitos">
      <button
        type="button"
        role="radio"
        aria-checked={modo === 'cursar'}
        onClick={() => setModo('cursar')}
        className={`flex-1 min-h-[44px] px-3 rounded-xl text-sm font-bold transition-all ${
          modo === 'cursar' ? 'bg-[#068136] text-white shadow-xs' : 'text-slate-700'
        }`}
      >
        Para cursar
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={modo === 'rendir'}
        onClick={() => setModo('rendir')}
        className={`flex-1 min-h-[44px] px-3 rounded-xl text-sm font-bold transition-all ${
          modo === 'rendir' ? 'bg-[#068136] text-white shadow-xs' : 'text-slate-700'
        }`}
      >
        Para rendir
      </button>
    </div>
  );
}
