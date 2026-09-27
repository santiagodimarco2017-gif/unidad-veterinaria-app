// Colectivos: lo esencial. Sentido → próximo colectivo → 3 siguientes → accesos grandes.
// (Se abre desde el menú de inicio o la pestaña Colectivos.)
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { fechaISO, proximasSalidas } from '../lib/schedule';
import { DirectionSwitch } from '../components/DirectionSwitch';
import { HeroCard, HeroSkeleton } from '../components/HeroCard';
import { StatusBanner, calcularEstado } from '../components/StatusBanner';
import { DepartureRow, esperaCorta } from '../components/DepartureRow';
import { PullToRefresh } from '../components/PullToRefresh';
import { Skeleton } from '../components/controles';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { DESTINO, desdeISO, diaLargo, etiquetaDia } from '../state/util';
import { useFavoritosOrdenados } from './Favoritos';
import { opcionesParaLlegar, parsearHoraMesa } from '../lib/comoLlego';
import { nombreEmpresa } from '../components/EmpresaChip';
import { AppLogo } from '../components/AppLogo';

export function Inicio() {
  const app = useApp();
  const nav = useNav();
  const { ahora, direccion, visibles, feriados, cargando } = app;

  // Recalcular una vez por minuto basta para la lista; el héroe usa `ahora` directo.
  const minutoClave = Math.floor(ahora.getTime() / 60_000);
  const salidas = useMemo(
    () => proximasSalidas(visibles, direccion, new Date(minutoClave * 60_000), feriados, 4),
    [visibles, direccion, feriados, minutoClave],
  );

  const estado = calcularEstado({ alertas: app.alertas, feriados, hayCambios: !!app.cambios, ahora });

  const destino = DESTINO[direccion];
  const [primera, ...resto] = salidas;

  const abrir = (i: number) => {
    const s = salidas[i];
    if (s) nav.abrirDetalle(s.servicio.id, fechaISO(s.salida));
  };

  return (
    <PullToRefresh onRefresh={app.actualizar} cargando={app.sincronizando}>
      <div className="screen screen--inicio">
        <header className="inicio-head">
          <div className="inicio-head__txt">
            <p className="inicio-head__marca">Colectivos · Casilda ⇄ Rosario</p>
            <h1 className="inicio-head__title">¿Para dónde vas?</h1>
            <p className="inicio-head__date">{diaLargo(ahora)}</p>
          </div>
          <button type="button" className="inicio-head__logo" onClick={() => nav.abrir('acerca')} aria-label="Acerca de Unidad Veterinaria">
            <AppLogo size={52} />
          </button>
        </header>

        <DirectionSwitch direccion={direccion} onChange={app.setDireccion} />

        <StatusBanner estado={estado} onClick={() => nav.abrir('avisos')} />

        {cargando ? (
          <HeroSkeleton />
        ) : (
          <HeroCard
            key={direccion}
            salida={primera ?? null}
            ahora={ahora}
            onClick={() => abrir(0)}
            favorito={primera ? app.esFavorito(primera.servicio.id) : false}
            clima={app.clima[destino]}
            destino={destino}
          />
        )}

        <section className="section">
          <h2 className="section__h">Después</h2>
          {cargando ? (
            <div className="card-list">
              {Array.from({ length: 3 }, (_, i) => (
                <div className="dep dep--skeleton" key={i}>
                  <Skeleton alto={34} ancho={58} /><Skeleton alto={30} ancho="55%" /><Skeleton alto={22} ancho={50} />
                </div>
              ))}
            </div>
          ) : resto.length ? (
            <div className="card-list" key={direccion}>
              {resto.slice(0, 3).map((s, i) => (
                <DepartureRow
                  key={`${s.servicio.id}-${s.salida.getTime()}`}
                  indice={i}
                  servicio={s.servicio}
                  minutos={Math.max(0, Math.ceil((s.salida.getTime() - ahora.getTime()) / 60_000))}
                  etiquetaDia={etiquetaDia(s.salida, ahora)}
                  favorito={app.esFavorito(s.servicio.id)}
                  onClick={() => abrir(i + 1)}
                />
              ))}
            </div>
          ) : (
            <p className="muted center pad">No hay más salidas cargadas.</p>
          )}
          <button type="button" className="btn btn--outline btn--block sep-12" onClick={() => nav.verHorarios()}>
            <Icon name="list" size={20} /> Ver todos los horarios
          </button>
        </section>

        <ProximoFavorito />
        <MesaProxima />

        <section className="section">
          <h2 className="section__h">Accesos rápidos</h2>
          <div className="tiles">
            <Tile icono="clock" titulo="Horarios" sub="Todas las salidas" onClick={() => nav.verHorarios()} />
            <Tile icono="star" titulo="Mis favoritos" sub={app.favoritos.length ? `${app.favoritos.length} guardado${app.favoritos.length > 1 ? 's' : ''}` : 'Tus viajes de siempre'} onClick={() => nav.irA('favoritos')} />
            <Tile icono="car" titulo="Remises y taxis" sub="Llamar en Casilda" onClick={() => nav.abrir('remises')} />
            <Tile icono="graduationCap" titulo="Plan de Estudio" sub="Materias y mesas" onClick={() => nav.irA('carrera')} />
          </div>
        </section>

        <footer className="firma">
          <AppLogo size={30} />
          <span>
            <b>Unidad Veterinaria</b>
            Los horarios pueden variar; confirmá con la empresa.
          </span>
        </footer>
      </div>
    </PullToRefresh>
  );
}

