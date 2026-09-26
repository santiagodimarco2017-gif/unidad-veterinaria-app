import { Component } from 'react';
import type { ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: boolean }

// Si una sección falla (p. ej. no se pudo descargar un módulo tras una actualización de la PWA),
// muestra un aviso con "Reintentar" en lugar de dejar toda la app en blanco.
export class ErrorSeccion extends Component<Props, State> {
  state: State = { error: false };

  static getDerivedStateFromError(): State {
    return { error: true };
  }

  componentDidCatch(err: unknown) {
    console.error('Error en sección:', err);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="error-seccion" role="alert">
        <p className="error-seccion__t">No se pudo abrir esta sección</p>
        <p className="error-seccion__d">Revisá tu conexión y probá de nuevo.</p>
        <button type="button" className="btn btn--primary" onClick={() => location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }
}
