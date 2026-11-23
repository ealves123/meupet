import { useSyncExternalStore } from 'react';
import type { AppState, Booking, Message, Pet, Tutor, Size, Block, Review, Service, ServiceType, Provider } from './types';
import { buildSeed } from './seed';
import { addMin, hhmm, whenLabel, startOfDay, addDays } from './dates';
import { daySlots, fitsExtension, nearestFree } from './slots';
import { brl, onlyDigits } from './labels';

/**
 * Camada de dados do protótipo: guarda tudo no localStorage do aparelho.
 * Na fase 2 cada ação abaixo vira uma chamada ao Supabase (Postgres + PostGIS);
 * a confirmação (confirmBooking) vira uma função no banco que confere e grava
 * numa única transação, com restrição de exclusão para nunca haver dois
 * agendamentos no mesmo horário (RN-21).
 */
const KEY = 'meupet:v2';
const VERSION = 2;
let state: AppState = load();
const subs = new Set<() => void>();

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as AppState;
      if (s.version === VERSION) {
        // pets criados antes de existir ownerPhone ficam com o tutor que estava logado
        for (const p of s.pets) if (!p.ownerPhone && s.tutor) p.ownerPhone = onlyDigits(s.tutor.phone);
        return s;
      }
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
/** Pets ativos do tutor logado. Vários tutores podem usar o mesmo aparelho. */
export function myPets(s: AppState) {
  const me = s.tutor && onlyDigits(s.tutor.phone);
  return me ? s.pets.filter(p => !p.archived && p.ownerPhone === me) : [];
}
/** Mensagens do tutor logado: as dirigidas a ele ou aos agendamentos dele. */
export function tutorInbox(s: AppState) {
  const me = s.tutor && onlyDigits(s.tutor.phone);
  if (!me) return [];
  return s.messages.filter(m => m.to === 'tutor' &&
    onlyDigits(m.tutorPhone ?? s.bookings.find(b => b.id === m.bookingId)?.tutorPhone ?? '') === me);
}
export function loginTutor(t: Tutor) { set(s => { s.tutor = t; s.selectedPetId = myPets(s)[0]?.id ?? null; }); }
export function logout() { set(s => { s.tutor = null; s.selectedPetId = null; }); }
export function updateTutor(p: Partial<Tutor>) { set(s => { if (s.tutor) Object.assign(s.tutor, p); }); }
export function savePet(p: Omit<Pet, 'id'> & { id?: string }) {
  let id = p.id ?? uid('pet');
  set(s => {
    const ex = s.pets.find(x => x.id === p.id);
    if (ex) Object.assign(ex, p); else { s.pets.push({ ...p, id, ownerPhone: s.tutor ? onlyDigits(s.tutor.phone) : undefined }); }
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
    if (s.selectedPetId === id) s.selectedPetId = myPets(s)[0]?.id ?? null;
  });
}

