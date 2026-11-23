import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, getState, createHold, releaseHold, confirmBooking, savePet, selectPet, HOLD_MIN, RESPOND_H, priceLabel } from '../lib/store';
import { TopBar, Sup, Empty, toast } from '../components/ui';
import { daySlots, type Slot } from '../lib/slots';
import { addDays, addMin, startOfDay, sameDay, wd, hhmm, durLabel, whenLabel, dayMonth } from '../lib/dates';
import { SIZE_SHORT } from '../lib/labels';
import { go } from '../lib/router';
import { Login } from '../components/Login';
import { PetForm } from '../components/PetForm';
import type { Booking as B } from '../lib/types';
import { downloadIcs } from '../lib/ics';

type Step = 'horario' | 'login' | 'pet' | 'resumo' | 'ok';

export function Booking({ slug, serviceId, query }: { slug: string; serviceId: string; query: URLSearchParams }) {
  const s = useStore();
  const p = s.providers.find(x => x.slug === slug);
  const svc = p?.services.find(x => x.id === serviceId);
  const rescheduleOf = query.get('remarcar') ?? undefined;
  const original = rescheduleOf ? s.bookings.find(b => b.id === rescheduleOf) : undefined;
  const pets = s.pets.filter(x => !x.archived);
  const [petId, setPetId] = useState<string | null>(original?.petId ?? s.selectedPetId ?? pets[0]?.id ?? null);
  const pet = pets.find(x => x.id === petId) ?? null;
  const size = pet?.size ?? original?.size ?? 'medio';

  const initialT = query.get('t') ? new Date(Number(query.get('t'))) : null;
  const [staffSel, setStaffSel] = useState<string>('any');
  const [day, setDay] = useState<Date>(startOfDay(initialT ?? new Date()));
  const [slot, setSlot] = useState<Slot | null>(null);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdUntil, setHoldUntil] = useState<number>(0);
  const [step, setStep] = useState<Step>('horario');
  const [notes, setNotes] = useState('');
  const [alts, setAlts] = useState<Date[] | null>(null);
  const [done, setDone] = useState<B | null>(null);
  const [daysShown, setDaysShown] = useState(14);
  const [, tick] = useState(0);

  useEffect(() => { const t = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(t); }, []);
  const holdRef = useRef<string | null>(null);
  holdRef.current = holdId;
  useEffect(() => () => releaseHold(holdRef.current), []); // libera a reserva se sair do fluxo

  const now = new Date();
  const days = useMemo(() => Array.from({ length: daysShown }, (_, i) => addDays(startOfDay(now), i)), [daysShown, now.toDateString()]);
  const counts = useMemo(() => (p && svc ? days.map(d => daySlots(s, p, svc, size, d, staffSel, now, { ignoreBookingId: rescheduleOf, ignoreHoldId: holdId ?? undefined }).length) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [s, days, staffSel, size, holdId]);
  const slots = p && svc ? daySlots(s, p, svc, size, day, staffSel, now, { ignoreBookingId: rescheduleOf, ignoreHoldId: holdId ?? undefined }) : [];

  // pula para o primeiro dia com horário, se o escolhido não tiver
  useEffect(() => {
    if (initialT && slots.some(x => x.start.getTime() === initialT.getTime()) && !slot) { setSlot(slots.find(x => x.start.getTime() === initialT.getTime())!); return; }
    const i = days.findIndex(d => sameDay(d, day));
    if (i >= 0 && counts[i] === 0) { const j = counts.findIndex(c => c > 0); if (j >= 0) setDay(days[j]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.join()]);

  if (!p || !svc) return <><TopBar title="Agendar" onBack /><Empty icon="🔍" title="Serviço indisponível" /></>;
  if (original && original.reschedules >= 2) return <><TopBar title="Remarcar" onBack /><Empty icon="🔁" title="Limite de remarcações"><p>Este agendamento já foi remarcado 2 vezes. Cancele e faça um novo. <Sup>RN-27</Sup></p></Empty></>;

  const remaining = Math.max(0, Math.ceil((holdUntil - Date.now()) / 1000));
  const groups: [string, Slot[]][] = [
    ['Manhã', slots.filter(x => x.start.getHours() < 12)],
    ['Tarde', slots.filter(x => x.start.getHours() >= 12 && x.start.getHours() < 18)],
    ['Noite', slots.filter(x => x.start.getHours() >= 18)],
  ];

  const advance = (from: Step) => {
    const st = getState();
    if (from === 'horario' || from === 'login') {
      if (!st.tutor) return setStep('login');
      if (!st.pets.some(x => !x.archived)) return setStep('pet');
      return setStep('resumo');
    }
    if (from === 'pet') return setStep('resumo');
  };

  const onContinue = () => {
    if (!slot) return;
    releaseHold(holdId);
    const h = createHold(p.id, slot.staff, slot.start, addMin(slot.start, svc.duration[size])); // RN-20
    setHoldId(h); setHoldUntil(Date.now() + HOLD_MIN * 60_000);
    advance('horario');
  };

  const onConfirm = () => {
    if (!slot || !pet) return;
    const r = confirmBooking({ providerId: p.id, serviceId: svc.id, staff: slot.staff, staffChoice: staffSel, start: slot.start, petId: pet.id, notes, holdId, rescheduleOf });
    if (r.ok) { setDone(r.booking); setStep('ok'); setHoldId(null); return; }
    if (r.reason === 'ocupado') { setAlts(r.alternatives ?? []); setStep('horario'); setSlot(null); releaseHold(holdId); setHoldId(null); }
    if (r.reason === 'limite') toast('Você já tem 3 agendamentos futuros com este prestador.');
    if (r.reason === 'login') setStep('login');
  };

  const title = rescheduleOf ? 'Remarcar' : 'Agendar';

  if (step === 'ok' && done) {
    const st = new Date(done.start);
    return (
      <div className="flow">
        <TopBar title={rescheduleOf ? 'Remarcado' : 'Agendado'} />
        <div className="success">
          <div className="success-icon">✓</div>
          <h2>{done.status === 'pendente' ? (rescheduleOf ? 'Novo horário pedido!' : 'Pedido enviado!') : 'Horário alterado!'}</h2>
          <p>{svc.name} do <b>{pet?.name}</b> no <b>{p.name}</b><br />{whenLabel(st)} · {durLabel(svc.duration[size])} · com {done.staff}</p>
          {done.status === 'pendente'
            ? <p className="muted small">O horário fica reservado para você. {p.name} responde até <b>{whenLabel(new Date(done.respondBy!))}</b> e você recebe a resposta pelo WhatsApp. <Sup>aprovação do prestador</Sup></p>
            : <p className="muted small">Novo horário confirmado. O prestador já foi avisado.</p>}
        </div>
        <section className="card">
          <p><b>{p.address}</b><br /><span className="muted">{p.area}</span></p>
          {done.status === 'confirmado' && <p>📞 Contato do prestador: <b>{p.phone}</b></p>}
          <p className="muted small">{done.status === 'pendente' ? 'O contato do prestador aparece quando ele aceitar.' : 'Você recebeu a confirmação pelo WhatsApp e por e-mail (veja em Mensagens).'} Pagamento no local: {p.payments.join(', ')}.</p>
          <div className="row gap wrap">
            <a className="btn ghost sm" href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`} target="_blank" rel="noreferrer">Ver rota</a>
            {done.status === 'confirmado' && <button className="btn ghost sm" onClick={() => downloadIcs(done, p, svc)}>Adicionar à agenda</button>}
          </div>
        </section>
        <div className="row gap pad">
          <button className="btn ghost" onClick={() => go(`/agendamento/${done.id}`)}>Ver detalhes</button>
          <button className="btn" onClick={() => go('/explorar')}>Voltar ao mapa</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flow">
      <TopBar title={title} onBack={step === 'horario' ? true : () => setStep('horario')} />
      <div className="flow-head">
        <div className="pcard-icon" style={{ background: p.color }}>{p.emoji}</div>
        <div><b>{svc.name}</b><div className="muted">{p.name} · {durLabel(svc.duration[size])} · {priceLabel(svc.price[size], svc.priceFrom)}</div></div>
      </div>
      {step !== 'horario' && holdId && (
        <div className={`hold${remaining < 60 ? ' warn' : ''}`}>
          {remaining > 0 ? <>Seguramos <b>{slot && whenLabel(slot.start)}</b> para você por {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} <Sup>RN-20</Sup></> : <>O tempo da reserva acabou. Se o horário ainda estiver livre, a confirmação segue normalmente.</>}
        </div>
      )}

      {step === 'horario' && (
        <>
          {alts && (
            <div className="notice warn">
              Esse horário acabou de ser ocupado. Os mais próximos:
              <div className="slot-row">{alts.map(a => <button key={a.getTime()} className="slot" onClick={() => { setDay(startOfDay(a)); setAlts(null); }}>{whenLabel(a)}</button>)}</div>
            </div>
          )}
          {original && <div className="notice">Remarcando {whenLabel(new Date(original.start))}. O horário atual só é liberado quando você confirmar o novo.{original.status === 'pendente' ? ' O pedido continua esperando a resposta do prestador, agora para o novo horário.' : ''}</div>}
          {pets.length > 1 && (
            <div className="petbar pad-x">
              <span className="muted">Pet:</span>
              {pets.map(x => <button key={x.id} className={`chip small${petId === x.id ? ' on' : ''}`} onClick={() => { setPetId(x.id); selectPet(x.id); setSlot(null); }}>{x.name} · {SIZE_SHORT[x.size]}</button>)}
            </div>
          )}
          {!pet && <p className="muted pad-x small">Duração e preço para porte médio. Ajustamos quando você informar o pet.</p>}
          {p.staff.length > 1 && (
            <div className="pad-x">
              <label className="inline">Profissional
                <select value={staffSel} onChange={e => { setStaffSel(e.target.value); setSlot(null); }}>
                  <option value="any">Qualquer profissional</option>
                  {p.staff.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </label>
            </div>
          )}
          <div className="days" role="listbox" aria-label="Dia">
            {days.map((d, i) => (
              <button key={d.toISOString()} role="option" aria-selected={sameDay(d, day)} disabled={counts[i] === 0}
                className={`day${sameDay(d, day) ? ' on' : ''}`} onClick={() => { setDay(d); setSlot(null); }}>
                <small>{i === 0 ? 'hoje' : wd(d)}</small><b>{d.getDate()}</b><small>{counts[i] ? `${counts[i]} livres` : '—'}</small>
              </button>
            ))}
            {daysShown < 30 && <button className="day more" onClick={() => setDaysShown(30)}>+ dias</button>}
          </div>
          <div className="pad-x">
            <h3 className="section-label">{dayMonth(day)}</h3>
            {slots.length === 0 && <p className="muted">{p.hours[day.getDay()] ? `Sem horário livre para ${svc.name.toLowerCase()} (${durLabel(svc.duration[size])}) neste dia.` : 'Fechado neste dia.'}</p>}
            {groups.filter(g => g[1].length).map(([label, list]) => (
              <div key={label} className="slot-group">
                <h4>{label}</h4>
                <div className="slot-grid">
                  {list.map(x => <button key={x.start.getTime()} className={`slot${slot?.start.getTime() === x.start.getTime() ? ' on' : ''}`} aria-pressed={slot?.start.getTime() === x.start.getTime()} onClick={() => setSlot(x)}>{hhmm(x.start)}</button>)}
                </div>
              </div>
            ))}
            <p className="muted small">Só aparecem horários que cabem inteiros na agenda, com pelo menos {p.minAdvanceMin / 60} h de antecedência. <Sup>RN-14</Sup></p>
          </div>
          <div className="bottom-cta">
            <button className="btn block" disabled={!slot} onClick={onContinue}>{slot ? `Continuar · ${whenLabel(slot.start)}` : 'Escolha um horário'}</button>
          </div>
        </>
      )}

      {step === 'login' && <div className="pad"><h2>Entre para confirmar</h2><Login onDone={() => advance('login')} /></div>}

      {step === 'pet' && <div className="pad"><h2>Qual pet vai ser atendido?</h2>
        <PetForm submitLabel="Continuar" onSave={pp => { const id = savePet(pp); setPetId(id); selectPet(id); setSlot(null); setStep('horario'); toast('Pet cadastrado. Confira o horário para o porte dele.'); }} /></div>}

      {step === 'resumo' && slot && pet && (
        <div className="pad">
          <h2>Confira e confirme</h2>
          <dl className="summary">
            <dt>Prestador</dt><dd>{p.name}<br /><span className="muted">{p.address}</span></dd>
            <dt>Serviço</dt><dd>{svc.name} · {durLabel(svc.duration[pet.size])}</dd>
            <dt>Profissional</dt><dd>{slot.staff}{staffSel === 'any' && p.staff.length > 1 ? ' (primeiro livre)' : ''}</dd>
            <dt>Pet</dt><dd>
              <select value={pet.id} onChange={e => { setPetId(e.target.value); selectPet(e.target.value); }} aria-label="Pet">
                {pets.map(x => <option key={x.id} value={x.id}>{x.name} · {SIZE_SHORT[x.size]}</option>)}
              </select>
              <button className="link sm" onClick={() => setStep('pet')}>+ outro pet</button>
            </dd>
            <dt>Quando</dt><dd><b>{whenLabel(slot.start)}</b></dd>
            <dt>Preço estimado</dt><dd>{priceLabel(svc.price[pet.size], svc.priceFrom)} <span className="muted">· pago no local</span></dd>
            <dt>Cancelamento</dt><dd>Sem custo até {p.cancelWindowH} h antes <Sup>RN-26</Sup></dd>
            {!rescheduleOf && <><dt>Confirmação</dt><dd>{p.name} aceita ou recusa em até {RESPOND_H} h <Sup>aprovação do prestador</Sup></dd></>}
          </dl>
          <label className="form"><span>Observações para o prestador <span className="muted">(opcional)</span></span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Ex.: tem medo de secador" />
          </label>
          <div className="bottom-cta"><button className="btn block" onClick={onConfirm}>{rescheduleOf ? 'Confirmar novo horário' : 'Enviar pedido'}</button></div>
        </div>
      )}
    </div>
  );
}

