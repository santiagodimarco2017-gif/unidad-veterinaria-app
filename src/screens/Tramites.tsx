// Guía de trámites: becas, boleto educativo, certificados y título, paso a paso. Cada paso que te manda a
// una oficina del predio abre el mapa de la facultad con ese lugar marcado.
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Page } from '../components/Page';
import { Icon } from '../components/Icon';
import { Chip } from '../components/controles';
import { useNav } from '../state/Nav';
import { haptic } from '../state/nativo';
import { LUGARES } from '../data/mapaFacu';
import { CONTACTO_FCV, OFICINAS, RELEVADO, TEMAS, TRAMITES } from '../data/tramites';
import type { Paso, TemaTramite, Tramite } from '../data/tramites';

const LUGAR = Object.fromEntries(LUGARES.map((l) => [l.n, l]));
const fechaRelevado = new Date(`${RELEVADO}T12:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

export function Tramites() {
  const [tema, setTema] = useState<TemaTramite | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const lista = useMemo(() => TRAMITES.filter((t) => !tema || t.tema === tema), [tema]);

  return (
    <Page titulo="Guía de trámites">
      <div className="screen tram">
        <p className="tram__intro">
          Qué hacer, dónde y con qué papeles. Tocá <b>Ver en el mapa</b> para encontrar la oficina en el predio.
        </p>

        <div className="chips-row chips-row--scroll" role="group" aria-label="Filtrar trámites">
          <Chip activo={!tema} onClick={() => setTema(null)}>Todos</Chip>
          {TEMAS.map((t) => (
            <Chip key={t.id} activo={tema === t.id} onClick={() => setTema(tema === t.id ? null : t.id)}>{t.titulo}</Chip>
          ))}
        </div>

        <div className="tram__lista">
          {lista.map((t, i) => (
            <TramiteCard
              key={t.id}
              t={t}
              i={i}
              open={abierto === t.id}
              onToggle={() => { haptic(); setAbierto(abierto === t.id ? null : t.id); }}
            />
          ))}
        </div>

        <h2 className="section__h sep-16">¿A qué oficina voy?</h2>
        <Oficinas />

        <p className="credit-foot">
          Relevado el {fechaRelevado} de fveter.unr.edu.ar, unr.edu.ar y santafe.gob.ar.
          Lo marcado como <b>sin confirmar</b> no figura en las páginas oficiales: consultalo en la facultad
          ({CONTACTO_FCV.tel}).
        </p>
      </div>
    </Page>
  );
}

function TramiteCard({ t, i, open, onToggle }: { t: Tramite; i: number; open: boolean; onToggle: () => void }) {
  return (
    <div className={`tram-card${open ? ' is-open' : ''}`} style={{ '--i': i } as CSSProperties}>
      <button type="button" className="tram-card__head" aria-expanded={open} onClick={onToggle}>
        <span className="tram-card__icono"><Icon name={t.icono} size={22} /></span>
        <span className="tram-card__txt">
          <span className="tram-card__t">{t.titulo}</span>
          <span className="tram-card__s">{t.resumen}</span>
        </span>
        <Icon name="chevronDown" size={18} className="tram-card__chev" />
      </button>
      {open && (
        <div className="tram-card__det">
          {t.cuando && <p className="tram-cuando"><Icon name="calendar" size={16} /> {t.cuando}</p>}
          <ol className="tram-pasos">
            {t.pasos.map((p, k) => <PasoFila key={k} p={p} n={k + 1} />)}
          </ol>
          {t.contacto && (
            <div className="tram-contacto">
              {t.contacto.mail && (
                <a href={`mailto:${t.contacto.mail}`}><Icon name="mail" size={16} /> {t.contacto.mail}</a>
              )}
              {t.contacto.tel && (
                <a href={`tel:${t.contacto.tel.replace(/\D/g, '')}`}><Icon name="phone" size={16} /> {t.contacto.tel}</a>
              )}
              {t.contacto.dir && <span><Icon name="building" size={16} /> {t.contacto.dir}</span>}
            </div>
          )}
          <a className="tram-fuente" href={t.fuente.url} target="_blank" rel="noopener noreferrer">
            Fuente: {t.fuente.titulo} <Icon name="external" size={14} />
          </a>
        </div>
      )}
    </div>
  );
}

function PasoFila({ p, n }: { p: Paso; n: number }) {
  const { verEnMapa } = useNav();
  const lugar = p.lugar;
  return (
    <li className="tram-paso">
      <span className="tram-paso__n tnum">{n}</span>
      <div className="tram-paso__txt">
        <p>{p.texto}</p>
        {(lugar || p.enlace) && (
          <div className="tram-paso__acciones">
            {lugar && (
              <button type="button" className="tram-mapa" onClick={() => verEnMapa(lugar)}>
                <span className={`mapa-num mapa-num--chico mapa-num--${LUGAR[lugar].cat}`}>{lugar}</span>
                {LUGAR[lugar].nombre}
                <span className="tram-mapa__ver"><Icon name="pin" size={14} /> Ver en el mapa</span>
              </button>
            )}
            {p.enlace && (
              <a className="tram-link" href={p.enlace.url} target="_blank" rel="noopener noreferrer">
                {p.enlace.titulo} <Icon name="external" size={14} />
              </a>
            )}
          </div>
        )}
        {p.sinConfirmar && (
          <p className="tram-sc"><Icon name="info" size={14} /> <b>Sin confirmar:</b> {p.sinConfirmar}</p>
        )}
      </div>
    </li>
  );
}

function Oficinas() {
  const { verEnMapa } = useNav();
  return (
    <div className="grupo__caja mapa-lista">
      {OFICINAS.map((o, i) => (
        <button
          type="button"
          key={o.lugar}
          className="mapa-fila"
          onClick={() => verEnMapa(o.lugar)}
          style={{ '--i': i } as CSSProperties}
        >
          <span className={`mapa-num mapa-num--${LUGAR[o.lugar].cat}`}>{o.lugar}</span>
          <span className="fila__texto">
            <span className="fila__titulo">{LUGAR[o.lugar].nombre}</span>
            <span className="fila__sub">{o.para}{o.sinConfirmar ? ` Sin confirmar: ${o.sinConfirmar}.` : ''}</span>
          </span>
          <Icon name="pin" size={18} className="dep__chev" />
        </button>
      ))}
    </div>
  );
}