/** Mensagem simulada de código de acesso (login por WhatsApp/SMS [Suposição] HU-16). */
export function sendLoginCode(phone: string) {
  const code = String(1000 + Math.floor(Math.random() * 9000));
  set(s => {
    s.messages.push({ id: uid('m'), channel: 'whatsapp', to: 'tutor', tutorPhone: onlyDigits(phone), kind: 'codigo', sendAt: new Date().toISOString(), title: 'Código de acesso', body: `Seu código do meuPet é ${code}. Não compartilhe com ninguém. (${phone})` });
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
/** Pedido novo: avisa o tutor que foi enviado e o prestador que precisa responder. */
function notifyRequest(s: AppState, b: Booking) {
  const p = s.providers.find(x => x.id === b.providerId)!;
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const start = new Date(b.start), until = new Date(b.respondBy!);
  const now = new Date().toISOString();
  s.messages.push({ id: uid('m'), to: 'tutor', bookingId: b.id, channel: 'whatsapp', kind: 'pedido', sendAt: now, title: 'Pedido enviado ⏳',
    body: `${svc.name} do ${pet?.name ?? 'seu pet'} no ${p.name}, ${whenLabel(start)}.\nO horário fica reservado para você. ${p.name} responde até ${whenLabel(until)}; se não responder, o pedido é cancelado e avisamos.`, actions: ['cancelar'] });
  s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: b.id, channel: 'whatsapp', kind: 'pedido', sendAt: now, title: 'Novo pedido pelo meuPet',
    body: `${s.tutor?.name ?? 'Tutor'} pediu ${svc.name} para ${pet?.name ?? 'o pet'} (${pet?.size ?? b.size}) ${whenLabel(start)} com ${b.staff}. Responda até ${whenLabel(until)}.` });
}
function scheduleReminders(s: AppState, b: Booking, rescheduled = false, accepted = false) {
  const p = s.providers.find(x => x.id === b.providerId)!;
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const start = new Date(b.start), now = new Date();
  const msgs: Message[] = [];
  const base = { bookingId: b.id, channel: 'whatsapp' as const, to: 'tutor' as const };
  msgs.push({ ...base, id: uid('m'), kind: rescheduled ? 'remarcacao' : 'confirmacao', sendAt: now.toISOString(), title: rescheduled ? 'Horário alterado ✅' : accepted ? `${p.name} aceitou seu pedido ✅` : 'Agendamento confirmado ✅',
    body: `${svc.name}${extrasLabel(b)} do ${pet?.name ?? 'seu pet'} no ${p.name}, ${whenLabel(start)}.\n${p.address}, ${p.area}. Contato: ${p.phone}.\nCancelamento sem custo até ${p.cancelWindowH} h antes. Pagamento no local.`, actions: ['remarcar', 'cancelar'] });
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
  if (accepted) return; // o prestador acabou de aceitar: não precisa ser avisado de novo
  s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: b.id, channel: 'whatsapp', kind: rescheduled ? 'remarcacao' : 'confirmacao', sendAt: now.toISOString(), title: rescheduled ? 'Agendamento remarcado pelo tutor' : 'Novo agendamento pelo meuPet',
    body: `${s.tutor?.name ?? 'Tutor'} ${rescheduled ? 'remarcou' : 'agendou'} ${svc.name} para ${pet?.name ?? 'o pet'} (${pet?.size ?? ''}) ${whenLabel(start)} com ${b.staff}.` });
}
const extrasLabel = (b: Booking) => (b.extras?.length ? ` + ${b.extras.map(x => x.name.toLowerCase()).join(' + ')}` : '');
/** Total do agendamento com os extras aceitos (null se algum valor é "no local"). */
export function bookingTotal(b: Booking): number | null {
  const all = [b.price, ...(b.extras ?? []).map(x => x.price)];
  return all.some(v => v == null) ? null : all.reduce<number>((a, v) => a + (v ?? 0), 0);
}
function dropPendingReminders(s: AppState, bookingId: string) {
  const now = Date.now();
  s.messages = s.messages.filter(m => !(m.bookingId === bookingId && m.to === 'tutor' && new Date(m.sendAt).getTime() > now));
}

// ---------- confirmar ----------
export type ConfirmResult = { ok: true; booking: Booking } | { ok: false; reason: 'ocupado' | 'limite' | 'login'; alternatives?: Date[] };

/** Prazo para o prestador responder um pedido [Suposição]. */
export const RESPOND_H = 4;
const respondDeadline = (start: Date, now: Date) => new Date(Math.min(now.getTime() + RESPOND_H * 3600_000, start.getTime() - 60 * 60_000));

