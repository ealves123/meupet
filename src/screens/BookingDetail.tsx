import { useState } from 'react';
import { useStore, cancelByTutor, confirmPresence, answerProposal, bookingTotal, priceLabel } from '../lib/store';
import { TopBar, Empty, Sheet, Sup, toast } from '../components/ui';
import { STATUS_LABEL, SIZE_SHORT, onlyDigits } from '../lib/labels';
import { durLabel, whenLabel, hhmm, dayMonth, wdLong } from '../lib/dates';
import { nearestFree } from '../lib/slots';
import { downloadIcs } from '../lib/ics';
import { go } from '../lib/router';

const REASONS = ['Imprevisto', 'Pet doente', 'Achei outro horário', 'Outro'];

/** Tela com todos os dados de um agendamento do tutor. Contato e .ics só depois que o prestador aceita. */
export function BookingDetail({ id }: { id: string }) {
  const s = useStore();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');
  const b = s.bookings.find(x => x.id === id);
  if (!s.tutor || !b || b.tutorPhone !== s.tutor.phone) return <><TopBar title="Agendamento" onBack={() => go('/agendamentos')} /><Empty icon="🔍" title="Agendamento não encontrado" /></>;

  const p = s.providers.find(x => x.id === b.providerId)!;
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const st = new Date(b.start), en = new Date(b.end), now = new Date();
  const totalMin = (en.getTime() - st.getTime()) / 60_000;
  const future = st > now;
  const pending = b.status === 'pendente' && future;
  const confirmed = b.status === 'confirmado';
  const active = (pending || confirmed) && future;
  const late = confirmed && st.getTime() - now.getTime() < p.cancelWindowH * 3600_000;
  const proposals = s.proposals.filter(x => x.bookingId === b.id);
  const openProposals = proposals.filter(x => x.status === 'pendente');
  const alts = b.status === 'recusado' || b.status === 'cancelado_prestador' ? nearestFree(s, p, svc, b.size, st > now ? st : now) : [];
  const history = s.messages.filter(m => m.bookingId === b.id && m.to === 'tutor' && new Date(m.sendAt) <= now).sort((a, c) => a.sendAt.localeCompare(c.sendAt));
  const wa = `https://wa.me/55${onlyDigits(p.phone)}`;
  const answer = (pid: string, ok: boolean) => {
    const r = answerProposal(pid, ok);
    toast(r.ok ? (ok ? 'Extra adicionado. O prestador foi avisado.' : 'Tudo bem, avisamos o prestador.') : 'Esse extra não cabe mais na agenda do prestador.');
  };

  const banner = {
    pendente: <div className="notice warn">⏳ <b>Aguardando {p.name}.</b> O horário está reservado para você. Resposta até {b.respondBy ? whenLabel(new Date(b.respondBy)) : 'o horário'}; sem resposta, o pedido é cancelado e avisamos. <Sup>aprovação do prestador</Sup></div>,
    confirmado: <div className="notice ok">✅ <b>Confirmado por {p.name}.</b>{b.presenceConfirmed ? ' Presença confirmada.' : ''}</div>,
    recusado: <div className="notice danger">❌ <b>{p.name} não aceitou o pedido.</b> {b.refuseReason ? `Motivo: ${b.refuseReason}.` : ''}</div>,
    cancelado_tutor: <div className="notice">Você cancelou{b.lateCancel ? ' (cancelamento tardio)' : ''}.{b.cancelReason ? ` Motivo: ${b.cancelReason}.` : ''}</div>,
    cancelado_prestador: <div className="notice danger">{p.name} cancelou este horário.{b.cancelReason ? ` Motivo: ${b.cancelReason}.` : ''}</div>,
    concluido: <div className="notice">Atendimento concluído.</div>,
    no_show: <div className="notice danger">Registrado como falta. Se não foi isso, fale com o prestador.</div>,
  }[b.status];

  return (
    <div>
      <TopBar title="Agendamento" onBack={() => go('/agendamentos')} />
      {banner}
      <div className="pad">
        <div className="flow-head detail-head">
          <div className="pcard-icon" style={{ background: p.color }}>{p.emoji}</div>
          <div><b>{svc.name}{b.extras?.length ? ` + ${b.extras.map(x => x.name).join(' + ')}` : ''}</b><div className="muted">{p.name}</div>
            <div className={`status s-${b.status}`}>{STATUS_LABEL[b.status]}</div></div>
        </div>

        {openProposals.map(x => (
          <div key={x.id} className="proposal">
            <b>{p.name} sugeriu: {x.name}</b>
            <div className="small">+{priceLabel(x.price)} · +{x.duration} min, logo depois do {svc.name.toLowerCase()}, com {b.staff}</div>
            {x.note && <p className="note">“{x.note}”</p>}
            <div className="row gap"><button className="btn sm" onClick={() => answer(x.id, true)}>Quero o extra</button><button className="btn sm ghost" onClick={() => answer(x.id, false)}>Agora não</button></div>
          </div>
        ))}

        <dl className="summary">
          <dt>Quando</dt><dd><b>{wdLong(st.getDay())}, {dayMonth(st)}</b><br />{hhmm(st)} às {hhmm(en)} · {durLabel(totalMin)}</dd>
          <dt>Onde</dt><dd>{p.address}<br /><span className="muted">{p.area}</span></dd>
          <dt>Pet</dt><dd>{pet?.name ?? b.petName} · {SIZE_SHORT[b.size]}</dd>
          <dt>Profissional</dt><dd>{b.staff}</dd>
          <dt>Valores</dt><dd>
            <div className="row between"><span>{svc.name}</span><span>{priceLabel(b.price, svc.priceFrom)}</span></div>
            {b.extras?.map(x => <div key={x.proposalId} className="row between"><span>+ {x.name}</span><span>{priceLabel(x.price)}</span></div>)}
            {!!b.extras?.length && <div className="row between"><b>Total</b><b>{priceLabel(bookingTotal(b))}</b></div>}
          </dd>
          <dt>Pagamento</dt><dd>No local: {p.payments.join(', ')}</dd>
          <dt>Cancelamento</dt><dd>Sem custo até {p.cancelWindowH} h antes <Sup>RN-26</Sup></dd>
          {b.notes && <><dt>Observações</dt><dd>“{b.notes}”</dd></>}
          <dt>Contato</dt><dd>{confirmed ? <><a href={`tel:${onlyDigits(p.phone)}`}>{p.phone}</a> · <a href={wa} target="_blank" rel="noreferrer">WhatsApp</a></> : <span className="muted">aparece quando o prestador aceitar</span>}</dd>
          <dt>Código</dt><dd className="muted">{b.id.slice(-6).toUpperCase()} · pedido em {whenLabel(new Date(b.createdAt))}</dd>
        </dl>

        <div className="row gap wrap">
          <a className="btn ghost sm" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noreferrer">Ver rota</a>
          {confirmed && future && <button className="btn ghost sm" onClick={() => downloadIcs(b, p, svc)}>Adicionar à agenda</button>}
          {confirmed && future && !b.presenceConfirmed && st.getTime() - now.getTime() < 36 * 3600_000 && <button className="btn ghost sm" onClick={() => { confirmPresence(b.id); toast('Presença confirmada'); }}>Confirmo presença</button>}
          {active && b.reschedules < 2 && <button className="btn ghost sm" onClick={() => go(`/agendar/${p.slug}/${svc.id}?remarcar=${b.id}`)}>Remarcar</button>}
          {active && <button className="btn ghost sm danger" onClick={() => { setReason(''); setCancelOpen(true); }}>{pending ? 'Desistir do pedido' : 'Cancelar'}</button>}
          {b.status === 'concluido' && !b.reviewed && <button className="btn sm" onClick={() => go('/agendamentos')}>Avaliar</button>}
        </div>
        {active && b.reschedules >= 2 && <p className="muted small">Este agendamento já foi remarcado 2 vezes. Para mudar de novo, cancele e faça outro. <Sup>RN-27</Sup></p>}

        {alts.length > 0 && (
          <section className="card flat">
            <h3>Pedir outro horário</h3>
            <div className="slot-row">{alts.map(a => <button key={a.getTime()} className="slot" onClick={() => go(`/agendar/${p.slug}/${svc.id}?t=${a.getTime()}`)}>{whenLabel(a)}</button>)}</div>
          </section>
        )}

        {proposals.some(x => x.status !== 'pendente') && (
          <>
            <h3 className="section-label">Extras sugeridos</h3>
            <ul className="svc-list">{proposals.filter(x => x.status !== 'pendente').map(x => (
              <li key={x.id}><span>{x.name} · {priceLabel(x.price)}</span><span className={`status s-prop-${x.status}`}>{{ pendente: '', aceita: 'aceito', recusada: 'recusado', expirada: 'expirou' }[x.status]}</span></li>
            ))}</ul>
          </>
        )}

        {history.length > 0 && (
          <>
            <h3 className="section-label">Histórico</h3>
            <ul className="history">{history.map(m => <li key={m.id}><small className="muted">{whenLabel(new Date(m.sendAt))} · {m.channel === 'whatsapp' ? 'WhatsApp' : 'e-mail'}</small><div>{m.title}</div></li>)}</ul>
          </>
        )}
      </div>

      <Sheet open={cancelOpen} onClose={() => setCancelOpen(false)} title={pending ? 'Desistir do pedido' : 'Cancelar agendamento'}>
        <div className="form">
          {late ? <div className="notice warn">Faltam menos de {p.cancelWindowH} h. Você ainda pode cancelar, mas fica registrado como cancelamento tardio. <Sup>RN-26</Sup></div>
            : <p>{pending ? 'O pedido é retirado e o horário volta para a agenda do prestador.' : 'Sem custo. O horário volta para a agenda do prestador na hora.'}</p>}
          <fieldset><legend>Motivo (opcional)</legend><div className="chips wrap">{REASONS.map(r => <button key={r} className={`chip small${reason === r ? ' on' : ''}`} onClick={() => setReason(r)}>{r}</button>)}</div></fieldset>
          <button className="btn danger" onClick={() => { cancelByTutor(b.id, reason); setCancelOpen(false); toast(pending ? 'Pedido retirado' : 'Agendamento cancelado'); }}>{pending ? 'Desistir do pedido' : 'Cancelar agendamento'}</button>
        </div>
      </Sheet>
    </div>
  );
}
