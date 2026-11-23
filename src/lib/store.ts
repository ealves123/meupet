import { useSyncExternalStore } from 'react';
import type { AppState, Booking, Message, Pet, Tutor, Size, Block, Review } from './types';
import { buildSeed } from './seed';
import { addMin, hhmm, whenLabel, startOfDay, addDays } from './dates';
import { daySlots } from './slots';
import { brl } from './labels';

/**
 * Camada de dados do protótipo: guarda tudo no localStorage do aparelho.
 * Na fase 2 cada ação abaixo vira uma chamada ao Supabase (Postgres + PostGIS);
 * a confirmação (confirmBooking) vira uma função no banco que confere e grava
 * numa única transação, com restrição de exclusão para nunca haver dois
 * agendamentos no mesmo horário (RN-21).
 */
const KEY = 'meupet:v1';
let state: AppState = load();
const subs = new Set<() => void>();

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === 1) return s;
    }
  } catch { /* sem storage: segue em memória */ }
  return buildSeed();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignora */ }
  subs.forEach(f => f());
}
function set(fn: (s: AppState) => AppState | void) {
  const draft: AppState = structuredClone(state);
  const res = fn(draft);
  state = res ?? draft;
  save();
}

export const getState = () => state;
export function useStore<T = AppState>(sel?: (s: AppState) => T): T {
  const snap = useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => state);
  return sel ? sel(snap) : (snap as unknown as T);
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function resetDemo() { state = buildSeed(); save(); }

// ---------- tutor ----------
export function loginTutor(t: Tutor) { set(s => { s.tutor = t; }); }
export function logout() { set(s => { s.tutor = null; }); }
export function updateTutor(p: Partial<Tutor>) { set(s => { if (s.tutor) Object.assign(s.tutor, p); }); }
export function savePet(p: Omit<Pet, 'id'> & { id?: string }) {
  let id = p.id ?? uid('pet');
  set(s => {
    const ex = s.pets.find(x => x.id === p.id);
    if (ex) Object.assign(ex, p); else { s.pets.push({ ...p, id }); }
    if (!s.selectedPetId) s.selectedPetId = id;
  });
  return id;
}
export function selectPet(id: string | null) { set(s => { s.selectedPetId = id; }); }
export function archivePet(id: string) {
  const now = new Date();
  set(s => {
    const p = s.pets.find(x => x.id === id); if (p) p.archived = true;
    for (const b of s.bookings) if (b.petId === id && b.status === 'confirmado' && new Date(b.start) > now) {
      b.status = 'cancelado_tutor'; b.cancelReason = 'Pet arquivado';
    }
    if (s.selectedPetId === id) s.selectedPetId = s.pets.find(x => !x.archived)?.id ?? null;
  });
}

/** Mensagem simulada de código de acesso (login por WhatsApp/SMS [Suposição] HU-16). */
export function sendLoginCode(phone: string) {
  const code = String(1000 + Math.floor(Math.random() * 9000));
  set(s => {
    s.messages.push({ id: uid('m'), channel: 'whatsapp', to: 'tutor', kind: 'codigo', sendAt: new Date().toISOString(), title: 'Código de acesso', body: `Seu código do meuPet é ${code}. Não compartilhe com ninguém. (${phone})` });
  });
  return code;
}

// ---------- reserva temporária ----------
export const HOLD_MIN = 5; // [Suposição] RN-20
export function createHold(providerId: string, staff: string, start: Date, end: Date) {
  const id = uid('h');
  set(s => {
    s.holds = s.holds.filter(h => new Date(h.expiresAt) > new Date());
    s.holds.push({ id, providerId, staff, start: start.toISOString(), end: end.toISOString(), expiresAt: addMin(new Date(), HOLD_MIN).toISOString() });
  });
  return id;
}
export function releaseHold(id: string | null) { if (id) set(s => { s.holds = s.holds.filter(h => h.id !== id); }); }

