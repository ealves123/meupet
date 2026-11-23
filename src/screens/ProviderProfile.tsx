import { useStore, priceLabel } from '../lib/store';
import { TopBar, Stars, Sup, Empty, toast } from '../components/ui';
import { TYPE_LABEL, SIZE_SHORT } from '../lib/labels';
import { ratingOf } from '../lib/rating';
import { nextSlots } from '../lib/slots';
import { distanceKm, kmLabel, ALPHAVILLE } from '../lib/geo';
import { durLabel, minToHHMM, wdLong, whenLabel, dayMonth } from '../lib/dates';
import { go } from '../lib/router';
import type { Size } from '../lib/types';

export function ProviderProfile({ slug }: { slug: string }) {
  const s = useStore();
  const p = s.providers.find(x => x.slug === slug);
  if (!p) return (<><TopBar title="Prestador" onBack /><Empty icon="🔍" title="Prestador indisponível">
    <p>Este perfil não está mais ativo. Veja outros prestadores por perto.</p><button className="btn" onClick={() => go('/explorar')}>Ver no mapa</button></Empty></>);

  const pet = s.pets.find(x => x.id === s.selectedPetId && !x.archived) ?? null;
  const size: Size = pet?.size ?? 'medio';
  const rating = ratingOf(s, p.id);
  const services = p.services.filter(x => x.active && (!pet || x.species.includes(pet.species)));
  // "serviço mais agendado"
  const counts = new Map<string, number>();
  for (const b of s.bookings) if (b.providerId === p.id) counts.set(b.serviceId, (counts.get(b.serviceId) ?? 0) + 1);
  const top = [...services].sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))[0];
  const next = top ? nextSlots(s, p, top, size, 3) : [];
  const reviews = s.reviews.filter(r => r.providerId === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const myBooked = s.tutor && s.bookings.some(b => b.providerId === p.id && b.tutorPhone === s.tutor!.phone && b.status === 'confirmado');

  const share = async () => {
    const url = `https://meupet.com.br/alphaville/${p.types[0].replace('_', '-')}/${p.slug}`;
    try { if (navigator.share) await navigator.share({ title: p.name, url }); else { await navigator.clipboard.writeText(url); toast('Link copiado'); } } catch { /* cancelado */ }
  };
  const book = (svcId: string, start?: Date) => go(`/agendar/${p.slug}/${svcId}${start ? `?t=${start.getTime()}` : ''}`);

  return (
    <div className="profile">
      <TopBar title={p.name} onBack right={<button className="icon-btn" aria-label="Compartilhar" onClick={share}>⤴</button>} />
      <div className="hero" style={{ background: `linear-gradient(135deg, ${p.color}, ${p.color}aa)` }}>
        <span className="hero-emoji" aria-hidden>{p.emoji}</span>
        <div className="photos-note">Fotos do prestador (até 10) <Sup /></div>
      </div>
      <section className="card">
        <h2 className="pname">{p.name}</h2>
        <p className="muted">{p.types.map(t => TYPE_LABEL[t]).join(' · ')} · {kmLabel(distanceKm(ALPHAVILLE, p))} do centro de Alphaville</p>
        <p>{rating.isNew ? <span className="badge new">Novo no meuPet</span> : <><Stars value={rating.avg} /> <b>{rating.avg.toFixed(1).replace('.', ',')}</b> <span className="muted">({rating.count} avaliações)</span></>}</p>
        <p>{p.description}</p>
      </section>

      {p.paused ? (
        <div className="notice warn">Agenda pausada até {dayMonth(new Date(p.paused.until + 'T12:00'))}. Volte depois dessa data para agendar.</div>
      ) : top && (
        <section className="card">
          <h3>Próximos horários · {top.name}</h3>
          {next.length ? (
            <div className="slot-row">{next.map(x => <button key={x.start.getTime()} className="slot" onClick={() => book(top.id, x.start)}>{whenLabel(x.start)}</button>)}</div>
          ) : <p className="muted">Sem horários livres nos próximos 14 dias.</p>}
          <button className="link" onClick={() => book(top.id)}>Ver agenda completa ›</button>
        </section>
      )}

      <section className="card">
        <h3>Serviços {pet && <small className="muted">· preços para {pet.name} ({SIZE_SHORT[pet.size]})</small>}{!pet && <small className="muted">· porte médio</small>}</h3>
        <ul className="svc-list">
          {services.map(x => (
            <li key={x.id}>
              <div>
                <b>{x.name}</b>
                <div className="muted">{durLabel(x.duration[size])} · {priceLabel(x.price[size], x.priceFrom)} · no estabelecimento</div>
              </div>
              {!p.paused && <button className="btn sm" onClick={() => book(x.id)}>Agendar</button>}
            </li>
          ))}
          {services.length === 0 && <li className="muted">Nenhum serviço para {pet?.name}.</li>}
        </ul>
        <p className="muted small">O preço é estimado. O valor final é combinado e pago no local.</p>
      </section>

      <section className="card">
        <h3>Endereço e contato</h3>
        <p>{p.address}<br /><span className="muted">{p.area}</span></p>
        <a className="link" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noreferrer">Abrir rota ›</a>
        <p className="contact-hidden">📞 {myBooked ? <b>{p.phone}</b> : <>Telefone e WhatsApp aparecem depois que você agendar. <Sup>RN-11</Sup></>}</p>
      </section>

      <section className="card">
        <h3>Funcionamento e políticas</h3>
        <ul className="hours">
          {[1, 2, 3, 4, 5, 6, 0].map(i => <li key={i}><span>{wdLong(i)}</span><span>{p.hours[i] ? `${minToHHMM(p.hours[i]![0])} – ${minToHHMM(p.hours[i]![1])}` : 'Fechado'}</span></li>)}
        </ul>
        <p><b>Pagamento no local:</b> {p.payments.join(', ')}</p>
        <p><b>Cancelamento:</b> sem custo até {p.cancelWindowH} h antes. <Sup>RN-26</Sup></p>
        <p><b>Profissionais:</b> {p.staff.join(', ')}</p>
      </section>

      <section className="card">
        <h3>Avaliações</h3>
        {reviews.slice(0, 8).map(r => (
          <div key={r.id} className="review">
            <div><Stars value={r.stars} size={12} /> <b>{r.author}</b> <span className="muted">· {dayMonth(new Date(r.date))}</span></div>
            {r.text && <p>{r.text}</p>}
            {r.reply && <p className="reply">Resposta do prestador: {r.reply}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="muted">Ainda sem avaliações.</p>}
        <p className="muted small">Só avalia quem foi atendido pelo meuPet.</p>
      </section>
    </div>
  );
}
