import { useMemo, useState } from 'react';
import { useStore, setActingProvider, setBookingStatus, cancelByProvider, addBlock, removeBlock, addOfflineBooking, updateProvider, pauseProvider, priceLabel } from '../lib/store';
import { TopBar, Sheet, Sup, toast } from '../components/ui';
import { addDays, startOfDay, sameDay, wd, hhmm, dayMonth, wdLong, minToHHMM, hhmmToMin, atMinutes, addMin, toLocalInput } from '../lib/dates';
import { SIZES, SIZE_SHORT, STATUS_LABEL, brl, TYPE_LABEL } from '../lib/labels';
import { daySlots } from '../lib/slots';
import type { Size } from '../lib/types';
import { go } from '../lib/router';

type Tab = 'agenda' | 'servicos' | 'horarios' | 'indicadores';

export function ProviderPanel() {
  const s = useStore();
  const [tab, setTab] = useState<Tab>('agenda');
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
  return (
    <div className="provider">
      <TopBar title="Painel do prestador" onBack={() => go('/conta')} />
      <div className="pad-x acting">
        <label className="inline">Você está como
          <select value={p.id} onChange={e => setActingProvider(e.target.value)}>
            {s.providers.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
      </div>
      <div className="tabs" role="tablist">
        {(['agenda', 'servicos', 'horarios', 'indicadores'] as Tab[]).map(t => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {{ agenda: 'Agenda', servicos: 'Serviços', horarios: 'Horários', indicadores: 'Indicadores' }[t]}
          </button>
        ))}
      </div>
      {tab === 'agenda' && <Agenda />}
      {tab === 'servicos' && <Services />}
      {tab === 'horarios' && <Hours />}
      {tab === 'indicadores' && <Metrics />}
    </div>
  );
}

function Agenda() {
  const s = useStore();
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
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
  const msgs = s.messages.filter(m => m.to === 'prestador' && m.providerId === p.id).sort((a, b) => b.sendAt.localeCompare(a.sendAt)).slice(0, 3);
  const active = items.filter(i => i.kind === 'b' && i.b.status === 'confirmado').length;

  return (
    <div>
      {p.paused && <div className="notice warn">Agenda pausada até {dayMonth(new Date(p.paused.until + 'T12:00'))}. Você não aparece no mapa.</div>}
      {msgs.length > 0 && (
        <div className="pad-x">{msgs.map(m => <div key={m.id} className="msg whatsapp compact"><b>{m.title}</b><p>{m.body}</p></div>)}</div>
      )}
      <div className="days">
        {days.map(d => (
          <button key={d.toISOString()} className={`day${sameDay(d, day) ? ' on' : ''}`} onClick={() => setDay(d)}>
            <small>{sameDay(d, now) ? 'hoje' : wd(d)}</small><b>{d.getDate()}</b>
            <small>{s.bookings.filter(b => b.providerId === p.id && b.status === 'confirmado' && sameDay(new Date(b.start), d)).length || '—'}</small>
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
                  <b>{pet?.name ?? b.petName} · {svc.name}</b> <span className="muted">({SIZE_SHORT[b.size]})</span>
                  <div className="muted">{tutorName} · {b.staff} · {priceLabel(b.price, svc.priceFrom)}</div>
                  <div className="tags">
                    {b.origin === 'marketplace' ? <span className="badge mk">meuPet</span> : <span className="badge">agenda própria</span>}
                    {b.isNewClient && b.origin === 'marketplace' && <span className="badge new">cliente novo · 8% <Sup /></span>}
                    {b.presenceConfirmed && b.status === 'confirmado' && <span className="badge ok">presença confirmada</span>}
                    {b.status !== 'confirmado' && <span className={`status s-${b.status}`}>{STATUS_LABEL[b.status].replace('por você', 'pelo tutor')}</span>}
                  </div>
                  {b.notes && <p className="note">“{b.notes}”</p>}
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
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
  const [date, setDate] = useState(toLocalInput(day));
  const [time, setTime] = useState('12:00');
  const [end, setEnd] = useState('13:00');
  const [staff, setStaff] = useState<string>(p.staff[0]);
  const [svcId, setSvcId] = useState(p.services[0].id);
  const [size, setSize] = useState<Size>('medio');
  const [client, setClient] = useState('');
  const [petName, setPetName] = useState('');
  const [label, setLabel] = useState('Bloqueado');
  const d = new Date(date + 'T00:00');
  const svc = p.services.find(x => x.id === svcId)!;
  const free = kind === 'cliente' ? daySlots(s, p, svc, size, d, staff, new Date(0)) : [];
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
            {free.map(x => <option key={x.start.getTime()} value={hhmm(x.start)}>{hhmm(x.start)}–{hhmm(addMin(x.start, svc.duration[size]))}</option>)}
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
  const s = useStore();
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
  return (
    <div className="pad">
      <p className="muted small">Preço e duração por porte. O tutor vê o valor do porte do pet dele.</p>
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
  const s = useStore();
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
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
  const p = s.providers.find(x => x.id === s.actingProviderId)!;
  const now = new Date();
  const since = addDays(startOfDay(now), -30);
  const bs = s.bookings.filter(b => b.providerId === p.id && new Date(b.start) >= since && new Date(b.start) <= addDays(now, 30));
  const past = bs.filter(b => new Date(b.start) < now && ['concluido', 'no_show'].includes(b.status));
  const noShow = past.filter(b => b.status === 'no_show').length;
  const mk = bs.filter(b => b.origin === 'marketplace' && b.status !== 'cancelado_tutor' && b.status !== 'cancelado_prestador');
  const newMk = mk.filter(b => b.isNewClient);
  const revenueNew = newMk.reduce((a, b) => a + (b.price ?? 0), 0);
  const presence = bs.filter(b => b.status === 'confirmado' && new Date(b.start) > now);
  const tiles: [string, string, string?][] = [
    ['Agendamentos (±30 dias)', String(bs.filter(b => !b.status.startsWith('cancelado')).length)],
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
