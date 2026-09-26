import type { Contacto } from '../lib/types';
import { Icon } from './Icon';
import { telHref, waHref } from '../state/util';
import { haptic } from '../state/nativo';

export function ContactCard({ c, grande = false }: { c: Contacto; grande?: boolean }) {
  return (
    <article className={`contact card${grande ? ' contact--big' : ''}`}>
      <div className="contact__head">
        <span className="contact__avatar"><Icon name={c.categoria === 'terminal' ? 'building' : c.categoria === 'emergencia' ? 'alert' : 'car'} size={20} /></span>
        <div className="contact__txt">
          <b>{c.nombre}</b>
          {c.direccion && <span><Icon name="pin" size={12} /> {c.direccion}</span>}
          {c.nota && <span className="muted">{c.nota}</span>}
        </div>
      </div>
      <div className="contact__btns">
        {c.telefonos.map((t) => (
          <a key={t} className="btn btn--call" href={telHref(t)} onClick={() => haptic('medio')} aria-label={`Llamar a ${c.nombre}, ${t}`}>
            <Icon name="phone" size={18} />
            <span className="tnum">{t}</span>
          </a>
        ))}
        {c.whatsapp && (
          <a className="btn btn--wa" href={waHref(c.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => haptic()}>
            <Icon name="whatsapp" size={18} />
            WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