// ---------- lembretes (seção 7) ----------
/** RN-33: nada entre 22h e 7h. Joga o envio para 21h. */
function quiet(d: Date) {
  const h = d.getHours();
  if (h >= 22) return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 21, 0);
  if (h < 7) return new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 21, 0);
  return d;
}
function scheduleReminders(s: AppState, b: Booking, rescheduled = false) {
  const p = s.providers.find(x => x.id === b.providerId)!;
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const start = new Date(b.start), now = new Date();
  const msgs: Message[] = [];
  const base = { bookingId: b.id, channel: 'whatsapp' as const, to: 'tutor' as const };
  msgs.push({ ...base, id: uid('m'), kind: rescheduled ? 'remarcacao' : 'confirmacao', sendAt: now.toISOString(), title: rescheduled ? 'Horário alterado ✅' : 'Agendamento confirmado ✅',
    body: `${svc.name} do ${pet?.name ?? 'seu pet'} no ${p.name}, ${whenLabel(start)}.\n${p.address}, ${p.area}.\nCancelamento sem custo até ${p.cancelWindowH} h antes. Pagamento no local.`, actions: ['remarcar', 'cancelar'] });
  msgs.push({ ...base, id: uid('m'), channel: 'email', kind: 'confirmacao', sendAt: now.toISOString(), title: 'Comprovante do agendamento', body: `Cópia por e-mail com o arquivo .ics para a sua agenda.` });
  const h24 = quiet(addMin(start, -24 * 60));
  if (start.getTime() - now.getTime() >= 24 * 3600_000) // RN-34
    msgs.push({ ...base, id: uid('m'), kind: 'lembrete24', sendAt: h24.toISOString(), title: 'Lembrete de amanhã',
      body: `Amanhã às ${hhmm(start)}, ${svc.name.toLowerCase()} do ${pet?.name ?? 'seu pet'} no ${p.name}. Você confirma presença?`, actions: ['confirmar', 'remarcar', 'cancelar'] });
  if (start.getTime() - now.getTime() >= 2 * 3600_000)
    msgs.push({ ...base, id: uid('m'), kind: 'lembrete2', sendAt: quiet(addMin(start, -120)).toISOString(), title: 'Daqui a 2 horas',
      body: `Às ${hhmm(start)} no ${p.name}, ${p.address}.`, actions: ['ver', 'cancelar'] });
  msgs.push({ ...base, id: uid('m'), kind: 'avaliacao', sendAt: quiet(addMin(new Date(b.end), 120)).toISOString(), title: 'Como foi?',
    body: `Conte como foi o ${svc.name.toLowerCase()} do ${pet?.name ?? 'seu pet'} no ${p.name}.`, actions: ['avaliar'] });
  s.messages.push(...msgs);
  s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: b.id, channel: 'whatsapp', kind: rescheduled ? 'remarcacao' : 'confirmacao', sendAt: now.toISOString(), title: rescheduled ? 'Agendamento remarcado pelo tutor' : 'Novo agendamento pelo meuPet',
    body: `${s.tutor?.name ?? 'Tutor'} ${rescheduled ? 'remarcou' : 'agendou'} ${svc.name} para ${pet?.name ?? 'o pet'} (${pet?.size ?? ''}) ${whenLabel(start)} com ${b.staff}.` });
}
function dropPendingReminders(s: AppState, bookingId: string) {
  const now = Date.now();
  s.messages = s.messages.filter(m => !(m.bookingId === bookingId && m.to === 'tutor' && new Date(m.sendAt).getTime() > now));
}

// ---------- confirmar ----------
export type ConfirmResult = { ok: true; booking: Booking } | { ok: false; reason: 'ocupado' | 'limite' | 'login'; alternatives?: Date[] };

