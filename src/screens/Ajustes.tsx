import type { Ajustes as TAjustes, Empresa, EmpresaId } from '../lib/types';
import { EMPRESAS } from '../data';
import { pedirPermisoNotificaciones } from '../services/notifications';
import { useApp } from '../state/AppState';
import { Page } from '../components/Page';
import { Fila, Grupo, Segmented, Toggle } from '../components/controles';
import { direccionPorUbicacion } from '../state/nativo';

export function Ajustes() {
  const app = useApp();
  const { ajustes, cambiarAjustes } = app;

  const notif = async (clave: 'notifParos' | 'notifCambios' | 'notifFeriados', v: boolean) => {
    cambiarAjustes({ [clave]: v });
    if (v) {
      const ok = await pedirPermisoNotificaciones().catch(() => false);
      if (!ok) app.avisar('Permiso de notificaciones denegado. Activalo desde los ajustes del teléfono.');
    }
  };

  const setDir = (v: TAjustes['direccionPorDefecto']) => {
    cambiarAjustes({ direccionPorDefecto: v });
    if (v === 'auto') {
      direccionPorUbicacion(true).then((d) => {
        if (d) { app.setDireccion(d); app.avisar(d === 'CR' ? 'Estás cerca de Casilda' : 'Estás cerca de Rosario'); }
        else app.avisar('No pudimos usar tu ubicación');
      });
    }
  };

  const usadas = new Set(app.servicios.map((s) => s.empresa));
  const empresas = (Object.values(EMPRESAS) as Empresa[]).filter((e) => usadas.has(e.id));
  const alternarEmpresa = (id: EmpresaId, visible: boolean) => {
    const ocultas = new Set(ajustes.empresasOcultas);
    if (visible) ocultas.delete(id); else ocultas.add(id);
    cambiarAjustes({ empresasOcultas: [...ocultas] });
  };

  return (
    <Page titulo="Ajustes">
      <div className="screen">
        <Grupo titulo="Apariencia">
          <div className="fila fila--block">
            <span className="fila__titulo">Tema</span>
            <Segmented<TAjustes['tema']>
              compacto
              etiqueta="Tema"
              valor={ajustes.tema}
              onChange={(v) => cambiarAjustes({ tema: v })}
              opciones={[
                { valor: 'sistema', etiqueta: 'Sistema' },
                { valor: 'claro', etiqueta: 'Claro' },
                { valor: 'oscuro', etiqueta: 'Oscuro' },
              ]}
            />
          </div>
          <Fila icono="text" colorIcono="var(--c-indigo)" titulo="Texto grande" subtitulo="Agranda toda la app" chevron={false}
            derecha={<Toggle etiqueta="Texto grande" on={ajustes.textoGrande} onChange={(v) => cambiarAjustes({ textoGrande: v })} />} />
        </Grupo>

        <Grupo titulo="Sentido al abrir" pie="Automático usa tu ubicación: si estás más cerca de Casilda, muestra Casilda → Rosario.">
          <div className="fila fila--block">
            <Segmented<TAjustes['direccionPorDefecto']>
              compacto
              etiqueta="Sentido por defecto"
              valor={ajustes.direccionPorDefecto}
              onChange={setDir}
              opciones={[
                { valor: 'auto', etiqueta: 'Automático' },
                { valor: 'CR', etiqueta: 'C → R' },
                { valor: 'RC', etiqueta: 'R → C' },
              ]}
            />
          </div>
        </Grupo>

        <Grupo titulo="Notificaciones" pie="Los recordatorios de cada favorito se configuran desde Favoritos.">
          <Fila icono="bolt" colorIcono="var(--c-red)" titulo="Paros" subtitulo="Cuando detectamos un posible paro" chevron={false}
            derecha={<Toggle etiqueta="Avisos de paros" on={ajustes.notifParos} onChange={(v) => notif('notifParos', v)} />} />
          <Fila icono="refresh" colorIcono="var(--c-amber)" titulo="Cambios de horario" chevron={false}
            derecha={<Toggle etiqueta="Avisos de cambios" on={ajustes.notifCambios} onChange={(v) => notif('notifCambios', v)} />} />
          <Fila icono="flag" colorIcono="var(--c-blue)" titulo="Feriados" subtitulo="El día anterior" chevron={false}
            derecha={<Toggle etiqueta="Avisos de feriados" on={ajustes.notifFeriados} onChange={(v) => notif('notifFeriados', v)} />} />
        </Grupo>

        <Grupo titulo="Empresas visibles" pie="Las empresas ocultas no aparecen en Inicio ni en Horarios.">
          {empresas.map((e) => {
            const visible = !ajustes.empresasOcultas.includes(e.id);
            return (
              <div className="fila" key={e.id}>
                <span className="fila__swatch" style={{ background: e.color }} aria-hidden />
                <span className="fila__texto"><span className="fila__titulo">{e.nombre}</span></span>
                <span className="fila__derecha">
                  <Toggle etiqueta={`Mostrar ${e.nombre}`} on={visible} onChange={(v) => alternarEmpresa(e.id, v)} />
                </span>
              </div>
            );
          })}
        </Grupo>

        <Grupo>
          <Fila icono="sparkle" colorIcono="var(--c-teal)" titulo="Ver la introducción de nuevo" onClick={app.reiniciarOnboarding} />
        </Grupo>
      </div>
    </Page>
  );
}
