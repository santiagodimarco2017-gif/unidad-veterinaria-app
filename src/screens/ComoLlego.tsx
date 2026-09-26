// Hoja "¿Cómo llego?": colectivos Rosario → Casilda para llegar a una mesa de examen de la
// Facultad de Ciencias Veterinarias (FCV-UNR, Casilda). Se abre desde el calendario académico
// de Carrera y desde la tarjeta de mesa de Inicio.
import { useMemo } from 'react';
import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import type { ComoLlegoPedido } from '../state/Nav';
import { Sheet } from '../components/Sheet';
import { DepartureRow } from '../components/DepartureRow';
import { Icon } from '../components/Icon';
import { opcionesParaLlegar, MARGEN_LLEGADA_MIN } from '../lib/comoLlego';
import { buscarFeriado } from '../lib/schedule';
import { desdeISO, diaLargo } from '../state/util';

export function ComoLlego() {
  const nav = useNav();
  if (!nav.comoLlego) return null;
  return <ComoLlegoHoja key={`${nav.comoLlego.fecha}-${nav.comoLlego.titulo}`} pedido={nav.comoLlego} />;
}

function ComoLlegoHoja({ pedido }: { pedido: ComoLlegoPedido }) {
  const app = useApp();
  const nav = useNav();
  const fecha = desdeISO(pedido.fecha);
  const feriado = buscarFeriado(fecha, app.feriados);
  const r = useMemo(
    () => opcionesParaLlegar(app.visibles, fecha, app.feriados, pedido.hora, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [app.visibles, app.feriados, pedido.fecha, pedido.hora],
  );
  const hayArito = r.salidas.some((s) => s.servicio.empresa === 'arito');

  const verHorarios = () => {
    // Sentido local (Rosario → Casilda) sólo para esta visita: no cambia el sentido elegido en Inicio.
    nav.verHorarios({
      fecha: pedido.fecha,
      direccion: 'RC',
      destacar: r.modo === 'a-tiempo' ? r.salidas.map((s) => s.servicio.id) : [],
    });
  };

  return (
    <Sheet onCerrar={nav.cerrarComoLlego} etiqueta="¿Cómo llego?">
      <div className="llego__head">
        <p className="llego__kicker">¿Cómo llego? · Rosario → Casilda</p>
        <h2 className="llego__title">{pedido.titulo}</h2>
        <p className="llego__sub">
          {diaLargo(fecha)}{pedido.hora ? ` · ${pedido.hora} h` : ''}{pedido.subtitulo ? ` · ${pedido.subtitulo}` : ''}
        </p>
        {r.limite && r.modo !== 'manana' && (
          <p className="llego__sub">Para llegar {MARGEN_LLEGADA_MIN} min antes: bajarte en Casilda antes de las <b className="tnum">{r.limite}</b>.</p>
        )}
        {!pedido.hora && <p className="llego__sub">Sin horario de mesa: te mostramos las salidas de la mañana.</p>}
        {feriado && <p className="llego__sub">Ese día es feriado ({feriado.nombre}): rige horario de feriados.</p>}
      </div>

      {r.modo === 'ninguna' && (
        <p className="hint">
          {r.salidas.length
            ? 'Ningún colectivo llega con media hora de margen. Estas son las primeras salidas del día:'
            : 'Ese día no hay colectivos cargados de Rosario a Casilda.'}
        </p>
      )}

      {r.salidas.length > 0 && (
        <div className="llego__list">
          {r.salidas.map((s, i) => (
            <div className="llego__opt" key={s.servicio.id}>
              {s.servicio.id === r.mejorId && <span className="llego__badge">Mejor opción</span>}
              <DepartureRow
                indice={i}
                servicio={s.servicio}
                favorito={app.esFavorito(s.servicio.id)}
                onClick={() => nav.abrirDetalle(s.servicio.id, pedido.fecha)}
              />
            </div>
          ))}
        </div>
      )}

      <p className="llego__nota">
        La Facultad de Ciencias Veterinarias está en Casilda.
        {hayArito ? <> <b>Arito</b> para en <b>Casilda Universidad</b>; el resto llega a la terminal.</> : ' Arito para en Casilda Universidad.'}
        {' '}Tocá una salida para ver el detalle.
      </p>

      <div className="llego__actions">
        <button type="button" className="btn btn--primary btn--wide" onClick={verHorarios}>
          <Icon name="clock" size={18} /> Ver todos los horarios de ese día
        </button>
      </div>
    </Sheet>
  );
}