/** RN-19/21: recalcula a grade no momento da confirmação. Idempotente pelo holdId. */
export function confirmBooking(input: {
  providerId: string; serviceId: string; staff: string; staffChoice: string | 'any'; start: Date; petId: string; notes: string; holdId: string | null; rescheduleOf?: string;
}): ConfirmResult {
  const s = state;
  if (!s.tutor) return { ok: false, reason: 'login' };
  const dupe = s.bookings.find(b => b.id === `bk-${input.holdId}` && input.holdId);
  if (dupe) return { ok: true, booking: dupe };
  const p = s.providers.find(x => x.id === input.providerId)!;
  const svc = p.services.find(x => x.id === input.serviceId)!;
  const pet = s.pets.find(x => x.id === input.petId)!;
  const size: Size = pet.size;
  const now = new Date();
  // RN-25: limite de 3 agendamentos futuros com o mesmo prestador [Suposição]
  if (!input.rescheduleOf) {
    const fut = s.bookings.filter(b => b.tutorPhone === s.tutor!.phone && b.providerId === p.id && b.status === 'confirmado' && new Date(b.start) > now);
    if (fut.length >= 3) return { ok: false, reason: 'limite' };
  }
  const free = daySlots(s, p, svc, size, input.start, input.staffChoice, now, { ignoreBookingId: input.rescheduleOf, ignoreHoldId: input.holdId ?? undefined })
    .find(x => x.start.getTime() === input.start.getTime());
  if (!free) {
    const alts: Date[] = [];
    for (let d = 0; d < 14 && alts.length < 6; d++) alts.push(...daySlots(s, p, svc, size, addDays(startOfDay(input.start), d), input.staffChoice, now).map(x => x.start));
    alts.sort((a, b) => Math.abs(a.getTime() - input.start.getTime()) - Math.abs(b.getTime() - input.start.getTime()));
    return { ok: false, reason: 'ocupado', alternatives: alts.slice(0, 3) };
  }
  const isNew = !s.bookings.some(b => b.providerId === p.id && b.tutorPhone === s.tutor!.phone && b.status !== 'cancelado_tutor' && b.status !== 'cancelado_prestador');
  let booking!: Booking;
  set(d => {
    d.holds = d.holds.filter(h => h.id !== input.holdId);
    if (input.rescheduleOf) {
      const old = d.bookings.find(b => b.id === input.rescheduleOf)!;
      old.start = input.start.toISOString();
      old.end = addMin(input.start, svc.duration[size]).toISOString();
      old.staff = free.staff;
      old.reschedules += 1;
      old.presenceConfirmed = false;
      dropPendingReminders(d, old.id);
      scheduleReminders(d, old, true);
      d.messages = d.messages.filter(m => !(m.bookingId === old.id && m.kind === 'confirmacao' && m.to === 'tutor' && m.channel === 'email'));
      booking = old;
      return;
    }
    booking = {
      id: input.holdId ? `bk-${input.holdId}` : uid('bk'), providerId: p.id, serviceId: svc.id, staff: free.staff,
      start: input.start.toISOString(), end: addMin(input.start, svc.duration[size]).toISOString(), status: 'confirmado',
      origin: 'marketplace', tutorPhone: d.tutor!.phone, petId: pet.id, size, price: svc.price[size], notes: input.notes,
      isNewClient: isNew, reschedules: 0, createdAt: now.toISOString(),
    };
    d.bookings.push(booking);
    scheduleReminders(d, booking);
  });
  return { ok: true, booking };
}

export function cancelByTutor(id: string, reason: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === id); if (!b || b.status !== 'confirmado') return;
    const p = s.providers.find(x => x.id === b.providerId)!;
    b.status = 'cancelado_tutor'; b.cancelReason = reason;
    b.lateCancel = new Date(b.start).getTime() - Date.now() < p.cancelWindowH * 3600_000;
    dropPendingReminders(s, id);
    s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: id, channel: 'whatsapp', kind: 'cancel_tutor', sendAt: new Date().toISOString(), title: 'Agendamento cancelado pelo tutor', body: `${whenLabel(new Date(b.start))}. Motivo: ${reason || 'não informado'}. O horário voltou para a agenda.` });
  });
}
export function confirmPresence(id: string) { set(s => { const b = s.bookings.find(x => x.id === id); if (b) b.presenceConfirmed = true; }); }

