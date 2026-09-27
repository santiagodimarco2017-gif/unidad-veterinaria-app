// Plan de Estudios 2026: explorador interactivo del documento de la carpeta de Drive de Unidad Veterinaria.
// Cuatro vistas: materias (con contenidos y correlativas navegables), "tu pase" (equivalencias con el
// avance del Plan 2009 que el estudiante marcó en la app), transición año a año y orientaciones.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Page } from '../components/Page';
import { Icon } from '../components/Icon';
import { Chip, Segmented } from '../components/controles';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { haptic } from '../state/nativo';
import {
  CADUCIDAD_2009, CRONOGRAMA, INICIO_2026, MATERIAS_2026, ORIENTACIONES, PLAN_2026_DRIVE, RESUMEN_2026, origenes2009,
} from '../carrera/data/plan2026';
import type { Materia2026, Orientacion, SubOrientacion } from '../carrera/data/plan2026';
import { SUBJECT_MAP } from '../carrera/data/subjects';
import { leerProgreso } from '../carrera/proximaMesa';
import { estadoPlazos, simularPase } from '../carrera/pase2026';
import type { EstadoPase } from '../carrera/pase2026';

type Vista = 'materias' | 'pase' | 'transicion' | 'orientacion';

const POR_CODIGO = new Map(MATERIAS_2026.map((m) => [m.code, m]));
const CURSADO: Record<Materia2026['cursado'], string> = { '1c': '1° cuatri', '2c': '2° cuatri', anual: 'Anual' };
const MAX_HORAS = Math.max(...MATERIAS_2026.map((m) => m.horas));
const ANIOS = [1, 2, 3, 4, 5] as const;

const ESTADO_TXT: Record<EstadoPase, string> = {
  aprobada: 'Aprobada',
  'aprobada-parcial': 'Aprobada parcial',
  regular: 'Regular',
  'regular-parcial': 'Regular parcial',
};

/** Minúsculas y sin tildes */
const normal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function diasHasta(anio: number, ahora: Date): number {
  return Math.max(0, Math.ceil((new Date(anio, 2, 1).getTime() - ahora.getTime()) / 86_400_000));
}

export function Plan2026() {
  const [vista, setVista] = useState<Vista>('materias');
  const { ahora } = useApp();
  const progreso = useMemo(() => leerProgreso(), []);
  const pase = useMemo(() => simularPase(progreso), [progreso]);
  const dias = diasHasta(INICIO_2026, ahora);

  return (
    <Page
      titulo="Plan de Estudios 2026"
      accion={
        <a className="p26-drive" href={PLAN_2026_DRIVE} target="_blank" rel="noopener noreferrer" aria-label="Abrir la carpeta en Google Drive">
          <Icon name="external" size={20} />
        </a>
      }
    >
      <div className="screen p26">
        <header className="p26-hero">
          <p className="p26-hero__k">Medicina Veterinaria · FCV-UNR</p>
          <h2 className="p26-hero__t">El plan nuevo arranca en {INICIO_2026}</h2>
          <p className="p26-hero__cuenta">
            <Contador valor={dias} className="tnum" /> <span>días para el primer cuatrimestre</span>
          </p>
          <div className="p26-hero__stats">
            <Stat n={RESUMEN_2026.horas} t="horas" />
            <Stat n={MATERIAS_2026.length} t="materias" />
            <Stat n={12} t="orientaciones" />
            <Stat n={5.5} t="años" decimal />
          </div>
        </header>

        <div className="p26-seg">
          <Segmented<Vista>
            compacto
            etiqueta="Secciones del Plan 2026"
            valor={vista}
            onChange={setVista}
            opciones={[
              { valor: 'materias', etiqueta: 'Materias' },
              { valor: 'pase', etiqueta: 'Tu pase' },
              { valor: 'transicion', etiqueta: 'Transición' },
              { valor: 'orientacion', etiqueta: 'Orientación' },
            ]}
          />
        </div>

        <div className="p26-vista" key={vista}>
          {vista === 'materias' && <Materias pase={pase.porCodigo} />}
          {vista === 'pase' && <Pase progresoVacio={!Object.values(progreso).some((s) => s !== 'pendiente')} />}
          {vista === 'transicion' && <Transicion />}
          {vista === 'orientacion' && <Orientaciones />}
        </div>

        <a className="btn btn--outline btn--block sep-16" href={PLAN_2026_DRIVE} target="_blank" rel="noopener noreferrer">
          <Icon name="external" size={18} /> Ver los documentos en Drive
        </a>
        <p className="credit-foot">Fuente: Plan de Estudios 2026, carpeta compartida por Unidad Veterinaria. Confirmá siempre con la facultad.</p>
      </div>
    </Page>
  );
}

