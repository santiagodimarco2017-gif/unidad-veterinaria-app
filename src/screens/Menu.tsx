// Menú de inicio: el logo de Unidad Veterinaria y las tres puertas de la app (colectivos, plan de
// estudio y mails de cátedra), cada una con un dato en vivo para no tener que entrar.
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { fechaISO, proximasSalidas } from '../lib/schedule';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { AppLogo, MarcaDeAgua } from '../components/AppLogo';
import { StatusBanner, avisosRecientes, calcularEstado } from '../components/StatusBanner';
import { esperaCorta } from '../components/DepartureRow';
import { nombreEmpresa } from '../components/EmpresaChip';
import { DESTINO, capitalizar, diaLargo, etiquetaDia, saludo } from '../state/util';
import { PLAN_MODIF, PLAN_TITULO } from '../carrera/plan';
import type { ResumenPlan } from '../carrera/resumen';
import { MAIL_CATEDRA, MAILS_OPTATIVAS } from '../carrera/data/fcv';

/** El Plan 2026 empieza a dictarse en marzo de este año (dato fijo para no cargar el plan en el arranque) */
const INICIO_2026 = 2028;

const CANT_MAILS = Object.keys(MAIL_CATEDRA).length + MAILS_OPTATIVAS.length;

export function Menu() {
  const app = useApp();
  const nav = useNav();
  const { ahora, direccion, visibles, feriados } = app;
  const plan = useResumenPlan();

  const minutoClave = Math.floor(ahora.getTime() / 60_000);
  const proxima = useMemo(
    () => proximasSalidas(visibles, direccion, new Date(minutoClave * 60_000), feriados, 1)[0] ?? null,
    [visibles, direccion, feriados, minutoClave],
  );
  const min = proxima ? Math.max(0, Math.ceil((proxima.salida.getTime() - ahora.getTime()) / 60_000)) : null;
  const dia = proxima ? etiquetaDia(proxima.salida, ahora) : '';
  const estado = calcularEstado({ alertas: app.alertas, feriados, hayCambios: !!app.cambios, ahora });
  const nuevos = avisosRecientes(app.alertas, ahora);
  const diasInicio = Math.max(0, Math.ceil((new Date(INICIO_2026, 2, 1).getTime() - ahora.getTime()) / 86_400_000));

  return (
    <div className="screen-scroll">
      <div className="screen screen--menu">
        <header className="menu-hero">
          <MarcaDeAgua className="menu-hero__marca" />
          <button type="button" className="menu-hero__logo" onClick={() => nav.abrir('acerca')} aria-label="Acerca de Unidad Veterinaria">
            <AppLogo size={76} />
          </button>
          <p className="menu-hero__marca-txt">Unidad Veterinaria</p>
          <h1 className="menu-hero__saludo">{saludo(ahora)}</h1>
          <p className="menu-hero__fecha">{capitalizar(diaLargo(ahora))}</p>
        </header>

        {estado && <div className="menu-estado"><StatusBanner estado={estado} onClick={() => nav.abrir('avisos')} /></div>}

        <h2 className="section__h menu-h">¿Qué necesitás?</h2>

        <div className="menu-opciones">
          <Opcion
            i={0}
            icono="bus"
            tono="verde"
            titulo="Horarios de colectivos"
            sub="Casilda ⇄ Rosario"
            onClick={() => nav.irA('colectivos')}
            extra={
              <button
                type="button"
                className="opcion__swap"
                onClick={() => app.setDireccion(direccion === 'CR' ? 'RC' : 'CR')}
                aria-label={`Cambiar sentido (ahora hacia ${DESTINO[direccion]})`}
              >
                <Icon name="swap" size={18} />
              </button>
            }
          >
            {app.cargando ? (
              <span className="opcion__vivo muted">Cargando horarios…</span>
            ) : proxima && min !== null ? (
              <span className="opcion__vivo" key={`${direccion}-${proxima.servicio.id}`}>
                <span className="opcion__dot" aria-hidden />
                A {DESTINO[direccion]}: <b className="tnum">{proxima.servicio.sale}</b> {nombreEmpresa(proxima.servicio.empresa)}
                <span className="opcion__pill tnum">
                  {dia !== 'Hoy' ? dia.toLowerCase() : min < 1 ? 'sale ahora' : `en ${esperaCorta(min)}`}
                </span>
              </span>
            ) : (
              <span className="opcion__vivo muted">No hay más salidas cargadas hacia {DESTINO[direccion]}</span>
            )}
          </Opcion>

          <Opcion
            i={1}
            icono="graduationCap"
            tono="dorado"
            titulo={PLAN_TITULO}
            etiqueta={PLAN_MODIF}
            sub="Materias y correlativas"
            onClick={() => nav.irA('carrera')}
            extra={plan ? <Anillo valor={plan.porcentaje} /> : undefined}
          >
            {plan && (
              <span className="opcion__vivo">
                {plan.aprobadas || plan.regulares
                  ? <><b>{plan.aprobadas}</b> de {plan.total} aprobadas{plan.regulares ? ` · ${plan.regulares} regulares` : ''}</>
                  : 'Marcá tus materias y mirá qué podés cursar'}
                {plan.novedad && <span className="opcion__nota">{plan.novedad}</span>}
              </span>
            )}
          </Opcion>

          <Opcion
            i={2}
            icono="book"
            tono="teal"
            titulo="Plan de Estudios 2026"
            etiqueta="nuevo"
            sub={`Arranca en ${INICIO_2026} · faltan ${diasInicio.toLocaleString('es-AR')} días`}
            onClick={() => nav.abrir('plan2026')}
          >
            <span className="opcion__vivo">
              {plan && (plan.pase2026.aprobadas || plan.pase2026.parciales)
                ? <>Con tu avance tendrías <b>{plan.pase2026.aprobadas}</b> aprobadas{plan.pase2026.parciales ? ` y ${plan.pase2026.parciales} parciales` : ''}</>
                : 'Materias, orientaciones y cómo es el pase'}
            </span>
          </Opcion>

          <Opcion
            i={3}
            icono="mail"
            tono="azul"
            titulo="Mail de la cátedra"
            sub="Escribile a tu cátedra en un toque"
            onClick={() => nav.irA('mails')}
          >
            <span className="opcion__vivo"><b>{CANT_MAILS}</b> mails de materias y optativas</span>
          </Opcion>
        </div>

        <h2 className="section__h menu-h">También</h2>
        <div className="menu-atajos">
          <Atajo i={0} icono="bell" titulo="Avisos" badge={nuevos} onClick={() => nav.abrir('avisos')} />
          <Atajo i={1} icono="star" titulo="Favoritos" onClick={() => nav.irA('favoritos')} />
          <Atajo i={2} icono="car" titulo="Remises" onClick={() => nav.abrir('remises')} />
          <Atajo i={3} icono="settings" titulo="Ajustes" onClick={() => nav.abrir('ajustes')} />
        </div>

        {plan?.evento && (
          <a className="fav-line menu-evento" href={plan.evento.url} target="_blank" rel="noopener noreferrer">
            <Icon name="sparkle" size={20} className="fav-line__star" />
            <span className="fav-line__txt">
              <small>Facultad{plan.evento.dateStr ? ` · ${diaLargo(new Date(`${plan.evento.dateStr}T12:00`))}` : ''}</small>
              <b>{plan.evento.titulo}</b>
            </span>
            <Icon name="external" size={18} className="dep__chev" />
          </a>
        )}
      </div>
    </div>
  );
}

