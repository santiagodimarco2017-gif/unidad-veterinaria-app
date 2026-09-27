// Mapa de la facultad: la imagen de Unidad Veterinaria con zoom (pellizcar, rueda o doble toque) y
// arrastre, y los 31 lugares de la referencia para buscar. Tocar un lugar lo marca y centra en el mapa.
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as RPointerEvent, Ref, WheelEvent as RWheelEvent } from 'react';
import { Page } from '../components/Page';
import { Icon } from '../components/Icon';
import { Chip } from '../components/controles';
import { haptic } from '../state/nativo';
import { useNav } from '../state/Nav';
import mapaSrc from '../../assets/mapa-facu.jpg';
import { CATEGORIAS, COMO_LLEGAR, LUGARES, MAPA_ASPECTO } from '../data/mapaFacu';
import type { Categoria, Lugar } from '../data/mapaFacu';

const MIN = 1;
const MAX = 4;
const ZOOM_FOCO = 2.4;

interface Vista { s: number; x: number; y: number }

/** Minúsculas y sin tildes */
const normal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const CAT_TITULO = Object.fromEntries(CATEGORIAS.map((c) => [c.id, c.titulo])) as Record<Categoria, string>;

export function MapaFacu() {
  // Si se abrió desde un trámite, arranca con esa oficina marcada y centrada
  const { mapaLugar } = useNav();
  const [sel, setSel] = useState<number | null>(mapaLugar);
  const [cat, setCat] = useState<Categoria | null>(null);
  const [q, setQ] = useState('');
  const visor = useRef<VisorApi>(null);
  const arriba = useRef<HTMLDivElement>(null);

  const lugar = sel ? LUGARES.find((l) => l.n === sel) ?? null : null;
  const marcados = useMemo(() => {
    if (lugar) return new Set(lugar.grupo ?? [lugar.n]);
    if (cat) return new Set(LUGARES.filter((l) => l.cat === cat).map((l) => l.n));
    return new Set<number>();
  }, [lugar, cat]);

  const lista = useMemo(() => {
    const nq = normal(q.trim());
    return LUGARES.filter((l) =>
      (!cat || l.cat === cat)
      && (!nq || normal(l.nombre).includes(nq) || String(l.n) === nq),
    );
  }, [q, cat]);

  useEffect(() => {
    const l = mapaLugar ? LUGARES.find((x) => x.n === mapaLugar) : undefined;
    if (!l) return;
    // Espera a que la página termine de entrar para medir la caja del mapa
    const t = window.setTimeout(() => visor.current?.enfocar(l), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const elegir = useCallback((l: Lugar, desdeLista: boolean) => {
    haptic();
    setSel((s) => (s === l.n && !desdeLista ? null : l.n));
    visor.current?.enfocar(l);
    if (desdeLista) arriba.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <Page
      titulo="Mapa de la facultad"
      accion={
        <a className="p26-drive" href={COMO_LLEGAR} target="_blank" rel="noopener noreferrer" aria-label="Cómo llegar en Google Maps">
          <Icon name="locate" size={20} />
        </a>
      }
    >
      <div className="screen mapa">
        <div ref={arriba} className="mapa__ancla" />
        <Visor ref={visor} marcados={marcados} sel={sel} onElegir={(l) => elegir(l, false)} />

        <div className="mapa__info" aria-live="polite">
          {lugar ? (
            <div className="mapa-card" key={lugar.n}>
              <span className="mapa-num mapa-num--grande">{lugar.n}</span>
              <span className="mapa-card__txt">
                <b>{lugar.nombre}</b>
                <small>
                  {lugar.grupo ? `También ${lugar.grupo.filter((g) => g !== lugar.n).join(' y ')} en el mapa` : CAT_TITULO[lugar.cat]}
                  {lugar.nota ? ` · ${lugar.nota}` : ''}
                </small>
              </span>
              <button type="button" className="mapa-card__x" onClick={() => { setSel(null); visor.current?.reset(); }} aria-label="Quitar selección">
                <Icon name="close" size={18} />
              </button>
            </div>
          ) : (
            <p className="mapa__tip">Pellizcá o tocá dos veces para hacer zoom. Tocá un número para ver qué es.</p>
          )}
        </div>

        <label className="buscador sep-16">
          <Icon name="search" size={20} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá un lugar (baños, cantina, 21…)"
            aria-label="Buscar lugar"
            enterKeyHint="search"
          />
          {q && (
            <button type="button" className="buscador__x" onClick={() => setQ('')} aria-label="Borrar búsqueda">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>

        <div className="chips-row chips-row--scroll" role="group" aria-label="Filtrar por tipo de lugar">
          <Chip activo={!cat} onClick={() => { setCat(null); setSel(null); }}>Todos</Chip>
          {CATEGORIAS.map((c) => (
            <Chip key={c.id} activo={cat === c.id} onClick={() => { setCat(cat === c.id ? null : c.id); setSel(null); visor.current?.reset(); }}>
              {c.titulo}
            </Chip>
          ))}
        </div>

        <div className="grupo__caja mapa-lista">
          {lista.map((l, i) => (
            <button
              type="button"
              key={l.n}
              className={`mapa-fila${sel === l.n ? ' is-on' : ''}`}
              onClick={() => elegir(l, true)}
              style={{ '--i': Math.min(i, 10) } as CSSProperties}
            >
              <span className={`mapa-num mapa-num--${l.cat}`}>{l.n}</span>
              <span className="fila__texto">
                <span className="fila__titulo">{l.nombre}</span>
                <span className="fila__sub">{l.nota ?? CAT_TITULO[l.cat]}</span>
              </span>
              <Icon name="pin" size={18} className="dep__chev" />
            </button>
          ))}
          {!lista.length && <p className="muted center pad">No hay lugares con “{q}” en el mapa.</p>}
        </div>

        <p className="credit-foot">Mapa: Unidad Veterinaria. El 15 (Centro de Salud) no figura en la referencia original.</p>
      </div>
    </Page>
  );
}

interface VisorApi { enfocar: (l: Lugar) => void; reset: () => void }

function Visor({ ref, marcados, sel, onElegir }: {
  ref: Ref<VisorApi>;
  marcados: Set<number>;
  sel: number | null;
  onElegir: (l: Lugar) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [v, setV] = useState<Vista>({ s: 1, x: 0, y: 0 });
  const [anim, setAnim] = useState(false);
  const punteros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<{ d: number; s: number; cx: number; cy: number; v: Vista; movio: boolean } | null>(null);
  const ultimoToque = useRef(0);

  const medir = () => {
    const r = caja.current?.getBoundingClientRect();
    return { w: r?.width ?? 1, h: r?.height ?? 1, left: r?.left ?? 0, top: r?.top ?? 0 };
  };

  /** Mantiene la imagen cubriendo la caja (no se puede arrastrar afuera) */
  const limitar = useCallback((n: Vista): Vista => {
    const { w, h } = medir();
    const s = Math.min(MAX, Math.max(MIN, n.s));
    return { s, x: Math.min(0, Math.max(w - w * s, n.x)), y: Math.min(0, Math.max(h - h * s, n.y)) };
  }, []);

  /** Zoom a escala s dejando fijo el punto (px, py) de la caja */
  const zoomEn = useCallback((s: number, px: number, py: number, base: Vista) => {
    const k = Math.min(MAX, Math.max(MIN, s)) / base.s;
    return limitar({ s: base.s * k, x: px - (px - base.x) * k, y: py - (py - base.y) * k });
  }, [limitar]);

  const animar = (n: Vista) => { setAnim(true); setV(limitar(n)); };

  useImperativeHandle(ref, () => ({
    enfocar: (l) => {
      const { w, h } = medir();
      animar({ s: ZOOM_FOCO, x: w / 2 - (l.x / 100) * w * ZOOM_FOCO, y: h / 2 - (l.y / 100) * h * ZOOM_FOCO });
    },
    reset: () => animar({ s: 1, x: 0, y: 0 }),
  }));

  // Rueda del mouse: listener no pasivo para poder evitar el scroll de la página
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const bloquear = (e: WheelEvent) => e.preventDefault();
    el.addEventListener('wheel', bloquear, { passive: false });
    return () => el.removeEventListener('wheel', bloquear);
  }, []);

  const onWheel = (e: RWheelEvent) => {
    const { left, top } = medir();
    setAnim(false);
    setV((cur) => zoomEn(cur.s * Math.exp(-e.deltaY * 0.0015), e.clientX - left, e.clientY - top, cur));
  };

  const onDown = (e: RPointerEvent) => {
    caja.current?.setPointerCapture(e.pointerId);
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnim(false);
    iniciarGesto(false);
  };

  const iniciarGesto = (movio: boolean) => {
    const ps = [...punteros.current.values()];
    if (!ps.length) { gesto.current = null; return; }
    const { left, top } = medir();
    const cx = ps.reduce((a, p) => a + p.x, 0) / ps.length - left;
    const cy = ps.reduce((a, p) => a + p.y, 0) / ps.length - top;
    const d = ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0;
    gesto.current = { d, s: v.s, cx, cy, v, movio: movio || (gesto.current?.movio ?? false) };
  };

  const onMove = (e: RPointerEvent) => {
    if (!punteros.current.has(e.pointerId) || !gesto.current) return;
    punteros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesto.current;
    const ps = [...punteros.current.values()];
    const { left, top } = medir();
    const cx = ps.reduce((a, p) => a + p.x, 0) / ps.length - left;
    const cy = ps.reduce((a, p) => a + p.y, 0) / ps.length - top;
    if (Math.hypot(cx - g.cx, cy - g.cy) > 4) g.movio = true;
    let n: Vista = { ...g.v, x: g.v.x + (cx - g.cx), y: g.v.y + (cy - g.cy) };
    if (ps.length > 1 && g.d > 0) {
      g.movio = true;
      const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y);
      n = zoomEn(g.s * (d / g.d), cx, cy, n);
    }
    setV(limitar(n));
  };

  const onUp = (e: RPointerEvent) => {
    const g = gesto.current;
    punteros.current.delete(e.pointerId);
    if (!punteros.current.size && g && !g.movio) {
      // Doble toque: acercar ahí, o volver a ver todo si ya está con zoom
      const ahora = Date.now();
      if (ahora - ultimoToque.current < 300) {
        ultimoToque.current = 0;
        const { left, top } = medir();
        setAnim(true);
        setV((cur) => (cur.s > 1.5 ? limitar({ s: 1, x: 0, y: 0 }) : zoomEn(ZOOM_FOCO, e.clientX - left, e.clientY - top, cur)));
      } else {
        ultimoToque.current = ahora;
      }
    }
    iniciarGesto(true);
  };

  const boton = (f: number) => {
    const { w, h } = medir();
    setAnim(true);
    setV((cur) => zoomEn(cur.s * f, w / 2, h / 2, cur));
  };

  return (
    <div className="visor">
      <div
        ref={caja}
        className="visor__caja"
        style={{ aspectRatio: MAPA_ASPECTO }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onWheel={onWheel}
      >
        <div
          className={`visor__lienzo${anim ? ' is-anim' : ''}`}
          style={{ transform: `translate(${v.x}px, ${v.y}px) scale(${v.s})` }}
          onTransitionEnd={(e) => { if (e.target === e.currentTarget) setAnim(false); }}
        >
          <img src={mapaSrc} alt="Mapa de la Facultad de Ciencias Veterinarias con sus edificios numerados" draggable={false} />
          {LUGARES.map((l) => (
            <button
              type="button"
              key={l.n}
              className={`visor__pin${marcados.has(l.n) ? ' is-on' : ''}${sel === l.n ? ' is-sel' : ''}`}
              style={{ left: `${l.x}%`, top: `${l.y}%` } as CSSProperties}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onElegir(l)}
              aria-label={`${l.n}: ${l.nombre}`}
            />
          ))}
        </div>
      </div>
      <div className="visor__zoom">
        <button type="button" onClick={() => boton(1.6)} aria-label="Acercar">+</button>
        <button type="button" onClick={() => boton(1 / 1.6)} aria-label="Alejar" disabled={v.s <= MIN}>−</button>
        {v.s > 1.01 && (
          <button type="button" onClick={() => { setAnim(true); setV({ s: 1, x: 0, y: 0 }); }} aria-label="Ver mapa completo">
            <Icon name="grid" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
