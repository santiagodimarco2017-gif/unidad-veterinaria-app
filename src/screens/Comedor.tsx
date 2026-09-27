import {
  ALTA_COMEDOR, COMEDORES_INFO_URL, COMEDORES_INSTAGRAM_URL, HORARIOS_COMEDOR, MORA_ALTA_URL, MORA_URL,
  PRECIOS_COMEDOR, SEDES_COMEDOR, SERVICIOS_COMEDOR, formatoPesos, mapaUrl,
} from '../data/comedores';
import { Page } from '../components/Page';
import { Fila, Grupo } from '../components/controles';
import { Icon } from '../components/Icon';

export function Comedor() {
  const [casilda, ...otras] = SEDES_COMEDOR;
  return (
    <Page titulo="Comedor UNR">
      <div className="screen">
        <p className="lead">El menú cambia todas las semanas y se ve en MORA, el sistema de reservas de la UNR, con tu DNI y clave.</p>

        <Grupo titulo="Menú de la semana">
          <Fila icono="list" colorIcono="var(--brand)" titulo="Ver menú y reservar" subtitulo="MORA · comedores.unr.edu.ar" href={MORA_URL} />
          <Fila icono="sparkle" colorIcono="var(--c-indigo)" titulo="Novedades del comedor" subtitulo="Instagram @comedores_unr" href={COMEDORES_INSTAGRAM_URL} />
        </Grupo>

        <Grupo titulo="Tu comedor en la Facultad">
          <Fila icono="pin" colorIcono="var(--gold)" titulo={casilda.nombre} subtitulo={`${casilda.zona} · ${casilda.direccion}`} href={mapaUrl(casilda)} />
        </Grupo>

        <Grupo titulo="Horarios" pie="Rigen para todas las sedes.">
          {HORARIOS_COMEDOR.map((h) => (
            <Fila key={h.periodo} icono="clock" colorIcono="var(--info)" titulo={`${h.periodo}: ${h.horario}`} subtitulo={h.detalle} chevron={false} />
          ))}
        </Grupo>

        <Grupo titulo="Precios 2026">
          {PRECIOS_COMEDOR.map((p) => (
            <Fila key={`${p.quien}-${p.comida}`} titulo={p.comida} subtitulo={p.quien} derecha={<strong>{formatoPesos(p.precio)}</strong>} chevron={false} />
          ))}
        </Grupo>

        <Grupo titulo="Qué ofrece">
          {SERVICIOS_COMEDOR.map((s) => (
            <Fila key={s} icono="check" colorIcono="var(--brand)" titulo={s} chevron={false} />
          ))}
        </Grupo>

        <Grupo titulo="Cómo darte de alta">
          {ALTA_COMEDOR.map((a) => (
            <Fila key={a.quien} titulo={a.quien} subtitulo={a.que} chevron={false} />
          ))}
          <Fila icono="external" colorIcono="var(--c-gray)" titulo="Crear cuenta en MORA" href={MORA_ALTA_URL} />
        </Grupo>

        <Grupo titulo="Otras sedes">
          {otras.map((s) => (
            <Fila key={s.id} icono="pin" colorIcono="var(--c-teal)" titulo={s.nombre} subtitulo={`${s.zona} · ${s.direccion}`} href={mapaUrl(s)} />
          ))}
        </Grupo>

        <p className="nota">
          <Icon name="info" size={16} />
          <span>
            Precios y horarios publicados por la UNR en febrero de 2026. Pueden cambiar: confirmá en{' '}
            <a href={COMEDORES_INFO_URL} target="_blank" rel="noopener noreferrer">unr.edu.ar/comedores</a>.
          </span>
        </p>
      </div>
    </Page>
  );
}
