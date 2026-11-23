import { useMemo, useState } from 'react';
import { useStore, setBookingStatus, cancelByProvider, addBlock, removeBlock, addOfflineBooking, updateProvider, pauseProvider, priceLabel,
  logoutProvider, acceptBooking, refuseBooking, extraOptions, proposeExtra, addService, bookingTotal, RESPOND_H } from '../lib/store';
import { TopBar, Sheet, Sup, Empty, toast } from '../components/ui';
import { ProviderAuth } from '../components/ProviderAuth';
import { addDays, startOfDay, sameDay, wd, hhmm, dayMonth, wdLong, minToHHMM, hhmmToMin, atMinutes, addMin, toLocalInput, whenLabel } from '../lib/dates';
import { SIZES, SIZE_SHORT, STATUS_LABEL, brl, TYPE_LABEL, PILOT_TYPES } from '../lib/labels';
import { daySlots } from '../lib/slots';
import type { AppState, Booking, ServiceType, Size } from '../lib/types';
import { go } from '../lib/router';

type Tab = 'pedidos' | 'agenda' | 'servicos' | 'horarios' | 'indicadores';

/** Prestador logado no painel. Só é chamado dentro do painel, depois do login. */
function useProvider() {
  const s = useStore();
  return s.providers.find(x => x.id === s.providerSession!.providerId)!;
}
const pendingOf = (s: AppState, providerId: string) =>
  s.bookings.filter(b => b.providerId === providerId && b.status === 'pendente').sort((a, b) => (a.respondBy ?? a.start).localeCompare(b.respondBy ?? b.start));

export function ProviderPanel() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>('pedidos');
  const p = s.providerSession ? s.providers.find(x => x.id === s.providerSession!.providerId) : undefined;
  if (!p) return (
    <div className="provider">
      <TopBar title="Área do prestador" onBack={() => go('/conta')} />
      <ProviderAuth onDone={isNew => { setTab(isNew ? 'servicos' : 'pedidos'); toast(isNew ? 'Cadastro criado. Agora cadastre seus serviços.' : 'Pronto, você entrou.'); }} />
    </div>
  );
  const pending = pendingOf(s, p.id).length;
  const hasServices = p.services.some(x => x.active);
  return (
    <div className="provider">
      <TopBar title={p.name} onBack={() => go('/conta')} right={<button className="link sm" onClick={() => { logoutProvider(); toast('Você saiu do painel.'); }}>Sair</button>} />
      {!hasServices && <div className="notice warn">Você ainda não aparece no mapa: cadastre ao menos um serviço ativo na aba Serviços.</div>}
      <div className="tabs" role="tablist">
        {(['pedidos', 'agenda', 'servicos', 'horarios', 'indicadores'] as Tab[]).map(t => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {{ pedidos: 'Pedidos', agenda: 'Agenda', servicos: 'Serviços', horarios: 'Horários', indicadores: 'Indicadores' }[t]}
            {t === 'pedidos' && pending > 0 && <span className="count">{pending}</span>}
          </button>
        ))}
      </div>
      {tab === 'pedidos' && <Requests />}
      {tab === 'agenda' && <Agenda />}
      {tab === 'servicos' && <Services />}
      {tab === 'horarios' && <Hours />}
      {tab === 'indicadores' && <Metrics />}
    </div>
  );
}

const REFUSE_REASONS = ['Horário não está mais livre', 'Profissional indisponível', 'Não atendemos esse porte ou espécie', 'Serviço suspenso'];

