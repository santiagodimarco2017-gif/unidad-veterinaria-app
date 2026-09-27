import { SNAPSHOT_FECHA } from '../data';
import { useApp } from '../state/AppState';
import { Page } from '../components/Page';
import { Fila, Grupo } from '../components/controles';
import { AppLogo } from '../components/AppLogo';

export const VERSION = '1.0.0';

const fmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function Acerca() {
  const app = useApp();
  return (
    <Page titulo="Acerca de">
      <div className="screen">
        <div className="about-hero">
          <AppLogo size={84} />
          <h2>Unidad Veterinaria</h2>
          <p className="muted">Colectivos Casilda ⇄ Rosario · versión {VERSION}</p>
        </div>

        <Grupo titulo="Fuentes de datos">
          <Fila icono="building" colorIcono="var(--c-teal)" titulo="Terminal de Ómnibus de Rosario" subtitulo="Horarios de todas las empresas" href="http://www.terminalrosario.gob.ar/" />
          <Fila icono="flag" colorIcono="var(--c-indigo)" titulo="Municipalidad de Casilda" subtitulo="Cuadro del 33/9 parada por parada y contactos" chevron={false} />
          <Fila icono="calendar" colorIcono="var(--c-blue)" titulo="Feriados nacionales" subtitulo="ArgentinaDatos" href="https://argentinadatos.com/" />
          <Fila icono="sun" colorIcono="var(--c-amber)" titulo="Clima" subtitulo="Open-Meteo" href="https://open-meteo.com/" />
        </Grupo>

        <Grupo titulo="Actualización">
          <Fila titulo="Última actualización" subtitulo={fmt(app.actualizado)} chevron={false} />
          <Fila titulo="Datos incluidos en la app" subtitulo={fmt(SNAPSHOT_FECHA)} chevron={false} />
        </Grupo>

        <div className="disclaimer">
          Los horarios pueden variar; confirmá con la empresa. Unidad Veterinaria no es una app oficial de las empresas,
          la terminal ni el municipio.
        </div>

        <div className="credits">
          <span className="credits__k">Créditos</span>
          <p className="credits__t">Desarrollado por Unidad Veterinaria</p>
          <p className="muted">Incluye el Plan de Estudio 2009 (modif. 2026) de Medicina Veterinaria FCV-UNR: materias, correlativas, mails de cátedra, correlativas y calendario académico de Medicina Veterinaria.</p>
          <p className="muted">Hecho con cariño para quienes viajan todos los días entre Casilda y Rosario.</p>
        </div>
      </div>
    </Page>
  );
}