// ------------------------------------------------------------------ piezas chicas

/** Número que sube animado hasta `valor` */
function Contador({ valor, className, decimal }: { valor: number; className?: string; decimal?: boolean }) {
  const [reducido] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reducido) return;
    let raf = 0;
    const t0 = performance.now();
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      setN(valor * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, reducido]);
  const v = reducido ? valor : n;
  const txt = decimal ? v.toFixed(1).replace('.', ',') : Math.round(v).toLocaleString('es-AR');
  return <b className={className}>{txt}</b>;
}

function Stat({ n, t, decimal }: { n: number; t: string; decimal?: boolean }) {
  return (
    <span className="p26-stat">
      <Contador valor={n} className="tnum" decimal={decimal} />
      <small>{t}</small>
    </span>
  );
}

function Badge({ estado }: { estado: EstadoPase }) {
  return <span className={`p26-badge p26-badge--${estado}`}>{ESTADO_TXT[estado]}</span>;
}

// ------------------------------------------------------------------ Materias

function Materias({ pase }: { pase: Record<string, { estado: EstadoPase }> }) {
  const [anio, setAnio] = useState<number>(1);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [destello, setDestello] = useState<string | null>(null);
  const refs = useRef(new Map<string, HTMLDivElement>());

  const nq = normal(q.trim());
  const lista = nq
    ? MATERIAS_2026.filter((m) => normal(m.nombre).includes(nq) || normal(m.contenidos).includes(nq))
    : MATERIAS_2026.filter((m) => m.anio === anio);
  const horasAnio = MATERIAS_2026.filter((m) => m.anio === anio).reduce((s, m) => s + m.horas, 0);

  /** Salta a una materia (correlativa): cambia de año, la abre y la resalta */
  const ir = (code: string) => {
    const m = POR_CODIGO.get(code);
    if (!m) return;
    haptic();
    setQ('');
    setAnio(m.anio);
    setAbierta(code);
    setDestello(code);
    window.setTimeout(() => refs.current.get(code)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    window.setTimeout(() => setDestello(null), 1400);
  };

  return (
    <>
      <label className="buscador sep-12">
        <Icon name="search" size={20} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscá materia o tema (ej. vacunas)" aria-label="Buscar en el Plan 2026" />
        {q && (
          <button type="button" className="buscador__x" onClick={() => setQ('')} aria-label="Borrar búsqueda">
            <Icon name="close" size={18} />
          </button>
        )}
      </label>

      {!nq && (
        <>
          <div className="chips-row chips-row--scroll" role="group" aria-label="Año">
            {ANIOS.map((a) => (
              <Chip key={a} activo={anio === a} onClick={() => { setAnio(a); setAbierta(null); }}>{a}° año</Chip>
            ))}
          </div>
          <p className="p26-sub">
            {lista.length} materias · <b className="tnum">{horasAnio}</b> horas
          </p>
        </>
      )}
      {nq && <p className="p26-sub">{lista.length ? `${lista.length} resultado${lista.length > 1 ? 's' : ''}` : 'Sin resultados'}</p>}

      <div className="p26-lista">
        {lista.map((m, i) => {
          const open = abierta === m.code;
          const est = pase[m.code]?.estado;
          return (
            <div
              key={m.code}
              ref={(el) => { if (el) refs.current.set(m.code, el); else refs.current.delete(m.code); }}
              className={`p26-mat${open ? ' is-open' : ''}${destello === m.code ? ' is-flash' : ''}`}
              style={{ '--i': Math.min(i, 8) } as CSSProperties}
            >
              <button type="button" className="p26-mat__head" aria-expanded={open} onClick={() => { haptic(); setAbierta(open ? null : m.code); }}>
                <span className="p26-mat__code tnum">{m.code}</span>
                <span className="p26-mat__txt">
                  <span className="p26-mat__t">{m.nombre}</span>
                  <span className="p26-mat__meta">
                    <span className={`p26-cur p26-cur--${m.cursado}`}>{CURSADO[m.cursado]}</span>
                    <span className="p26-horas" aria-label={`${m.horas} horas`}>
                      <span className="p26-horas__bar" style={{ '--w': `${(m.horas / MAX_HORAS) * 100}%` } as CSSProperties} />
                      <span className="tnum">{m.horas} h</span>
                    </span>
                    {est && <Badge estado={est} />}
                  </span>
                </span>
                <Icon name="chevronDown" size={18} className="p26-mat__chev" />
              </button>
              {open && <DetalleMateria m={m} ir={ir} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

function DetalleMateria({ m, ir }: { m: Materia2026; ir: (c: string) => void }) {
  const origen = origenes2009(m.code);
  const progreso = leerProgreso();
  return (
    <div className="p26-mat__det">
      <h4>Contenidos mínimos</h4>
      <p>{m.contenidos}</p>

      <h4>Para rendirla necesitás</h4>
      {m.regulares.length || m.aprobadas.length ? (
        <div className="p26-corr">
          {m.aprobadas.map((c) => <CorrChip key={`a${c}`} code={c} tipo="aprobada" ir={ir} />)}
          {m.regulares.map((c) => <CorrChip key={`r${c}`} code={c} tipo="regular" ir={ir} />)}
        </div>
      ) : (
        <p className="muted">Sin correlativas.</p>
      )}

      {origen.length > 0 && (
        <>
          <h4>Viene del Plan 2009</h4>
          <ul className="p26-origen">
            {origen.map((o) => {
              const s = SUBJECT_MAP.get(o.code);
              const st = progreso[o.code];
              return (
                <li key={o.code}>
                  <span className={`p26-dot p26-dot--${st ?? 'pendiente'}`} aria-hidden />
                  <span>{s?.name ?? o.code}{o.p ? ' (parcial)' : ''}</span>
                  {st && st !== 'pendiente' && <small>{st === 'aprobada' ? 'la aprobaste' : 'la regularizaste'}</small>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function CorrChip({ code, tipo, ir }: { code: string; tipo: 'aprobada' | 'regular'; ir: (c: string) => void }) {
  const m = POR_CODIGO.get(code);
  return (
    <button type="button" className={`p26-corrchip p26-corrchip--${tipo}`} onClick={() => ir(code)}>
      <small>{tipo === 'aprobada' ? 'Aprobada' : 'Regular'}</small>
      {m?.nombre ?? code}
    </button>
  );
}

// ------------------------------------------------------------------ Tu pase

function Pase({ progresoVacio }: { progresoVacio: boolean }) {
  const nav = useNav();
  const { ahora } = useApp();
  const progreso = useMemo(() => leerProgreso(), []);
  const r = useMemo(() => simularPase(progreso), [progreso]);
  const plazos = useMemo(() => estadoPlazos(progreso, ahora), [progreso, ahora]);
  const horasCarrera = RESUMEN_2026.horas - RESUMEN_2026.orientacion.total;

  if (progresoVacio) {
    return (
      <div className="p26-vacio">
        <Icon name="graduationCap" size={36} />
        <p><b>Marcá tus materias del Plan 2009</b> y te mostramos cuáles tendrías en el Plan 2026 si te cambiás.</p>
        <button type="button" className="btn btn--primary" onClick={() => nav.irA('carrera')}>Ir al Plan de Estudio 2009</button>
      </div>
    );
  }

  return (
    <>
      <p className="p26-intro">Si te pasaras al Plan 2026 con lo que marcaste en el Plan 2009, quedarías así:</p>
      <div className="p26-kpis">
        <div className="p26-kpi p26-kpi--ok"><Contador valor={r.aprobadas} className="tnum" /><small>aprobadas</small></div>
        <div className="p26-kpi p26-kpi--parcial"><Contador valor={r.parciales} className="tnum" /><small>aprobadas parcial</small></div>
        <div className="p26-kpi p26-kpi--reg"><Contador valor={r.regulares} className="tnum" /><small>regulares</small></div>
      </div>
      <div className="p26-barra" role="img" aria-label={`${r.horas} de ${horasCarrera} horas reconocidas`}>
        <span style={{ '--w': `${(r.horas / horasCarrera) * 100}%` } as CSSProperties} />
      </div>
      <p className="p26-sub"><b className="tnum">{r.horas.toLocaleString('es-AR')}</b> de {horasCarrera.toLocaleString('es-AR')} horas del plan (sin la orientación) te quedarían reconocidas.</p>

      {ANIOS.map((a) => (
        <section className="grupo" key={a}>
          <h3 className="grupo__titulo">{a}° año</h3>
          <div className="grupo__caja">
            {MATERIAS_2026.filter((m) => m.anio === a).map((m) => {
              const e = r.porCodigo[m.code];
              return (
                <div className="p26-pase-fila" key={m.code}>
                  <span className={`p26-dot p26-dot--${e?.estado ?? 'pendiente'}`} aria-hidden />
                  <span className="p26-pase-fila__t">{m.nombre}</span>
                  {e ? <Badge estado={e.estado} /> : <small className="muted">A cursar</small>}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <h3 className="section__h sep-16" style={{ marginTop: 26 }}>Fechas que te afectan</h3>
      <ol className="p26-plazos">
        {plazos.map((p) => (
          <li key={p.articulo} className={p.cumple ? 'is-ok' : p.vencido ? 'is-venc' : 'is-warn'}>
            <span className="p26-plazos__ico"><Icon name={p.cumple ? 'check' : 'alert'} size={16} /></span>
            <div>
              <small>{p.articulo} · hasta el 31/12/{p.fecha.slice(0, 4)}{!p.vencido ? ` · faltan ${p.dias.toLocaleString('es-AR')} días` : ''}</small>
              <b>{p.texto}</b>
              <span className="p26-plazos__est">
                {p.cumple
                  ? 'Ya lo cumplís: seguís en el Plan 2009 si querés.'
                  : `Te falta ${p.faltan.map((c) => SUBJECT_MAP.get(c)?.name ?? c).join(', ')}. Si no, pasás automáticamente al Plan 2026.`}
              </span>
            </div>
          </li>
        ))}
        <li className="is-fin">
          <span className="p26-plazos__ico"><Icon name="flag" size={16} /></span>
          <div>
            <small>Art. 10 · 31/12/{CADUCIDAD_2009.slice(0, 4)}</small>
            <b>Caduca el Plan 2009</b>
            <span className="p26-plazos__est">Quien no se reciba para esa fecha pasa al Plan 2026 con equivalencias.</span>
          </div>
        </li>
      </ol>
      <p className="grupo__pie">Cambiarte es opcional (Art. 2): se pide en Asuntos Estudiantiles en el período del calendario académico. Las equivalencias parciales requieren rendir los contenidos que faltan.</p>
    </>
  );
}

// ------------------------------------------------------------------ Transición

function Transicion() {
  const { ahora } = useApp();
  const [fila, setFila] = useState<number | null>(null);
  // Año de la carrera en el que está el estudiante hoy (para dibujar su recorrido)
  const [cohorte, setCohorte] = useState<number | null>(null);
  const anioActual = ahora.getFullYear();

  const enCamino = (anioAcad: number, curso: number) => cohorte !== null && curso === cohorte + (anioAcad - anioActual);

  return (
    <>
      <p className="p26-intro">El plan nuevo entra de a un año por vez. Elegí en qué año de la carrera estás hoy para ver tu recorrido.</p>
      <div className="chips-row chips-row--scroll" role="group" aria-label="Tu año de cursado">
        {[1, 2, 3, 4, 5, 6].map((c) => (
          <Chip key={c} activo={cohorte === c} onClick={() => setCohorte(cohorte === c ? null : c)}>Estoy en {c}°</Chip>
        ))}
      </div>

      <div className="p26-grilla" role="table" aria-label="Qué plan se dicta en cada año">
        <div className="p26-grilla__fila p26-grilla__fila--head" role="row">
          <span role="columnheader" />
          {[1, 2, 3, 4, 5, 6].map((c) => <span key={c} role="columnheader">{c}°</span>)}
        </div>
        {CRONOGRAMA.map((f, r) => (
          <button
            type="button"
            key={f.anio}
            className={`p26-grilla__fila${fila === r ? ' is-on' : ''}`}
            role="row"
            onClick={() => { haptic(); setFila(fila === r ? null : r); }}
          >
            <span className="p26-grilla__anio tnum" role="rowheader">{f.anio}</span>
            {f.cursos.map((p, c) => (
              <span
                key={c}
                role="cell"
                className={`p26-celda p26-celda--${p}${enCamino(f.anio, c + 1) ? ' is-yo' : ''}`}
                style={{ '--d': `${r * 0.05 + c * 0.03}s` } as CSSProperties}
                aria-label={`${c + 1}° año: ${p === 'mixto' ? 'Plan 2026 + materias del 2009' : `Plan ${p}`}${enCamino(f.anio, c + 1) ? ' (vos)' : ''}`}
              >
                {p === 'mixto' ? '26+' : p.slice(2)}
              </span>
            ))}
          </button>
        ))}
      </div>
      <div className="p26-leyenda">
        <span><i className="p26-celda--2009" /> Plan 2009</span>
        <span><i className="p26-celda--2026" /> Plan 2026</span>
        <span><i className="p26-celda--mixto" /> 2026 + materias 2009</span>
        {cohorte !== null && <span><i className="p26-celda--yo" /> Vos</span>}
      </div>

      {fila !== null && (
        <div className="p26-nota" key={fila}>
          <b>{CRONOGRAMA[fila].anio}</b>{' '}
          {CRONOGRAMA[fila].nota ?? `Plan 2026 en ${CRONOGRAMA[fila].cursos.filter((x) => x === '2026').length} de 6 años; el resto sigue con el Plan 2009.`}
        </div>
      )}

      {cohorte !== null && <RecorridoTexto cohorte={cohorte} anioActual={anioActual} />}

      <p className="grupo__pie">Del 2028 al 2036 hay mesas de examen de los dos planes en cada turno (Art. 5).</p>
    </>
  );
}

function RecorridoTexto({ cohorte, anioActual }: { cohorte: number; anioActual: number }) {
  const pasos = CRONOGRAMA.map((f) => ({ anio: f.anio, curso: cohorte + (f.anio - anioActual) }))
    .filter((p) => p.curso >= 1 && p.curso <= 6)
    .map((p) => ({ ...p, plan: CRONOGRAMA.find((f) => f.anio === p.anio)!.cursos[p.curso - 1] }));
  const toca2026 = pasos.find((p) => p.plan !== '2009');
  return (
    <div className="p26-nota p26-nota--yo">
      {!pasos.length
        ? 'Para 2028 ya habrías terminado de cursar: el plan nuevo no te toca, salvo que te recibas después de 2036.'
        : toca2026
          ? `Si avanzás un año por año, en ${toca2026.anio} cursarías ${toca2026.curso}° año con el Plan 2026${toca2026.plan === 'mixto' ? ' (más algunas materias del 2009)' : ''}. Revisá en "Tu pase" las fechas límite.`
          : 'Si avanzás un año por año, terminás de cursar todo con el Plan 2009.'}
    </div>
  );
}

// ------------------------------------------------------------------ Orientaciones

function Orientaciones() {
  const [abierta, setAbierta] = useState<string | null>(null);
  const o = RESUMEN_2026.orientacion;
  const partes = [
    { k: 'pps', t: 'Prácticas supervisadas', h: o.pps },
    { k: 'ob', t: 'Obligatorias', h: o.obligatorias },
    { k: 'op', t: 'Optativas', h: o.optativas },
    { k: 'tes', t: 'Tesina', h: o.tesina },
  ];
  return (
    <>
      <p className="p26-intro">En sexto año elegís <b>una</b> sub orientación de {o.total} horas. Para rendirla tenés que tener aprobadas todas las materias.</p>
      <div className="p26-stack" role="img" aria-label="Distribución de las 500 horas">
        {partes.map((p) => (
          <span key={p.k} className={`p26-stack__${p.k}`} style={{ flex: p.h }}>
            <b className="tnum">{p.h}</b>
          </span>
        ))}
      </div>
      <div className="p26-leyenda">
        {partes.map((p) => <span key={p.k}><i className={`p26-stack__${p.k}`} /> {p.t}</span>)}
      </div>

      {ORIENTACIONES.map((or) => (
        <OrientacionCard key={or.letra} or={or} abierta={abierta} setAbierta={setAbierta} />
      ))}
    </>
  );
}

function OrientacionCard({ or, abierta, setAbierta }: { or: Orientacion; abierta: string | null; setAbierta: (s: string | null) => void }) {
  return (
    <section className={`p26-or p26-or--${or.letra}`}>
      <h3 className="p26-or__t"><span>{or.letra}</span>{or.nombre}</h3>
      {or.subs.map((s) => {
        const open = abierta === s.id;
        return (
          <div key={s.id} className={`p26-sub-or${open ? ' is-open' : ''}`}>
            <button type="button" className="p26-sub-or__head" aria-expanded={open} onClick={() => { haptic(); setAbierta(open ? null : s.id); }}>
              <span>{s.nombre}</span>
              <small>{s.cursos.filter((c) => !c.obligatorio).length} optativas</small>
              <Icon name="chevronDown" size={18} className="p26-mat__chev" />
            </button>
            {open && <ArmarOptativas s={s} />}
          </div>
        );
      })}
    </section>
  );
}

/** Lista de cursos con un armador de optativas: tocás hasta juntar 120 hs */
function ArmarOptativas({ s }: { s: SubOrientacion }) {
  const meta = RESUMEN_2026.orientacion.optativas;
  const [elegidas, setElegidas] = useState<Set<string>>(new Set());
  const horas = s.cursos.filter((c) => elegidas.has(c.code)).reduce((t, c) => t + c.horas, 0);
  const toggle = (code: string) => {
    haptic();
    setElegidas((prev) => {
      const n = new Set(prev);
      if (n.has(code)) n.delete(code); else n.add(code);
      return n;
    });
  };
  return (
    <div className="p26-sub-or__det">
      <h4>Obligatorias</h4>
      <ul className="p26-cursos">
        {s.cursos.filter((c) => c.obligatorio).map((c) => (
          <li key={c.code}><span>{c.nombre}</span><small className="tnum">{c.horas} h</small></li>
        ))}
        <li><span>Tesina</span><small className="tnum">{RESUMEN_2026.orientacion.tesina} h</small></li>
      </ul>
      <h4>Armá tus optativas <small className="muted">(tocá para elegir)</small></h4>
      <div className={`p26-meta${horas >= meta ? ' is-ok' : ''}`}>
        <span style={{ '--w': `${Math.min(100, (horas / meta) * 100)}%` } as CSSProperties} />
        <b className="tnum">{horas} / {meta} h</b>
      </div>
      <ul className="p26-cursos p26-cursos--op">
        {s.cursos.filter((c) => !c.obligatorio).map((c) => {
          const on = elegidas.has(c.code);
          return (
            <li key={c.code}>
              <button type="button" className={on ? 'is-on' : ''} aria-pressed={on} onClick={() => toggle(c.code)}>
                <span className="p26-check"><Icon name="check" size={14} stroke={3} /></span>
                <span>{c.nombre}</span>
                <small className="tnum">{c.horas} h</small>
              </button>
            </li>
          );
        })}
      </ul>
      {horas >= meta && <p className="p26-listo">¡Listo! Con eso cubrís las {meta} horas de optativas.</p>}
    </div>
  );
}
