import { useState } from 'react';
import { useStore, cancelByTutor, addReview, confirmPresence } from '../lib/store';
import { TopBar, Empty, Sheet, Sup, toast } from '../components/ui';
import { STATUS_LABEL } from '../lib/labels';
import { durLabel, whenLabel, dayMonth, hhmm } from '../lib/dates';
import { go } from '../lib/router';
import type { Booking } from '../lib/types';

const REASONS = ['Imprevisto', 'Pet doente', 'Achei outro horário', 'Outro'];

export function MyBookings() {
  const s = useStore();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  if (!s.tutor) return <><TopBar title="Agendamentos" /><Empty icon="📅" title="Você ainda não entrou"><p>Seus agendamentos aparecem aqui depois do primeiro.</p><button className="btn" onClick={() => go('/')}>Encontrar um serviço</button></Empty></>;

  const mine = s.bookings.filter(b => b.tutorPhone === s.tutor!.phone);
  const now = new Date();
  const upcoming = mine.filter(b => b.status === 'confirmado' && new Date(b.end) > now).sort((a, b) => a.start.localeCompare(b.start));
  const past = mine.filter(b => !upcoming.includes(b)).sort((a, b) => b.start.localeCompare(a.start));
  const cancelling = mine.find(b => b.id === cancelId);
  const cancelLate = cancelling && (() => { const p = s.providers.find(x => x.id === cancelling.providerId)!; return new Date(cancelling.start).getTime() - Date.now() < p.cancelWindowH * 3600_000; })();

  const Card = ({ b }: { b: Booking }) => {
    const p = s.providers.find(x => x.id === b.providerId)!;
    const svc = p.services.find(x => x.id === b.serviceId)!;
    const pet = s.pets.find(x => x.id === b.petId);
    const st = new Date(b.start);
    const started = st <= now;
    const future = b.status === 'confirmado' && !started;
    return (
      <article className="bcard">
        <div className="bcard-date"><small>{dayMonth(st)}</small><b>{hhmm(st)}</b></div>
        <div className="bcard-body">
          <b>{svc.name} · {pet?.name ?? b.petName}</b>
          <div className="muted">{p.name} · {durLabel(svc.duration[b.size])} · com {b.staff}</div>
          <div className={`status s-${b.status}`}>{STATUS_LABEL[b.status]}{b.lateCancel ? ' (tardio)' : ''}{future && b.presenceConfirmed ? ' · presença confirmada' : ''}</div>
          {future && <div className="muted small">{whenLabel(st)} · {p.address} · 📞 {p.phone}</div>}
          <div className="row gap wrap">
            {future && <button className="btn sm ghost" onClick={() => go(`/agendar/${p.slug}/${svc.id}?remarcar=${b.id}`)}>Remarcar</button>}
            {future && <button className="btn sm ghost danger" onClick={() => { setCancelId(b.id); setReason(''); }}>Cancelar</button>}
            {future && !b.presenceConfirmed && st.getTime() - now.getTime() < 36 * 3600_000 && <button className="btn sm ghost" onClick={() => { confirmPresence(b.id); toast('Presença confirmada'); }}>Confirmo presença</button>}
            {b.status === 'concluido' && !b.reviewed && <button className="btn sm" onClick={() => { setReviewId(b.id); setStars(5); setText(''); }}>Avaliar</button>}
            {(b.status === 'cancelado_prestador' || b.status === 'concluido') && <button className="btn sm ghost" onClick={() => go(`/agendar/${p.slug}/${svc.id}`)}>Agendar de novo</button>}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div>
      <TopBar title="Agendamentos" />
      <div className="pad">
        <h3 className="section-label">Próximos</h3>
        {upcoming.length ? upcoming.map(b => <Card key={b.id} b={b} />) : <p className="muted">Nada marcado. <button className="link" onClick={() => go('/')}>Agendar um serviço</button></p>}
        {past.length > 0 && <><h3 className="section-label">Histórico</h3>{past.map(b => <Card key={b.id} b={b} />)}</>}
      </div>

      <Sheet open={!!cancelling} onClose={() => setCancelId(null)} title="Cancelar agendamento">
        <div className="form">
          {cancelLate ? <div className="notice warn">Faltam menos de {s.providers.find(x => x.id === cancelling!.providerId)!.cancelWindowH} h. Você ainda pode cancelar, mas fica registrado como cancelamento tardio. <Sup>RN-26</Sup></div>
            : <p>Sem custo. O horário volta para a agenda do prestador na hora.</p>}
          <fieldset><legend>Motivo (opcional)</legend><div className="chips">{REASONS.map(r => <button key={r} className={`chip small${reason === r ? ' on' : ''}`} onClick={() => setReason(r)}>{r}</button>)}</div></fieldset>
          <button className="btn danger" onClick={() => { cancelByTutor(cancelId!, reason); setCancelId(null); toast('Agendamento cancelado'); }}>Cancelar agendamento</button>
        </div>
      </Sheet>

      <Sheet open={!!reviewId} onClose={() => setReviewId(null)} title="Como foi?">
        <div className="form">
          <div className="star-pick" role="radiogroup" aria-label="Nota">{[1, 2, 3, 4, 5].map(n => <button key={n} role="radio" aria-checked={stars === n} className={n <= stars ? 'on' : ''} onClick={() => setStars(n)}>★</button>)}</div>
          <label>Comentário (opcional)<textarea rows={3} value={text} onChange={e => setText(e.target.value)} /></label>
          <button className="btn" onClick={() => { addReview(reviewId!, stars, text.trim()); setReviewId(null); toast('Obrigado pela avaliação!'); }}>Enviar avaliação</button>
        </div>
      </Sheet>
    </div>
  );
}
