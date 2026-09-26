// Pestaña Favoritos: lista simple de horarios guardados, con su próxima salida y aviso.
import { useMemo, useState } from 'react';
import type { DiaKey, Favorito, Salida, Servicio } from '../lib/types';
import { fechaISO, proximaSalidaDeServicio } from '../lib/schedule';
import { pedirPermisoNotificaciones } from '../services/notifications';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { ScreenHeader } from '../components/Page';
import { EmpresaChip, colorEmpresa } from '../components/EmpresaChip';
import { ReminderPicker } from '../components/ReminderPicker';
import { esperaCorta } from '../components/DepartureRow';
import { Icon } from '../components/Icon';
import { DIAS, DIA_CORTO, SENTIDO, etiquetaDia, hhmm } from '../state/util';
import { haptic } from '../state/nativo';

export interface FavItem { f: Favorito; s: Servicio | null; prox: Salida | null }

/** Favoritos con su próxima salida, ordenados por la más cercana (compartido con Inicio). */
export function useFavoritosOrdenados(): FavItem[] {
  const { favoritos, servicios, ahora, feriados } = useApp();
  const minuto = Math.floor(ahora.getTime() / 60_000);
  return useMemo(() => {
    const t = new Date(minuto * 60_000);
    return favoritos.map((f) => {
      const s = servicios.find((x) => x.id === f.servicioId) ?? null;
      const prox = s ? proximaSalidaDeServicio(s, t, feriados) : null;
      return { f, s, prox };
    }).sort((a, b) => (a.prox?.salida.getTime() ?? Infinity) - (b.prox?.salida.getTime() ?? Infinity));
  }, [favoritos, servicios, feriados, minuto]);
}

export function Favoritos() {
  const { favoritos } = useApp();
  const items = useFavoritosOrdenados();

  return (
    <div className="screen-scroll">
      <div className="screen">
        <ScreenHeader
          titulo="Favoritos"
          sub={favoritos.length ? `${favoritos.length} horario${favoritos.length > 1 ? 's' : ''} guardado${favoritos.length > 1 ? 's' : ''}` : undefined}
        />
        {items.length === 0 ? <FavoritosVacio /> : (
          <>
            <div className="fav-list">
              {items.map(({ f, s, prox }, i) => (
                s ? <FavCard key={f.servicioId} fav={f} servicio={s} prox={prox} indice={i} />
                  : <FavHuerfano key={f.servicioId} fav={f} />
              ))}
            </div>
            <p className="footnote">Para agregar otro: tocá un horario y elegí <b>Guardar en favoritos</b>.</p>
          </>
        )}
      </div>
    </div>
  );
}

function diasAvisoTxt(dias: DiaKey[]): string {
  if (dias.length === 7) return 'todos los días';
  if (dias.length === 5 && ['lun', 'mar', 'mie', 'jue', 'vie'].every((d) => dias.includes(d as DiaKey))) return 'de lunes a viernes';
  return DIAS.filter((d) => dias.includes(d)).map((d) => DIA_CORTO[d]).join(', ');
}