/**
 * RN-19/21: recalcula a grade no momento do pedido. Idempotente pelo holdId.
 * O agendamento novo nasce "pendente" (ocupa o horário) até o prestador aceitar ou recusar.
 * Remarcação de um agendamento já aceito continua valendo na hora, sem nova aprovação [Suposição].
 */
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
    const fut = s.bookings.filter(b => b.tutorPhone === s.tutor!.phone && b.providerId === p.id && (b.status === 'confirmado' || b.status === 'pendente') && new Date(b.start) > now);
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
  // remarcação com extras aceitos: o tempo dos extras também precisa caber no novo horário
  const prev = input.rescheduleOf ? s.bookings.find(b => b.id === input.rescheduleOf) : undefined;
  const extraMin = (prev?.extras ?? []).reduce((a, x) => a + x.duration, 0);
  if (prev && extraMin && !fitsExtension(s, p, { ...prev, staff: free.staff, start: input.start.toISOString(), end: addMin(input.start, svc.duration[size]).toISOString() }, extraMin)) {
    return { ok: false, reason: 'ocupado', alternatives: [] };
  }
  const isNew = !s.bookings.some(b => b.providerId === p.id && b.tutorPhone === s.tutor!.phone && (b.status === 'confirmado' || b.status === 'concluido' || b.status === 'no_show'));
  let booking!: Booking;
  set(d => {
    d.holds = d.holds.filter(h => h.id !== input.holdId);
    if (input.rescheduleOf) {
      const old = d.bookings.find(b => b.id === input.rescheduleOf)!;
      old.start = input.start.toISOString();
      old.end = addMin(input.start, svc.duration[size] + extraMin).toISOString();
      old.staff = free.staff;
      old.reschedules += 1;
      old.presenceConfirmed = false;
      dropPendingReminders(d, old.id);
      expireProposals(d, old.id); // sugestões feitas para o horário antigo deixam de valer
      if (old.status === 'pendente') {
        // pedido ainda sem resposta: continua pendente, com novo prazo para o prestador
        old.respondBy = respondDeadline(input.start, now).toISOString();
        notifyRequest(d, old);
        booking = old;
        return;
      }
      scheduleReminders(d, old, true);
      d.messages = d.messages.filter(m => !(m.bookingId === old.id && m.kind === 'confirmacao' && m.to === 'tutor' && m.channel === 'email'));
      booking = old;
      return;
    }
    booking = {
      id: input.holdId ? `bk-${input.holdId}` : uid('bk'), providerId: p.id, serviceId: svc.id, staff: free.staff,
      start: input.start.toISOString(), end: addMin(input.start, svc.duration[size]).toISOString(), status: 'pendente',
      origin: 'marketplace', tutorPhone: d.tutor!.phone, petId: pet.id, size, price: svc.price[size], notes: input.notes,
      isNewClient: isNew, reschedules: 0, createdAt: now.toISOString(), respondBy: respondDeadline(input.start, now).toISOString(),
    };
    d.bookings.push(booking);
    notifyRequest(d, booking);
  });
  return { ok: true, booking };
}

export function cancelByTutor(id: string, reason: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === id); if (!b || (b.status !== 'confirmado' && b.status !== 'pendente')) return;
    const p = s.providers.find(x => x.id === b.providerId)!;
    const wasPending = b.status === 'pendente';
    b.status = 'cancelado_tutor'; b.cancelReason = reason;
    b.lateCancel = !wasPending && new Date(b.start).getTime() - Date.now() < p.cancelWindowH * 3600_000;
    dropPendingReminders(s, id);
    expireProposals(s, id);
    s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: id, channel: 'whatsapp', kind: 'cancel_tutor', sendAt: new Date().toISOString(), title: wasPending ? 'Pedido retirado pelo tutor' : 'Agendamento cancelado pelo tutor', body: `${whenLabel(new Date(b.start))}. Motivo: ${reason || 'não informado'}. O horário voltou para a agenda.` });
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

// ---------- prestador: cadastro e login ----------
/** Código de acesso do prestador (simulado: aparece na tela, como no login do tutor). */
export function sendProviderCode() { return String(1000 + Math.floor(Math.random() * 9000)); }
export const findProviderAccount = (phone: string) => state.providerAccounts.find(a => a.phone === onlyDigits(phone)) ?? null;
export function loginProvider(phone: string) {
  const acc = findProviderAccount(phone);
  if (!acc) return false;
  set(s => { s.providerSession = { providerId: acc.providerId, phone: acc.phone }; });
  return true;
}
export function logoutProvider() { set(s => { s.providerSession = null; }); }