function Requests() {
  const s = useStore();
  const p = useProvider();
  const list = pendingOf(s, p.id);
  const sent = s.proposals.filter(x => x.providerId === p.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const msgs = s.messages.filter(m => m.to === 'prestador' && m.providerId === p.id).sort((a, b) => b.sendAt.localeCompare(a.sendAt)).slice(0, 3);
  return (
    <div className="pad">
      <p className="muted small">Pedidos feitos pelo meuPet esperam sua resposta. O horário fica reservado até você aceitar ou recusar; sem resposta em até {RESPOND_H} h (ou 1 h antes do horário), o pedido é recusado sozinho. <Sup>prazo de resposta</Sup></p>
      {list.length === 0 && <Empty icon="📭" title="Nenhum pedido pendente"><p>Quando um tutor pedir um horário, ele aparece aqui e no seu WhatsApp.</p></Empty>}
      {list.map(b => <RequestCard key={b.id} b={b} />)}
      {msgs.length > 0 && <><h3 className="section-label">Últimos avisos</h3>{msgs.map(m => <div key={m.id} className="msg whatsapp compact"><b>{m.title}</b><p>{m.body}</p></div>)}</>}
      {sent.length > 0 && (
        <>
          <h3 className="section-label">Extras sugeridos</h3>
          <ul className="svc-list">{sent.map(x => {
            const b = s.bookings.find(y => y.id === x.bookingId);
            return <li key={x.id}><div><b>{x.name}</b> <span className="muted">· {priceLabel(x.price)}</span><div className="muted small">{b && whenLabel(new Date(b.start))}</div></div>
              <span className={`status s-prop-${x.status}`}>{{ pendente: 'aguardando tutor', aceita: 'aceito', recusada: 'recusado', expirada: 'expirou' }[x.status]}</span></li>;
          })}</ul>
        </>
      )}
    </div>
  );
}

function RequestCard({ b }: { b: Booking }) {
  const s = useStore();
  const p = useProvider();
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const tutorName = b.tutorPhone ? (s.tutor?.phone === b.tutorPhone ? s.tutor.name : 'Tutor') : b.clientName;
  const st = new Date(b.start);
  return (
    <article className="card flat request">
      <div className="row between"><b>{whenLabel(st)}</b><span className="muted small">até {hhmm(addMin(st, (new Date(b.end).getTime() - st.getTime()) / 60_000))}</span></div>
      <div><b>{pet?.name ?? b.petName}</b> <span className="muted">({SIZE_SHORT[b.size]})</span> · {svc.name}{extrasText(b)}</div>
      <div className="muted">{tutorName} · com {b.staff} · {priceLabel(bookingTotal(b), svc.priceFrom)}</div>
      <div className="tags">
        <span className="badge mk">meuPet</span>
        {b.isNewClient && <span className="badge new">cliente novo · 8% <Sup /></span>}
        {b.respondBy && <span className="badge warn">responda até {whenLabel(new Date(b.respondBy))}</span>}
      </div>
      {b.notes && <p className="note">“{b.notes}”</p>}
      <BookingActions b={b} />
    </article>
  );
}

const extrasText = (b: Booking) => (b.extras?.length ? ` + ${b.extras.map(x => x.name).join(' + ')}` : '');

/** Aceitar, recusar com motivo e sugerir extra. Usado nos Pedidos e na Agenda. */
function BookingActions({ b }: { b: Booking }) {
  const s = useStore();
  const [sheet, setSheet] = useState<'recusar' | 'extra' | null>(null);
  const [reason, setReason] = useState('');
  const [other, setOther] = useState('');
  const [extraId, setExtraId] = useState('');
  const [note, setNote] = useState('');
  const future = new Date(b.start) > new Date();
  const canExtra = future && b.origin === 'marketplace' && (b.status === 'pendente' || b.status === 'confirmado');
  const pendingProposals = s.proposals.filter(x => x.bookingId === b.id && x.status === 'pendente');
  const opts = sheet === 'extra' ? extraOptions(s, b) : [];
  const finalReason = (reason === 'Outro' ? other : reason).trim();
  return (
    <>
      {pendingProposals.length > 0 && <div className="muted small">Extra sugerido, aguardando o tutor: {pendingProposals.map(x => x.name).join(', ')}</div>}
      <div className="row gap wrap">
        {b.status === 'pendente' && <button className="btn sm" onClick={() => { acceptBooking(b.id); toast('Pedido aceito. O tutor recebeu a confirmação.'); }}>Aceitar</button>}
        {b.status === 'pendente' && <button className="btn sm ghost danger" onClick={() => { setSheet('recusar'); setReason(''); setOther(''); }}>Recusar</button>}
        {canExtra && <button className="btn sm ghost" onClick={() => { setSheet('extra'); setExtraId(''); setNote(''); }}>+ Sugerir extra</button>}
      </div>
      <Sheet open={sheet === 'recusar'} onClose={() => setSheet(null)} title="Recusar pedido">
        <form className="form" onSubmit={e => {
          e.preventDefault();
          if (!finalReason) return toast('Diga o motivo para o tutor.');
          refuseBooking(b.id, finalReason); setSheet(null); toast('Pedido recusado. O tutor recebeu o motivo e os horários livres mais próximos.');
        }}>
          <p>O tutor vê o motivo e recebe os 3 horários livres mais próximos para pedir de novo. <Sup>RN-30</Sup></p>
          <fieldset><legend>Motivo</legend><div className="chips wrap">{[...REFUSE_REASONS, 'Outro'].map(r => (
            <button key={r} type="button" className={`chip small${reason === r ? ' on' : ''}`} aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>
          ))}</div></fieldset>
          {reason === 'Outro' && <label>Explique em poucas palavras<input autoFocus value={other} onChange={e => setOther(e.target.value)} maxLength={140} /></label>}
          <button className="btn danger" type="submit" disabled={!finalReason}>Recusar e avisar o tutor</button>
        </form>
      </Sheet>
      <Sheet open={sheet === 'extra'} onClose={() => setSheet(null)} title="Sugerir um extra">
        <form className="form" onSubmit={e => {
          e.preventDefault();
          if (!extraId) return toast('Escolha o serviço extra.');
          const r = proposeExtra(b.id, extraId, note);
          if (!r.ok) return toast(r.reason === 'nao_cabe' ? 'Não cabe na agenda logo depois deste atendimento.' : 'Não dá para sugerir extra neste agendamento.');
          setSheet(null); toast('Sugestão enviada. O tutor aceita ou recusa pelo WhatsApp.');
        }}>
          <p className="muted small">O extra é feito logo depois do serviço, com o mesmo profissional. O tutor decide; se aceitar, o atendimento cresce na agenda.</p>
          {opts.length === 0 && <p className="muted">Você não tem outro serviço ativo para este pet.</p>}
          <div className="extra-list">{opts.map(({ svc: x, fits }) => (
            <label key={x.id} className={`check extra-opt${fits ? '' : ' off'}`}>
              <input type="radio" name="extra" value={x.id} disabled={!fits} checked={extraId === x.id} onChange={() => setExtraId(x.id)} />
              <span><b>{x.name}</b> <span className="muted">· +{priceLabel(x.price[b.size], x.priceFrom)} · +{x.duration[b.size]} min</span>
                {!fits && <><br /><small className="muted">não cabe logo depois na agenda</small></>}</span>
            </label>
          ))}</div>
          <label>Mensagem para o tutor (opcional)<textarea rows={2} value={note} onChange={e => setNote(e.target.value)} maxLength={200} placeholder="Ex.: A hidratação deixa o pelo macio por mais tempo." /></label>
          <button className="btn" type="submit" disabled={!extraId}>Enviar sugestão</button>
        </form>
      </Sheet>
    </>
  );
}

function Agenda() {
  const s = useStore();
  const p = useProvider();
  const [day, setDay] = useState(startOfDay(new Date()));
  const [open, setOpen] = useState<'bloqueio' | 'cliente' | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => addDays(startOfDay(now), i - 2));
  const items = useMemo(() => {
    const bs = s.bookings.filter(b => b.providerId === p.id && sameDay(new Date(b.start), day)).map(b => ({ kind: 'b' as const, start: b.start, b }));
    const ks = s.blocks.filter(k => k.providerId === p.id && sameDay(new Date(k.start), day)).map(k => ({ kind: 'k' as const, start: k.start, k }));
    return [...bs, ...ks].sort((a, b) => a.start.localeCompare(b.start));
  }, [s, p.id, day]);
  const hours = p.hours[day.getDay()];
  const active = items.filter(i => i.kind === 'b' && (i.b.status === 'confirmado' || i.b.status === 'pendente')).length;

  return (
    <div>
      {p.paused && <div className="notice warn">Agenda pausada até {dayMonth(new Date(p.paused.until + 'T12:00'))}. Você não aparece no mapa.</div>}
      <div className="days">
        {days.map(d => (
          <button key={d.toISOString()} className={`day${sameDay(d, day) ? ' on' : ''}`} onClick={() => setDay(d)}>
            <small>{sameDay(d, now) ? 'hoje' : wd(d)}</small><b>{d.getDate()}</b>
            <small>{s.bookings.filter(b => b.providerId === p.id && (b.status === 'confirmado' || b.status === 'pendente') && sameDay(new Date(b.start), d)).length || '—'}</small>
          </button>
        ))}
      </div>
      <div className="pad-x">
        <div className="row between">
          <h3 className="section-label">{wdLong(day.getDay())}, {dayMonth(day)} · {hours ? `${minToHHMM(hours[0])}–${minToHHMM(hours[1])}` : 'fechado'} · {active} agendados</h3>
        </div>
        <div className="row gap wrap">
          <button className="btn sm" onClick={() => setOpen('cliente')}>+ Cliente de fora do app</button>
          <button className="btn sm ghost" onClick={() => setOpen('bloqueio')}>+ Bloquear horário</button>
        </div>
        <p className="muted small">Lance aqui quem marcou por WhatsApp ou no balcão. Assim a agenda que o tutor vê continua real.</p>
        <ul className="timeline">
          {items.map(i => i.kind === 'k' ? (
            <li key={i.k.id} className="tl block">
              <span className="tl-time">{hhmm(new Date(i.k.start))}<br /><small>{hhmm(new Date(i.k.end))}</small></span>
              <div className="tl-body"><b>🔒 {i.k.label}</b><div className="muted">{i.k.staff ?? 'Todos'}</div>
                <button className="link sm" onClick={() => removeBlock(i.k.id)}>Remover bloqueio</button></div>
            </li>
          ) : (() => {
            const b = i.b; const svc = p.services.find(x => x.id === b.serviceId)!;
            const st = new Date(b.start); const pet = s.pets.find(x => x.id === b.petId);
            const tutorName = b.tutorPhone ? (s.tutor?.phone === b.tutorPhone ? s.tutor.name : 'Tutor') : b.clientName;
            const canMark = b.status === 'confirmado' && st <= now;
            return (
              <li key={b.id} className={`tl s-${b.status}`}>
                <span className="tl-time">{hhmm(st)}<br /><small>{hhmm(new Date(b.end))}</small></span>
                <div className="tl-body">
                  <b>{pet?.name ?? b.petName} · {svc.name}{extrasText(b)}</b> <span className="muted">({SIZE_SHORT[b.size]})</span>
                  <div className="muted">{tutorName} · {b.staff} · {priceLabel(bookingTotal(b), svc.priceFrom)}</div>
                  <div className="tags">
                    {b.origin === 'marketplace' ? <span className="badge mk">meuPet</span> : <span className="badge">agenda própria</span>}
                    {b.isNewClient && b.origin === 'marketplace' && <span className="badge new">cliente novo · 8% <Sup /></span>}
                    {b.presenceConfirmed && b.status === 'confirmado' && <span className="badge ok">presença confirmada</span>}
                    {b.status !== 'confirmado' && <span className={`status s-${b.status}`}>{b.status === 'pendente' ? 'pedido aguardando você' : STATUS_LABEL[b.status].replace('por você', 'pelo tutor')}</span>}
                  </div>
                  {b.notes && <p className="note">“{b.notes}”</p>}
                  {b.refuseReason && <p className="muted small">Motivo da recusa: {b.refuseReason}</p>}
                  {(b.status === 'pendente' || (b.status === 'confirmado' && st > now)) && <BookingActions b={b} />}
                  {b.status === 'confirmado' && (
                    <div className="row gap wrap">
                      {canMark && <button className="btn sm" onClick={() => setBookingStatus(b.id, 'concluido')}>Concluído</button>}
                      {canMark && <button className="btn sm ghost" onClick={() => { setBookingStatus(b.id, 'no_show'); toast('Falta registrada. O tutor é avisado e pode contestar.'); }}>Faltou</button>}
                      {st > now && <button className="btn sm ghost danger" onClick={() => setCancelId(b.id)}>Cancelar</button>}
                    </div>
                  )}
                </div>
              </li>
            );
          })())}
          {items.length === 0 && <li className="muted">Nada neste dia.</li>}
        </ul>
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open === 'cliente' ? 'Cliente de fora do app' : 'Bloquear horário'}>
        {open && <EntryForm kind={open} day={day} onDone={() => setOpen(null)} />}
      </Sheet>
      <Sheet open={!!cancelId} onClose={() => setCancelId(null)} title="Cancelar agendamento">
        <div className="form">
          <p>O tutor é avisado na hora pelo WhatsApp e por e-mail, com os 3 horários livres mais próximos para remarcar. <Sup>RN-30</Sup></p>
          <button className="btn danger" onClick={() => { cancelByProvider(cancelId!, ''); setCancelId(null); toast('Cancelado. O tutor foi avisado.'); }}>Cancelar e avisar o tutor</button>
        </div>
      </Sheet>
    </div>
  );
}

