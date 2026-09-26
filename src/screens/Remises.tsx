import { CONTACTOS } from '../data';
import { Page } from '../components/Page';
import { ContactCard } from '../components/ContactCard';

export function Remises() {
  const autos = CONTACTOS.filter((c) => c.categoria === 'remis' || c.categoria === 'taxi');
  const otros = CONTACTOS.filter((c) => c.categoria === 'terminal' || c.categoria === 'municipio' || c.categoria === 'emergencia');
  return (
    <Page titulo="Remises y taxis">
      <div className="screen">
        <p className="lead">Tocá un número para llamar. Son de Casilda; confirmá tarifa y demora al pedir.</p>
        <div className="card-list">
          {autos.map((c) => <ContactCard key={c.nombre} c={c} grande />)}
        </div>
        {otros.length > 0 && (
          <section className="section">
            <div className="section__head"><h2>Terminales y otros</h2></div>
            <div className="card-list">
              {otros.map((c) => <ContactCard key={c.nombre} c={c} />)}
            </div>
          </section>
        )}
      </div>
    </Page>
  );
}