export interface ProviderSignup {
  businessName: string; types: ServiceType[]; ownerName: string; phone: string; email: string;
  address: string; area: string; lat: number; lng: number; staff: string[]; description: string;
}
/**
 * Cadastro do negócio. Entra sem serviços: só aparece no mapa depois de cadastrar
 * ao menos um serviço ativo (RN-01). Aprovação manual pela equipe fica para a fase 2 [Suposição].
 */
export function registerProvider(i: ProviderSignup): { ok: true; providerId: string } | { ok: false; reason: 'telefone_em_uso' } {
  const phone = onlyDigits(i.phone);
  if (state.providerAccounts.some(a => a.phone === phone)) return { ok: false, reason: 'telefone_em_uso' };
  const slugBase = i.businessName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'prestador';
  const slug = state.providers.some(p => p.slug === slugBase) ? `${slugBase}-${Date.now().toString(36).slice(-4)}` : slugBase;
  const id = uid('p');
  const h = (o: number, c: number): [number, number] => [o * 60, c * 60];
  const main = i.types[0] ?? 'banho_tosa';
  const look: Record<ServiceType, [string, string]> = { banho_tosa: ['#0ea5e9', '🛁'], veterinario: ['#ef4444', '🩺'], petshop: ['#f59e0b', '🦴'], adestramento: ['#8b5cf6', '🎾'], hotel: ['#14b8a6', '🏨'], creche: ['#14b8a6', '🏡'] };
  const p: Provider = {
    id, slug, name: i.businessName.trim(), types: i.types.length ? i.types : ['banho_tosa'], lat: i.lat, lng: i.lng, address: i.address.trim(), area: i.area,
    phone: i.phone, description: i.description.trim(), hours: [null, h(8, 18), h(8, 18), h(8, 18), h(8, 18), h(8, 18), h(8, 14)],
    slotStep: 30, cleanupMin: 15, minAdvanceMin: 120, cancelWindowH: 2, staff: i.staff.length ? i.staff : [i.ownerName.split(' ')[0] || 'Equipe'],
    services: [], payments: ['Pix', 'Cartão de crédito', 'Cartão de débito'], paused: null, color: look[main][0], emoji: look[main][1],
  };
  set(s => {
    s.providers.push(p);
    s.providerAccounts.push({ phone, name: i.ownerName.trim(), email: i.email.trim(), providerId: id, createdAt: new Date().toISOString() });
    s.providerSession = { providerId: id, phone };
  });
  return { ok: true, providerId: id };
}
export function addService(providerId: string, i: { name: string; type: ServiceType }) {
  const same = <T,>(v: T): Record<Size, T> => ({ mini: v, pequeno: v, medio: v, grande: v, gigante: v });
  const svc: Service = { id: uid('s'), name: i.name.trim(), type: i.type, duration: same(60), price: same<number | null>(null), species: ['cao', 'gato'], active: true };
  set(s => { s.providers.find(x => x.id === providerId)?.services.push(svc); });
}

// ---------- prestador: pedidos ----------
function tutorFirstName(s: AppState) { return s.tutor?.name.split(' ')[0] ?? 'Tutor'; }

/** Aceitar um pedido pendente: vira "confirmado" e dispara confirmação e lembretes ao tutor. */
export function acceptBooking(id: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === id); if (!b || b.status !== 'pendente') return;
    b.status = 'confirmado'; b.respondBy = undefined;
    if (b.origin === 'marketplace' && b.tutorPhone) scheduleReminders(s, b, false, true);
  });
}