function EntryForm({ kind, day, onDone }: { kind: 'bloqueio' | 'cliente'; day: Date; onDone: () => void }) {
  const s = useStore();
  const p = useProvider();
  const [date, setDate] = useState(toLocalInput(day));
  const [time, setTime] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const [staff, setStaff] = useState<string>(p.staff[0]);
  const [svcId, setSvcId] = useState(p.services[0]?.id ?? '');
  const [size, setSize] = useState<Size>('medio');
  const [client, setClient] = useState('');
  const [petName, setPetName] = useState('');
  const [label, setLabel] = useState('Bloqueado');
  const d = new Date(date + 'T00:00');
  const svc = p.services.find(x => x.id === svcId);
  const free = kind === 'cliente' && svc ? daySlots(s, p, svc, size, d, staff, new Date(0)) : [];
  if (kind === 'cliente' && !svc) return <p className="muted pad">Cadastre um serviço antes de lançar clientes.</p>;
  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      const st = atMinutes(d, hhmmToMin(time));
      if (kind === 'bloqueio') {
        addBlock({ providerId: p.id, staff: staff === '*' ? null : staff, start: st.toISOString(), end: atMinutes(d, hhmmToMin(end)).toISOString(), label });
        toast('Horário bloqueado');
      } else {
        if (!free.some(x => x.start.getTime() === st.getTime())) return toast('Esse horário não está livre para esse serviço.');
        addOfflineBooking({ providerId: p.id, serviceId: svcId, staff, start: st, size, clientName: client || 'Cliente', petName: petName || 'Pet' });
        toast('Cliente lançado na agenda');
      }
      onDone();
    }}>
      <label>Data<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
      <label>Profissional<select value={staff} onChange={e => setStaff(e.target.value)}>
        {kind === 'bloqueio' && <option value="*">Todos</option>}
        {p.staff.map(x => <option key={x}>{x}</option>)}
      </select></label>
      {kind === 'bloqueio' ? (
        <>
          <div className="row gap"><label>Início<input type="time" step={900} value={time} onChange={e => setTime(e.target.value)} /></label>
            <label>Fim<input type="time" step={900} value={end} onChange={e => setEnd(e.target.value)} /></label></div>
          <label>Motivo<input value={label} onChange={e => setLabel(e.target.value)} /></label>
        </>
      ) : (
        <>
          <label>Serviço<select value={svcId} onChange={e => setSvcId(e.target.value)}>{p.services.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Porte<select value={size} onChange={e => setSize(e.target.value as Size)}>{SIZES.map(x => <option key={x} value={x}>{SIZE_SHORT[x]}</option>)}</select></label>
          <label>Horário livre<select value={time} onChange={e => setTime(e.target.value)}>
            <option value="">Escolha</option>
            {free.map(x => <option key={x.start.getTime()} value={hhmm(x.start)}>{hhmm(x.start)}–{hhmm(addMin(x.start, svc!.duration[size]))}</option>)}
          </select></label>
          <div className="row gap"><label>Tutor<input value={client} onChange={e => setClient(e.target.value)} placeholder="Nome" /></label>
            <label>Pet<input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Nome do pet" /></label></div>
        </>
      )}
      <button className="btn" type="submit">Salvar</button>
    </form>
  );
}

