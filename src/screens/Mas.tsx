import { useApp } from '../state/AppState';
import { useNav } from '../state/Nav';
import { Fila, Grupo } from '../components/controles';
import { AppLogo, MarcaDeAgua } from '../components/AppLogo';
import { avisosRecientes } from '../components/StatusBanner';

export function Mas() {
  const nav = useNav();
  const app = useApp();
  const nuevos = avisosRecientes(app.alertas, app.ahora);

  return (
    <div className="screen-scroll">
      <div className="screen">
        <header className="brand">
          <MarcaDeAgua className="brand__marca" />
          <AppLogo size={56} />
          <div className="brand__txt">
            <h1 className="brand__t">Unidad Veterinaria</h1>
            <p className="brand__s">Colectivos, plan de estudio y mails de cátedra</p>
          </div>
        </header>

        <Grupo titulo="Viajes">
          <Fila
            icono="bell"
            colorIcono="var(--danger)"
            titulo="Avisos"
            subtitulo="Paros, cambios de horario y feriados"
            derecha={nuevos > 0 ? <span className="badge" aria-label={`${nuevos} nuevos`}>{nuevos}</span> : undefined}
            onClick={() => nav.abrir('avisos')}
          />
          <Fila icono="car" colorIcono="var(--gold)" titulo="Remises y taxis" subtitulo="Llamar un auto en Casilda" onClick={() => nav.abrir('remises')} />
          <Fila icono="bus" colorIcono="var(--brand)" titulo="Empresas de colectivos" subtitulo="Teléfonos y dónde paran" onClick={() => nav.abrir('empresas')} />
          <Fila icono="flag" colorIcono="var(--info)" titulo="Feriados" subtitulo="Días con horario especial este año" onClick={() => nav.abrir('feriados')} />
        </Grupo>

        <Grupo titulo="La app">
          <Fila icono="settings" colorIcono="var(--c-gray)" titulo="Ajustes" subtitulo="Tema oscuro, texto grande, notificaciones" onClick={() => nav.abrir('ajustes')} />
          <Fila icono="info" colorIcono="var(--brand-deep)" titulo="Acerca de y créditos" subtitulo="Desarrollado por Unidad Veterinaria" onClick={() => nav.abrir('acerca')} />
        </Grupo>

        <p className="credit-foot">
          Datos {app.origen === 'en-vivo' ? 'actualizados en vivo' : app.origen === 'cache' ? 'guardados en el teléfono' : 'incluidos en la app'}
        </p>
      </div>
    </div>
  );
}
