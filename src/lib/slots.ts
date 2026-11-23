import type { AppState, Provider, Service, Size } from './types';
import { atMinutes, addMin, addDays, startOfDay } from './dates';

export interface Slot { start: Date; staff: string }

/** Status que ocupam a agenda. */
const ACTIVE = new Set(['confirmado', 'concluido', 'no_show']);

/**
 * Horários reais de um dia (RN-13, RN-14, RN-16):
 * funcionamento − agendamentos − bloqueios − reservas temporárias de outros,
 * respeitando duração do serviço para o porte + intervalo de limpeza + antecedência mínima.
 * staffSel = 'any' devolve a união de todos os profissionais (HU-13).
 */
export function daySlots(
  s: AppState, p: Provider, svc: Service, size: Size, day: Date, staffSel: string | 'any', now = new Date(),
  opts: { ignoreBookingId?: string; ignoreHoldId?: string } = {},
): Slot[] {
  if (p.paused) return [];
  const hours = p.hours[day.getDay()];
  if (!hours) return [];
  const [open, close] = hours;
  const dur = svc.duration[size];
  const total = dur + p.cleanupMin;
  const staffList = staffSel === 'any' ? p.staff : [staffSel];
  const earliest = addMin(now, p.minAdvanceMin).getTime();
  const dayStart = startOfDay(day).getTime(), dayEnd = addDays(startOfDay(day), 1).getTime();

  const busy: Record<string, [number, number][]> = {};
  for (const st of staffList) busy[st] = [];
  for (const b of s.bookings) {
    if (b.providerId !== p.id || !ACTIVE.has(b.status) || b.id === opts.ignoreBookingId) continue;
    const a = new Date(b.start).getTime(), e = new Date(b.end).getTime() + p.cleanupMin * 60_000;
    if (e < dayStart || a > dayEnd) continue;
    busy[b.staff]?.push([a, e]);
  }
  for (const k of s.blocks) {
    if (k.providerId !== p.id) continue;
    const a = new Date(k.start).getTime(), e = new Date(k.end).getTime();
    if (e < dayStart || a > dayEnd) continue;
    for (const st of staffList) if (k.staff == null || k.staff === st) busy[st].push([a, e]);
  }
  for (const h of s.holds) {
    if (h.providerId !== p.id || h.id === opts.ignoreHoldId || new Date(h.expiresAt).getTime() < Date.now()) continue;
    busy[h.staff]?.push([new Date(h.start).getTime(), new Date(h.end).getTime() + p.cleanupMin * 60_000]);
  }

  const out: Slot[] = [];
  for (let m = open; m + dur <= close; m += p.slotStep) {
    const st = atMinutes(day, m);
    const a = st.getTime(), e = a + total * 60_000;
    if (a < earliest) continue;
    const free = staffList.find(x => !busy[x].some(([ba, be]) => a < be && e > ba));
    if (free) out.push({ start: st, staff: free });
  }
  return out;
}

export function nextSlots(s: AppState, p: Provider, svc: Service, size: Size, n = 3, days = 14, now = new Date()): Slot[] {
  const out: Slot[] = [];
  const today = startOfDay(now);
  for (let d = 0; d < days && out.length < n; d++) {
    out.push(...daySlots(s, p, svc, size, addDays(today, d), 'any', now).slice(0, n - out.length));
  }
  return out;
}

export const sizeForSvc = (svc: Service, size: Size) => svc.duration[size];

/** Serviço "principal" do prestador para o filtro de tipo. */
export function mainService(p: Provider, types: string[], species?: string) {
  const act = p.services.filter(x => x.active && (!species || x.species.includes(species as never)));
  return act.find(x => types.length === 0 || types.includes(x.type)) ?? null;
}