function FavCard({ fav, servicio: s, prox, indice }: { fav: Favorito; servicio: Servicio; prox: Salida | null; indice: number }) {
  const app = useApp();
  const nav = useNav();
  const [editando, setEditando] = useState<'nada' | 'etiqueta' | 'aviso'>('nada');
  const [etiqueta, setEtiqueta] = useState(fav.etiqueta ?? '');
  const min = prox ? Math.max(0, Math.ceil((prox.salida.getTime() - app.ahora.getTime()) / 60_000)) : null;

  const guardarEtiqueta = () => {
    app.guardarFavorito(s.id, { etiqueta: etiqueta.trim() || undefined });
    setEditando('nada');
  };
  const guardarAviso = async (avisoMin: number | null, dias: DiaKey[]) => {
    app.guardarFavorito(s.id, { avisoMin, diasAviso: dias });
    setEditando('nada');
    if (avisoMin != null) {
      const ok = await pedirPermisoNotificaciones().catch(() => false);
      app.avisar(ok ? `Te avisamos ${avisoMin} min antes` : 'Activá las notificaciones para recibir el aviso');
    }
  };
  const alternar = (e: 'etiqueta' | 'aviso') => { haptic(); setEditando(editando === e ? 'nada' : e); };

  return (
    <article className="fav card" style={{ ['--acc' as string]: colorEmpresa(s.empresa), ['--i' as string]: indice }}>
      <button type="button" className="fav__main" onClick={() => nav.abrirDetalle(s.id, prox ? fechaISO(prox.salida) : undefined)}>
        <span className="fav__top">
          <span className="fav__label">{fav.etiqueta ?? SENTIDO[s.direccion]}</span>
          <EmpresaChip empresa={s.empresa} />
        </span>
        {fav.etiqueta && <span className="fav__route--sub">{SENTIDO[s.direccion]}</span>}
        <span className="fav__row">
          <span className="fav__time tnum">{s.sale}<small> llega {s.llega}</small></span>
          {prox && min != null ? (
            <span className="fav__count">
              <b className="tnum">{min < 1 ? 'sale ahora' : esperaCorta(min)}</b>
              <small>{etiquetaDia(prox.salida, app.ahora)} {hhmm(prox.salida)}</small>
            </span>
          ) : <span className="fav__count muted"><small>Sin salidas próximas</small></span>}
        </span>
        <span className="fav__aviso">
          <Icon name="bell" size={15} fill={fav.avisoMin != null} />
          {fav.avisoMin != null ? `Aviso ${fav.avisoMin} min antes, ${diasAvisoTxt(fav.diasAviso)}` : 'Sin aviso'}
        </span>
      </button>

      <div className="fav__bar">
        <button type="button" className="mini-action" onClick={() => alternar('aviso')} aria-expanded={editando === 'aviso'}>
          <Icon name="bell" size={17} /> Aviso
        </button>
        <button type="button" className="mini-action" onClick={() => alternar('etiqueta')} aria-expanded={editando === 'etiqueta'}>
          <Icon name="edit" size={17} /> Nombre
        </button>
        <button type="button" className="mini-action mini-action--danger" onClick={() => { haptic('medio'); app.quitarFavorito(s.id); app.avisar('Quitado de Favoritos'); }}>
          <Icon name="trash" size={17} /> Quitar
        </button>
      </div>

      {editando === 'etiqueta' && (
        <form className="fav__edit" onSubmit={(e) => { e.preventDefault(); guardarEtiqueta(); }}>
          <input
            className="input"
            autoFocus
            maxLength={24}
            placeholder="Ej.: Facu, Trabajo, Vuelta a casa"
            value={etiqueta}
            onChange={(e) => setEtiqueta(e.target.value)}
            aria-label="Nombre del favorito"
          />
          <button type="submit" className="btn btn--primary">Listo</button>
        </form>
      )}
      {editando === 'aviso' && (
        <div className="fav__edit fav__edit--col">
          <ReminderPicker servicio={s} favorito={fav} onGuardar={guardarAviso} onCancelar={() => setEditando('nada')} />
        </div>
      )}
    </article>
  );
}

function FavHuerfano({ fav }: { fav: Favorito }) {
  const app = useApp();
  return (
    <article className="fav card fav--orphan">
      <div className="fav__main">
        <span className="fav__top"><span className="fav__label">{fav.etiqueta ?? 'Horario guardado'}</span></span>
        <span className="muted">Este horario ya no figura en los datos actuales (salía a las {fav.servicioId.split('-')[2]}).</span>
      </div>
      <div className="fav__bar">
        <button type="button" className="mini-action mini-action--danger" onClick={() => app.quitarFavorito(fav.servicioId)}>
          <Icon name="trash" size={17} /> Quitar
        </button>
      </div>
    </article>
  );
}

function FavoritosVacio() {
  const nav = useNav();
  return (
    <div className="empty empty--big">
      <span className="empty__badge"><Icon name="star" size={40} /></span>
      <p className="empty__t">Todavía no guardaste horarios</p>
      <p className="empty__s">Tocá un horario y elegí <b>Guardar en favoritos</b>.</p>
      <button type="button" className="btn btn--primary btn--lg sep-16" onClick={() => nav.verHorarios()}>
        <Icon name="clock" size={20} /> Ver horarios
      </button>
    </div>
  );
}