function Tile({ icono, titulo, sub, onClick }: { icono: IconName; titulo: string; sub: string; onClick: () => void }) {
  return (
    <button type="button" className="tile" onClick={onClick}>
      <span className="tile__icon"><Icon name={icono} size={24} /></span>
      <span className="tile__t">{titulo}</span>
      <span className="tile__s">{sub}</span>
    </button>
  );
}

/** Una sola línea: "Tu próximo favorito: 07:10 Monticas · en 2 h" */
function ProximoFavorito() {
  const app = useApp();
  const nav = useNav();
  const item = useFavoritosOrdenados().find((x) => x.s && x.prox);
  if (!item?.s || !item.prox) return null;
  const { s, prox, f } = item;
  const min = Math.max(0, Math.ceil((prox.salida.getTime() - app.ahora.getTime()) / 60_000));
  const dia = etiquetaDia(prox.salida, app.ahora);
  return (
    <button type="button" className="fav-line" onClick={() => nav.abrirDetalle(s.id, fechaISO(prox.salida))}>
      <Icon name="star" size={20} fill className="fav-line__star" />
      <span className="fav-line__txt">
        <small>Tu próximo favorito{f.etiqueta ? ` · ${f.etiqueta}` : ''}</small>
        <b><span className="tnum">{s.sale}</span> {nombreEmpresa(s.empresa)} · {dia !== 'Hoy' ? dia.toLowerCase() : min < 1 ? 'sale ahora' : `en ${esperaCorta(min)}`}</b>
      </span>
      <Icon name="chevronRight" size={18} className="dep__chev" />
    </button>
  );
}

interface Mesa { subjectName: string; dateStr: string; timeStr?: string; turnName: string }

const fmtDiaSemana = new Intl.DateTimeFormat('es-AR', { weekday: 'long' });

/**
 * Si el estudiante marcó materias como regularizadas en Carrera y hay una mesa de alguna de ellas
 * en los próximos 7 días: "Mesa de X el martes 8:30 — tomá el 33/9 de 06:45".
 * El calendario académico se carga aparte (import dinámico) para no pesar en el arranque.
 */
function MesaProxima() {
  const app = useApp();
  const nav = useNav();
  const [mesa, setMesa] = useState<Mesa | null>(null);
  const dia = fechaISO(app.ahora);

  useEffect(() => {
    let vivo = true;
    import('../carrera/proximaMesa')
      .then((m) => { if (vivo) setMesa(m.proximaMesaRegular(new Date(), 7)); })
      .catch(() => {});
    return () => { vivo = false; };
  }, [dia]);

  const hora = parsearHoraMesa(mesa?.timeStr);
  const mejor = useMemo(() => {
    if (!mesa) return null;
    const r = opcionesParaLlegar(app.visibles, desdeISO(mesa.dateStr), app.feriados, hora, 3);
    return r.salidas.find((x) => x.servicio.id === r.mejorId) ?? null;
  }, [mesa, hora, app.visibles, app.feriados]);

  if (!mesa) return null;
  const fecha = desdeISO(mesa.dateStr);
  const cuando = etiquetaDia(fecha, app.ahora);
  const diaTxt = cuando === 'Hoy' || cuando === 'Mañana' ? cuando.toLowerCase() : `el ${fmtDiaSemana.format(fecha)}`;

  return (
    <button
      type="button"
      className="fav-line fav-line--mesa"
      onClick={() => nav.abrirComoLlego({ fecha: mesa.dateStr, hora, titulo: mesa.subjectName, subtitulo: mesa.turnName })}
    >
      <Icon name="graduationCap" size={20} className="fav-line__star" />
      <span className="fav-line__txt">
        <small>Mesa de {mesa.subjectName} {diaTxt}{hora ? ` ${hora.replace(/^0/, '')}` : ''}</small>
        <b>
          {mejor
            ? <>Tomá el {nombreEmpresa(mejor.servicio.empresa)} de <span className="tnum">{mejor.servicio.sale}</span></>
            : '¿Cómo llego a Casilda?'}
        </b>
      </span>
      <Icon name="chevronRight" size={18} className="dep__chev" />
    </button>
  );
}
