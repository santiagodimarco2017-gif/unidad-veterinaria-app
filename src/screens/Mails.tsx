// Mail de la cátedra: buscador de los mails de cada materia del plan y de las optativas (datos de
// fveter.unr.edu.ar incluidos en la app). Tocar una fila abre el mail; el botón copia la dirección.
import { useMemo, useState } from 'react';
import { ScreenHeader } from '../components/Page';
import { Icon } from '../components/Icon';
import { Chip } from '../components/controles';
import { useApp } from '../state/AppState';
import { haptic } from '../state/nativo';
import { SUBJECTS } from '../carrera/data/subjects';
import { MAIL_CATEDRA, MAILS_OPTATIVAS, URL_FCV_CATEDRAS } from '../carrera/data/fcv';
import { PLAN_NOMBRE } from '../carrera/plan';
import { leerProgreso } from '../carrera/proximaMesa';

interface Catedra { clave: string; nombre: string; mail: string; grupo: Grupo }
type Grupo = 1 | 2 | 3 | 4 | 5 | 6 | 'opt';
type Filtro = 'todas' | 'mias' | Grupo;

const GRUPO_TITULO = (g: Grupo) => (g === 'opt' ? 'Optativas y cátedras libres' : `${g}° año`);

const CATEDRAS: Catedra[] = [
  ...SUBJECTS.filter((s) => MAIL_CATEDRA[s.code]).map((s) => ({
    clave: s.code,
    nombre: s.name,
    mail: MAIL_CATEDRA[s.code],
    grupo: s.year as Grupo,
  })),
  ...MAILS_OPTATIVAS.map((o) => ({ clave: o.mail, nombre: o.nombre, mail: o.mail, grupo: 'opt' as const })),
];

const GRUPOS: Grupo[] = [...new Set(CATEDRAS.map((c) => c.grupo))];

/** Minúsculas y sin tildes, para buscar "anatomia" o "Anatomía" igual */
const normal = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function Mails() {
  const { avisar } = useApp();
  const [q, setQ] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  // "Las mías": materias que el estudiante tiene regularizadas en el Plan de Estudio (le queda el final)
  const mias = useMemo(() => {
    const p = leerProgreso();
    return new Set(Object.entries(p).filter(([, st]) => st === 'regular').map(([c]) => c));
  }, []);

  const lista = useMemo(() => {
    const nq = normal(q.trim());
    return CATEDRAS.filter((c) =>
      (filtro === 'todas' || (filtro === 'mias' ? mias.has(c.clave) : c.grupo === filtro))
      && (!nq || normal(c.nombre).includes(nq) || c.mail.includes(nq)),
    );
  }, [q, filtro, mias]);

  const copiar = async (mail: string) => {
    haptic();
    try {
      await navigator.clipboard.writeText(mail);
      avisar(`Copiado: ${mail}`);
    } catch {
      avisar('No se pudo copiar');
    }
  };

  return (
    <div className="screen-scroll">
      <div className="screen">
        <ScreenHeader titulo="Mail de la cátedra" sub={PLAN_NOMBRE} />

        <label className="buscador">
          <Icon name="search" size={20} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscá una materia"
            aria-label="Buscar materia"
            enterKeyHint="search"
          />
          {q && (
            <button type="button" className="buscador__x" onClick={() => setQ('')} aria-label="Borrar búsqueda">
              <Icon name="close" size={18} />
            </button>
          )}
        </label>

        <div className="chips-row chips-row--scroll" role="group" aria-label="Filtrar por año">
          <Chip activo={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</Chip>
          {mias.size > 0 && <Chip activo={filtro === 'mias'} icono="star" onClick={() => setFiltro('mias')}>Mis regulares</Chip>}
          {GRUPOS.map((g) => (
            <Chip key={g} activo={filtro === g} onClick={() => setFiltro(filtro === g ? 'todas' : g)}>
              {g === 'opt' ? 'Optativas' : `${g}° año`}
            </Chip>
          ))}
        </div>

        {GRUPOS.map((g) => {
          const items = lista.filter((c) => c.grupo === g);
          if (!items.length) return null;
          return (
            <section className="grupo" key={g}>
              <h3 className="grupo__titulo">{GRUPO_TITULO(g)}</h3>
              <div className="grupo__caja">
                {items.map((c, i) => (
                  <div className="mail-fila" key={c.clave} style={{ ['--i' as string]: Math.min(i, 8) }}>
                    <a className="mail-fila__main" href={`mailto:${c.mail}`} onClick={() => haptic()}>
                      <span className="fila__icono mail-fila__icono"><Icon name="mail" size={18} /></span>
                      <span className="fila__texto">
                        <span className="fila__titulo">{c.nombre}</span>
                        <span className="fila__sub mail-fila__mail">{c.mail}</span>
                      </span>
                    </a>
                    <button type="button" className="mail-fila__copiar" onClick={() => void copiar(c.mail)} aria-label={`Copiar mail de ${c.nombre}`}>
                      <Icon name="copy" size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {!lista.length && (
          <p className="muted center pad">
            No encontramos “{q}”. Probá con otra palabra o mirá la lista completa en la web de la facultad.
          </p>
        )}

        <p className="credit-foot">
          Mails publicados por la FCV-UNR.{' '}
          <a className="link-btn" href={URL_FCV_CATEDRAS} target="_blank" rel="noopener noreferrer">
            Ver en fveter.unr.edu.ar <Icon name="external" size={14} />
          </a>
        </p>
      </div>
    </div>
  );
}
