// Página "Avisos" (Más → Avisos): paros, cambios de horario y próximos feriados.
import { useMemo } from 'react';
import type { Alerta, TipoAlerta } from '../lib/types';
import { fechaISO, serviciosDelDia } from '../lib/schedule';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { Page } from '../components/Page';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { Spinner } from '../components/controles';
import { desdeISO, diaLargo, etiquetaDia, haceCuanto, sumarDias } from '../state/util';

const TIPO: Record<TipoAlerta, { icono: IconName; clase: string; nombre: string }> = {
  paro: { icono: 'bolt', clase: 'danger', nombre: 'Paro' },
  cambio_horario: { icono: 'refresh', clase: 'warn', nombre: 'Cambio de horario' },
  feriado: { icono: 'flag', clase: 'info', nombre: 'Feriado' },
  info: { icono: 'info', clase: 'neutral', nombre: 'Información' },
};

const ORDEN: TipoAlerta[] = ['paro', 'cambio_horario', 'feriado', 'info'];

export function Avisos() {
  const app = useApp();
  const nav = useNav();
  const { ahora, alertas, feriados, visibles } = app;

  const ordenadas = useMemo(
    () => [...alertas].sort((a, b) => ORDEN.indexOf(a.tipo) - ORDEN.indexOf(b.tipo) || b.fecha.localeCompare(a.fecha)),
    [alertas],
  );

  const hoyISO = fechaISO(ahora);
  const limiteISO = fechaISO(sumarDias(ahora, 60));
  const proximos = useMemo(() => feriados
    .filter((f) => f.fecha >= hoyISO && f.fecha <= limiteISO)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((f) => {
      const d = desdeISO(f.fecha);
      return {
        f, d,
        cr: serviciosDelDia(visibles, 'CR', d, feriados).length,
        rc: serviciosDelDia(visibles, 'RC', d, feriados).length,
      };
    }), [feriados, visibles, hoyISO, limiteISO]);

  return (
    <Page
      titulo="Avisos"
      accion={
        <button type="button" className="icon-btn" onClick={app.actualizar} disabled={app.sincronizando} aria-label="Buscar avisos nuevos">
          {app.sincronizando ? <Spinner size={18} /> : <Icon name="refresh" size={20} />}
        </button>
      }
    >
      <div className="screen">
        <p className="lead">Actualizado {haceCuanto(app.actualizado, ahora)}{app.origen === 'incluido' ? ' · datos incluidos en la app' : ''}</p>

        {app.cambios && (
          <div className="alert alert--warn">
            <span className="alert__icon"><Icon name="refresh" size={18} /></span>
            <div className="alert__body">
              <b>Se actualizaron los horarios</b>
              <p>
                {[
                  app.cambios.agregados && `${app.cambios.agregados} nuevos`,
                  app.cambios.modificados && `${app.cambios.modificados} modificados`,
                  app.cambios.quitados && `${app.cambios.quitados} quitados`,
                ].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        )}

        <section className="section">
          <h2 className="section__h">Paros y cambios</h2>
          {ordenadas.length === 0 ? (
            <div className="empty empty--inline">
              <span className="empty__ok"><Icon name="check" size={22} stroke={2.4} /></span>
              <p className="empty__t">Todo tranquilo</p>
              <p className="empty__s">No encontramos paros ni cambios de horario.</p>
            </div>
          ) : (
            <div className="alert-list">
              {ordenadas.map((a) => <AlertaItem key={a.id} a={a} ahora={ahora} />)}
            </div>
          )}
        </section>

        <section className="section">
          <h2 className="section__h">Próximos feriados</h2>
          {proximos.length === 0 ? (
            <p className="muted pad">No hay feriados en los próximos 60 días.</p>
          ) : (
            <div className="card-list">
              {proximos.map(({ f, d, cr, rc }) => (
                <div className="feriado-row card" key={f.fecha}>
                  <span className="feriado-row__cal">
                    <small>{d.toLocaleDateString('es-AR', { month: 'short' }).replace('.', '')}</small>
                    <b className="tnum">{d.getDate()}</b>
                  </span>
                  <span className="feriado-row__txt">
                    <b>{f.nombre}</b>
                    <span>{etiquetaDia(d, ahora) === 'Hoy' || etiquetaDia(d, ahora) === 'Mañana' ? `${etiquetaDia(d, ahora)} · ` : ''}{diaLargo(d)}</span>
                    <span className="feriado-row__svc">Horario de feriados: <b className="tnum">{cr}</b> salidas desde Casilda, <b className="tnum">{rc}</b> desde Rosario</span>
                  </span>
                </div>
              ))}
            </div>
          )}
          <button type="button" className="btn btn--outline btn--block sep-12" onClick={() => nav.abrir('feriados')}>
            <Icon name="flag" size={18} /> Ver todos los feriados del año
          </button>
        </section>
      </div>
    </Page>
  );
}

function AlertaItem({ a, ahora }: { a: Alerta; ahora: Date }) {
  const t = TIPO[a.tipo] ?? TIPO.info;
  return (
    <article className={`alert alert--${t.clase} alert--${a.nivel}`}>
      <span className="alert__icon"><Icon name={t.icono} size={18} /></span>
      <div className="alert__body">
        <span className="alert__meta">{t.nombre} · {haceCuanto(a.fecha, ahora)}{a.fuente ? ` · ${a.fuente}` : ''}</span>
        <b>{a.titulo}</b>
        {a.detalle && <p>{a.detalle}</p>}
        {a.url && (
          <a className="alert__link" href={a.url} target="_blank" rel="noopener noreferrer">
            Abrir nota <Icon name="external" size={14} />
          </a>
        )}
      </div>
    </article>
  );
}