/** Recusar com motivo obrigatório. O horário volta para a agenda e o tutor recebe os 3 livres mais próximos. */
export function refuseBooking(id: string, reason: string, auto = false) {
  set(s => refuse(s, id, reason, auto));
}
function refuse(s: AppState, id: string, reason: string, auto: boolean) {
  const b = s.bookings.find(x => x.id === id); if (!b || b.status !== 'pendente') return;
  b.status = 'recusado'; b.refuseReason = reason; b.respondBy = undefined;
  dropPendingReminders(s, id);
  expireProposals(s, id);
  if (b.origin !== 'marketplace' || !b.tutorPhone) return;
  const p = s.providers.find(x => x.id === b.providerId)!;
  const svc = p.services.find(x => x.id === b.serviceId)!;
  const alts = nearestFree(s, p, svc, b.size, new Date(b.start));
  s.messages.push({ id: uid('m'), to: 'tutor', bookingId: id, channel: 'whatsapp', kind: 'recusa', sendAt: new Date().toISOString(),
    title: auto ? `${p.name} não respondeu a tempo` : `${p.name} não pôde aceitar seu pedido`,
    body: `${svc.name} ${whenLabel(new Date(b.start))}${auto ? '' : `. Motivo: ${reason}`}.\nHorários livres mais próximos: ${alts.map(a => whenLabel(a)).join('; ') || 'nenhum nos próximos dias'}.`, actions: ['remarcar'] });
}

/** Pedidos sem resposta no prazo são recusados automaticamente; propostas de agendamentos passados expiram. */
export function sweep() {
  const now = Date.now();
  const late = state.bookings.filter(b => b.status === 'pendente' && b.respondBy && new Date(b.respondBy).getTime() <= now);
  const stale = state.proposals.filter(x => x.status === 'pendente' && new Date(state.bookings.find(b => b.id === x.bookingId)?.start ?? 0).getTime() <= now);
  if (!late.length && !stale.length) return;
  set(s => {
    for (const b of late) refuse(s, b.id, 'Sem resposta do prestador no prazo', true);
    for (const x of stale) { const y = s.proposals.find(z => z.id === x.id); if (y) y.status = 'expirada'; }
  });
}