function Services() {
  const p = useProvider();
  const [name, setName] = useState('');
  const [type, setType] = useState<ServiceType>(p.types.find(t => PILOT_TYPES.includes(t)) ?? 'banho_tosa');
  return (
    <div className="pad">
      <p className="muted small">Preço e duração por porte. O tutor vê o valor do porte do pet dele. Os outros serviços ativos podem ser sugeridos como extra num pedido.</p>
      <form className="card flat form" onSubmit={e => {
        e.preventDefault();
        if (!name.trim()) return;
        addService(p.id, { name, type }); setName(''); toast('Serviço criado. Ajuste duração e preço por porte.');
      }}>
        <h3>Novo serviço</h3>
        <div className="row gap">
          <label>Nome<input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Hidratação de pelos" required /></label>
          <label>Tipo<select value={type} onChange={e => setType(e.target.value as ServiceType)}>{PILOT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select></label>
        </div>
        <button className="btn sm" type="submit">Adicionar serviço</button>
      </form>
      {p.services.map(x => (
        <section key={x.id} className="card flat">
          <div className="row between"><b>{x.name}</b>
            <label className="check"><input type="checkbox" checked={x.active} onChange={e => updateProvider(p.id, pp => { pp.services.find(y => y.id === x.id)!.active = e.target.checked; })} /> ativo</label></div>
          <div className="muted small">{TYPE_LABEL[x.type]}</div>
          <table className="svc-table">
            <thead><tr><th>Porte</th><th>Duração (min)</th><th>Preço (R$)</th></tr></thead>
            <tbody>{SIZES.map(z => (
              <tr key={z}><td>{SIZE_SHORT[z]}</td>
                <td><input type="number" min={15} step={15} value={x.duration[z]} onChange={e => updateProvider(p.id, pp => { pp.services.find(y => y.id === x.id)!.duration[z] = Math.max(15, Number(e.target.value)); })} /></td>
                <td><input type="number" min={0} value={x.price[z] ?? ''} placeholder="no local" onChange={e => updateProvider(p.id, pp => { pp.services.find(y => y.id === x.id)!.price[z] = e.target.value === '' ? null : Number(e.target.value); })} /></td></tr>
            ))}</tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function Hours() {
  const p = useProvider();
  const [until, setUntil] = useState(toLocalInput(addDays(new Date(), 7)));
  return (
    <div className="pad">
      <section className="card flat">
        <h3>Horário de funcionamento</h3>
        {[1, 2, 3, 4, 5, 6, 0].map(i => {
          const h = p.hours[i];
          return (
            <div key={i} className="hours-row">
              <label className="check"><input type="checkbox" checked={!!h} onChange={e => updateProvider(p.id, pp => { pp.hours[i] = e.target.checked ? [480, 1080] : null; })} /> {wdLong(i)}</label>
              {h && <>
                <input type="time" step={900} value={minToHHMM(h[0])} onChange={e => updateProvider(p.id, pp => { pp.hours[i] = [hhmmToMin(e.target.value), h[1]]; })} />
                <span>–</span>
                <input type="time" step={900} value={minToHHMM(h[1])} onChange={e => updateProvider(p.id, pp => { pp.hours[i] = [h[0], hhmmToMin(e.target.value)]; })} />
              </>}
            </div>
          );
        })}
      </section>
      <section className="card flat form">
        <h3>Regras da agenda</h3>
        <label>Intervalo entre horários<select value={p.slotStep} onChange={e => updateProvider(p.id, pp => { pp.slotStep = Number(e.target.value) as 15 | 30; })}><option value={15}>15 min</option><option value={30}>30 min</option></select></label>
        <label>Limpeza entre atendimentos (min)<input type="number" min={0} step={5} value={p.cleanupMin} onChange={e => updateProvider(p.id, pp => { pp.cleanupMin = Number(e.target.value); })} /></label>
        <label>Antecedência mínima (horas) <Sup>RN-14</Sup><input type="number" min={0} max={72} value={p.minAdvanceMin / 60} onChange={e => updateProvider(p.id, pp => { pp.minAdvanceMin = Number(e.target.value) * 60; })} /></label>
        <label>Cancelamento sem custo até (horas antes) <Sup>RN-26</Sup><input type="number" min={2} max={48} value={p.cancelWindowH} onChange={e => updateProvider(p.id, pp => { pp.cancelWindowH = Math.min(48, Math.max(2, Number(e.target.value))); })} /></label>
        <label>Profissionais (separados por vírgula)<input value={p.staff.join(', ')} onChange={e => updateProvider(p.id, pp => { const v = e.target.value.split(',').map(x => x.trim()).filter(Boolean); if (v.length) pp.staff = v; })} /></label>
      </section>
      <section className="card flat form">
        <h3>Férias ou reforma</h3>
        {p.paused ? (
          <><p>Agenda pausada até {dayMonth(new Date(p.paused.until + 'T12:00'))}.</p><button className="btn" onClick={() => pauseProvider(p.id, null)}>Reabrir agenda</button></>
        ) : (
          <><p className="muted small">Você some do mapa e os agendamentos até essa data são cancelados com aviso aos tutores.</p>
            <label>Pausar até<input type="date" value={until} onChange={e => setUntil(e.target.value)} /></label>
            <button className="btn ghost danger" onClick={() => { pauseProvider(p.id, until); toast('Agenda pausada'); }}>Pausar agenda</button></>
        )}
      </section>
    </div>
  );
}

function Metrics() {
  const s = useStore();
  const p = useProvider();
  const now = new Date();
  const since = addDays(startOfDay(now), -30);
  const bs = s.bookings.filter(b => b.providerId === p.id && new Date(b.start) >= since && new Date(b.start) <= addDays(now, 30));
  const past = bs.filter(b => new Date(b.start) < now && ['concluido', 'no_show'].includes(b.status));
  const noShow = past.filter(b => b.status === 'no_show').length;
  const live = (b: Booking) => !b.status.startsWith('cancelado') && b.status !== 'recusado';
  const mk = bs.filter(b => b.origin === 'marketplace' && live(b) && b.status !== 'pendente');
  const newMk = mk.filter(b => b.isNewClient);
  const revenueNew = newMk.reduce((a, b) => a + (bookingTotal(b) ?? b.price ?? 0), 0);
  const answered = bs.filter(b => b.origin === 'marketplace' && (b.refuseReason || ['confirmado', 'concluido', 'no_show'].includes(b.status)));
  const refused = answered.filter(b => b.status === 'recusado').length;
  const extras = s.proposals.filter(x => x.providerId === p.id);
  const presence = bs.filter(b => b.status === 'confirmado' && new Date(b.start) > now);
  const tiles: [string, string, string?][] = [
    ['Agendamentos (±30 dias)', String(bs.filter(b => live(b) && b.status !== 'pendente').length)],
    ['Pedidos recusados', answered.length ? `${Math.round((refused / answered.length) * 100)}%` : '—', 'dos pedidos do meuPet respondidos'],
    ['Extras aceitos', extras.length ? `${extras.filter(x => x.status === 'aceita').length} de ${extras.length}` : '—', 'sugestões de serviço extra'],
    ['Vindos do meuPet', String(mk.length), `${newMk.length} clientes novos`],
    ['Taxa de falta', past.length ? `${Math.round((noShow / past.length) * 100)}%` : '—', 'meta do piloto: abaixo de 10%'],
    ['Presença confirmada', presence.length ? `${Math.round((presence.filter(b => b.presenceConfirmed).length / presence.length) * 100)}%` : '—', 'dos próximos agendamentos'],
    ['Comissão estimada', brl(revenueNew * 0.08), `8% sobre ${brl(revenueNew)} de clientes novos`],
  ];
  return (
    <div className="pad">
      <div className="tiles">{tiles.map(([l, v, h]) => <div key={l} className="tile"><small>{l}</small><b>{v}</b>{h && <span className="muted small">{h}</span>}</div>)}</div>
      <p className="muted small">Comissão de 8% só sobre clientes novos que vieram pelo meuPet, como no plano de negócio. A regra exata de "cliente novo" ainda vai ser definida. <Sup /></p>
      <p className="muted small">Período: {dayMonth(since)} a {dayMonth(addDays(now, 30))}.</p>
    </div>
  );
}
