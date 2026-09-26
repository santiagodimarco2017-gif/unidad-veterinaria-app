import type { Empresa } from '../lib/types';
import { EMPRESAS } from '../data';
import { useApp } from '../state/AppState';
import { Page } from '../components/Page';
import { Icon } from '../components/Icon';
import { textoSobre } from '../components/EmpresaChip';
import { telHref, waHref } from '../state/util';
import { haptic } from '../state/nativo';

export function Empresas() {
  const { servicios } = useApp();
  const conteo = (e: Empresa, dir: 'CR' | 'RC') => servicios.filter((s) => s.empresa === e.id && s.direccion === dir).length;
  const lista = (Object.values(EMPRESAS) as Empresa[])
    .filter((e) => e.id !== 'otra' || servicios.some((s) => s.empresa === 'otra'))
    .map((e) => ({ e, cr: conteo(e, 'CR'), rc: conteo(e, 'RC') }))
    .filter((x) => x.cr + x.rc > 0 || x.e.telefonos.length > 0)
    .sort((a, b) => b.cr + b.rc - (a.cr + a.rc));

  return (
    <Page titulo="Empresas">
      <div className="screen">
        <div className="card-list">
          {lista.map(({ e, cr, rc }) => (
            <article className="empresa card" key={e.id} style={{ ['--acc' as string]: e.color }}>
              <div className="empresa__head">
                <span className="empresa__logo" style={{ background: e.color, color: textoSobre(e.color) }}>
                  {e.nombre.replace(/[^\p{L}\d]/gu, '').slice(0, 2).toUpperCase()}
                </span>
                <div className="empresa__txt">
                  <b>{e.nombre}</b>
                  <span className="tnum muted">{cr} salidas C→R · {rc} salidas R→C</span>
                </div>
              </div>
              {e.notas && <p className="nota nota--acc"><Icon name="pin" size={16} />{e.notas}</p>}
              <div className="contact__btns">
                {e.telefonos.map((t) => (
                  <a key={t} className="btn btn--call" href={telHref(t)} onClick={() => haptic('medio')}>
                    <Icon name="phone" size={18} /><span className="tnum">{t}</span>
                  </a>
                ))}
                {e.whatsapp && (
                  <a className="btn btn--wa" href={waHref(e.whatsapp)} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" size={18} /> WhatsApp
                  </a>
                )}
                {e.web && (
                  <a className="btn btn--soft" href={e.web} target="_blank" rel="noopener noreferrer">
                    <Icon name="external" size={16} /> Web
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Page>
  );
}