// ---------- prestador: proposta de serviço extra ----------
function expireProposals(s: AppState, bookingId: string) {
  for (const x of s.proposals) if (x.bookingId === bookingId && x.status === 'pendente') x.status = 'expirada';
}
/** Serviços que o prestador pode sugerir como extra para um agendamento (cabem logo depois, no mesmo profissional). */
export function extraOptions(s: AppState, b: Booking) {
  const p = s.providers.find(x => x.id === b.providerId)!;
  const pet = s.pets.find(x => x.id === b.petId);
  const taken = new Set([b.serviceId, ...(b.extras ?? []).map(x => x.serviceId), ...s.proposals.filter(x => x.bookingId === b.id && x.status === 'pendente').map(x => x.serviceId)]);
  return p.services
    .filter(x => x.active && !taken.has(x.id) && (!pet || x.species.includes(pet.species)))
    .map(svc => ({ svc, fits: fitsExtension(s, p, b, svc.duration[b.size]) }));
}
export type ProposeResult = { ok: true } | { ok: false; reason: 'nao_cabe' | 'invalido' };
export function proposeExtra(bookingId: string, serviceId: string, note: string): ProposeResult {
  const b = state.bookings.find(x => x.id === bookingId);
  if (!b || (b.status !== 'pendente' && b.status !== 'confirmado') || new Date(b.start) <= new Date() || b.origin !== 'marketplace') return { ok: false, reason: 'invalido' };
  const opt = extraOptions(state, b).find(x => x.svc.id === serviceId);
  if (!opt) return { ok: false, reason: 'invalido' };
  if (!opt.fits) return { ok: false, reason: 'nao_cabe' };
  const p = state.providers.find(x => x.id === b.providerId)!;
  const pet = state.pets.find(x => x.id === b.petId);
  const id = uid('x');
  set(s => {
    s.proposals.push({ id, bookingId, providerId: p.id, serviceId, name: opt.svc.name, price: opt.svc.price[b.size], duration: opt.svc.duration[b.size],
      note: note.trim(), status: 'pendente', createdAt: new Date().toISOString() });
    s.messages.push({ id: uid('m'), to: 'tutor', bookingId, proposalId: id, channel: 'whatsapp', kind: 'proposta', sendAt: new Date().toISOString(),
      title: `${p.name} sugeriu um extra`,
      body: `${opt.svc.name} para ${pet?.name ?? 'seu pet'} junto com o atendimento de ${whenLabel(new Date(b.start))}: +${priceLabel(opt.svc.price[b.size])}, +${opt.svc.duration[b.size]} min.${note.trim() ? `\n“${note.trim()}”` : ''}`,
      actions: ['aceitar_extra', 'recusar_extra'] });
  });
  return { ok: true };
}
export type ProposalAnswer = { ok: true } | { ok: false; reason: 'nao_cabe' | 'invalido' };
/** Tutor responde à proposta. Ao aceitar, o atendimento cresce no fim (se ainda couber na agenda). */
export function answerProposal(id: string, accept: boolean): ProposalAnswer {
  const x = state.proposals.find(y => y.id === id);
  const b = x && state.bookings.find(y => y.id === x.bookingId);
  if (!x || !b || x.status !== 'pendente' || (b.status !== 'pendente' && b.status !== 'confirmado')) return { ok: false, reason: 'invalido' };
  const p = state.providers.find(y => y.id === b.providerId)!;
  if (accept && !fitsExtension(state, p, b, x.duration)) {
    set(s => { s.proposals.find(y => y.id === id)!.status = 'expirada'; });
    return { ok: false, reason: 'nao_cabe' };
  }
  set(s => {
    const xx = s.proposals.find(y => y.id === id)!, bb = s.bookings.find(y => y.id === b.id)!;
    xx.status = accept ? 'aceita' : 'recusada'; xx.respondedAt = new Date().toISOString();
    if (accept) {
      bb.extras = [...(bb.extras ?? []), { proposalId: xx.id, serviceId: xx.serviceId, name: xx.name, price: xx.price, duration: xx.duration }];
      bb.end = addMin(new Date(bb.end), xx.duration).toISOString();
    }
    s.messages.push({ id: uid('m'), to: 'prestador', providerId: p.id, bookingId: b.id, proposalId: id, channel: 'whatsapp', kind: 'proposta_resposta', sendAt: new Date().toISOString(),
      title: accept ? `${tutorFirstName(s)} aceitou o extra ✅` : `${tutorFirstName(s)} recusou o extra`,
      body: `${xx.name} em ${whenLabel(new Date(bb.start))}.${accept ? ` O atendimento agora termina às ${hhmm(new Date(bb.end))}.` : ''}` });
  });
  return { ok: true };
}

// ---------- prestador: agenda ----------
export function setBookingStatus(id: string, status: 'concluido' | 'no_show') { set(s => { const b = s.bookings.find(x => x.id === id); if (b) b.status = status; }); }

/** RN-30: avisa o tutor com os 3 horários livres mais próximos. */
export function cancelByProvider(id: string, reason: string) {
  set(s => {
    const b = s.bookings.find(x => x.id === id); if (!b) return;
    b.status = 'cancelado_prestador'; b.cancelReason = reason;
    dropPendingReminders(s, id);
    expireProposals(s, id);
    if (b.origin === 'marketplace' && b.tutorPhone) {
      const p = s.providers.find(x => x.id === b.providerId)!;
      const svc = p.services.find(x => x.id === b.serviceId)!;
      const alts = nearestFree(s, p, svc, b.size, new Date(b.start));
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
    for (const b of state.bookings.filter(b => b.providerId === id && b.status === 'pendente' && new Date(b.start) < new Date(until + 'T23:59')))
      refuseBooking(b.id, 'Agenda pausada');
    for (const b of state.bookings.filter(b => b.providerId === id && b.status === 'confirmado' && new Date(b.start) > new Date() && new Date(b.start) < new Date(until + 'T23:59')))
      cancelByProvider(b.id, 'agenda pausada');
  }
}

export const priceLabel = (v: number | null, from?: boolean) => (v == null ? 'Valor no local' : `${from ? 'a partir de ' : ''}${brl(v)}`);

// Ao abrir o app, resolve pedidos que venceram enquanto ele estava fechado.
sweep();