export function addReview(bookingId: string, stars: number, text: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === bookingId)!;
    b.reviewed = true;
    const r: Review = { id: uid('r'), providerId: b.providerId, bookingId, author: s.tutor?.name.split(' ')[0] ?? 'Tutor', stars, text, date: new Date().toISOString() };
    s.reviews.push(r);
  });
}

// ---------- prestador ----------
export function setActingProvider(id: string) { set(s => { s.actingProviderId = id; }); }
export function setBookingStatus(id: string, status: 'concluido' | 'no_show') { set(s => { const b = s.bookings.find(x => x.id === id); if (b) b.status = status; }); }

/** RN-30: avisa o tutor com os 3 horários livres mais próximos. */
export function cancelByProvider(id: string, reason: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === id); if (!b) return;
    b.status = 'cancelado_prestador'; b.cancelReason = reason;
    dropPendingReminders(s, id);
    if (b.origin === 'marketplace' && b.tutorPhone) {
      const p = s.providers.find(x => x.id === b.providerId)!;
      const svc = p.services.find(x => x.id === b.serviceId)!;
      const alts: Date[] = [];
      for (let d = 0; d < 14 && alts.length < 3; d++) alts.push(...daySlots(s, p, svc, b.size, addDays(startOfDay(new Date(b.start)), d), 'any').map(x => x.start).slice(0, 3 - alts.length));
      s.messages.push({ id: uid('m'), to: 'tutor', bookingId: id, channel: 'whatsapp', kind: 'cancel_prestador', sendAt: new Date().toISOString(), title: `${p.name} cancelou seu horário`,
        body: `O horário de ${whenLabel(new Date(b.start))} foi cancelado${reason ? ` (${reason})` : ''}. Horários livres mais próximos: ${alts.map(a => whenLabel(a)).join('; ') || 'nenhum nos próximos dias'}.`, actions: ['remarcar'] });
    }
  });
}
export function addBlock(b: Omit<Block, 'id'>) { set(s => { s.blocks.push({ ...b, id: uid('k') }); }); }
export function removeBlock(id: string) { set(s => { s.blocks = s.blocks.filter(x => x.id !== id); }); }
/** Cliente de fora do app (WhatsApp, balcão): ocupa a agenda para ela continuar real. */
export function addOfflineBooking(i: { providerId: string; serviceId: string; staff: string; start: Date; size: Size; clientName: string; petName: string }) {
  set(s => {
    const p = s.providers.find(x => x.id === i.providerId)!;
    const svc = p.services.find(x => x.id === i.serviceId)!;
    s.bookings.push({ id: uid('bk'), providerId: p.id, serviceId: svc.id, staff: i.staff, start: i.start.toISOString(), end: addMin(i.start, svc.duration[i.size]).toISOString(),
      status: 'confirmado', origin: 'agenda_prestador', clientName: i.clientName, petName: i.petName, size: i.size, price: svc.price[i.size], isNewClient: false, reschedules: 0, createdAt: new Date().toISOString() });
  });
}
export function updateProvider(id: string, fn: (p: AppState['providers'][number]) => void) {
  set(s => { const p = s.providers.find(x => x.id === id); if (p) fn(p); });
}
export function pauseProvider(id: string, until: string | null) {
  set(s => {
    const p = s.providers.find(x => x.id === id)!;
    p.paused = until ? { until } : null;
  });
  if (until) {
    // agendamentos futuros viram cancelamento pelo prestador (seção 6, casos de borda)
    for (const b of state.bookings.filter(b => b.providerId === id && b.status === 'confirmado' && new Date(b.start) > new Date() && new Date(b.start) < new Date(until + 'T23:59')))
      cancelByProvider(b.id, 'agenda pausada');
  }
}

export const priceLabel = (v: number | null, from?: boolean) => (v == null ? 'Valor no local' : `${from ? 'a partir de ' : ''}${brl(v)}`);