/** Carga el resumen del plan aparte (import dinámico) y lo recalcula una vez por día. */
function useResumenPlan(): ResumenPlan | null {
  const { ahora } = useApp();
  const [r, setR] = useState<ResumenPlan | null>(null);
  const dia = fechaISO(ahora);
  useEffect(() => {
    let vivo = true;
    import('../carrera/resumen')
      .then((m) => { if (vivo) setR(m.resumenPlan(new Date())); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [dia]);
  return r;
}

function Opcion({ i, icono, tono, titulo, etiqueta, sub, onClick, extra, children }: {
  i: number;
  icono: IconName;
  tono: 'verde' | 'dorado' | 'azul' | 'teal';
  titulo: string;
  etiqueta?: string;
  sub: string;
  onClick: () => void;
  extra?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={`opcion opcion--${tono}${extra ? ' opcion--extra' : ''}`} style={{ '--i': i } as CSSProperties}>
      <button type="button" className="opcion__main" onClick={onClick}>
        <span className="opcion__icono"><Icon name={icono} size={26} /></span>
        <span className="opcion__txt">
          <span className="opcion__t">
            {titulo}
            {etiqueta && <span className="opcion__etiqueta">{etiqueta}</span>}
          </span>
          <span className="opcion__s">{sub}</span>
          {children}
        </span>
        {!extra && <Icon name="chevronRight" size={20} className="opcion__chev" />}
      </button>
      {extra && <div className="opcion__extra">{extra}</div>}
    </div>
  );
}

function Atajo({ i, icono, titulo, badge = 0, onClick }: { i: number; icono: IconName; titulo: string; badge?: number; onClick: () => void }) {
  return (
    <button type="button" className="atajo" onClick={onClick} style={{ '--i': i } as CSSProperties}>
      <span className="atajo__icono">
        <Icon name={icono} size={22} />
        {badge > 0 && <span className="tabbar__badge" aria-label={`${badge} nuevos`}>{badge}</span>}
      </span>
      <span className="atajo__t">{titulo}</span>
    </button>
  );
}

/** Anillo de avance del plan (porcentaje aprobado) */
function Anillo({ valor }: { valor: number }) {
  const r = 17;
  const c = 2 * Math.PI * r;
  return (
    <span className="anillo" role="img" aria-label={`${valor}% del plan aprobado`}>
      <svg viewBox="0 0 40 40" width={44} height={44} aria-hidden>
        <circle cx="20" cy="20" r={r} className="anillo__fondo" />
        <circle
          cx="20" cy="20" r={r}
          className="anillo__valor"
          strokeDasharray={c}
          style={{ '--off': c * (1 - valor / 100), '--c': c } as CSSProperties}
        />
      </svg>
      <span className="anillo__n tnum">{valor}%</span>
    </span>
  );
}
