export const DAY_MS = 86_400_000;
const WD = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const WD_LONG = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// O protótipo usa o fuso do aparelho, que no piloto é America/Sao_Paulo.
// No back, todos os horários são gravados com fuso (timestamptz).
export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, d.getHours(), d.getMinutes());
export const addMin = (d: Date, n: number) => new Date(d.getTime() + n * 60_000);
export const atMinutes = (day: Date, min: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(min / 60), min % 60);
export const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export const minutesOfDay = (d: Date) => d.getHours() * 60 + d.getMinutes();

export const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
export const minToHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const hhmmToMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
export const wd = (d: Date) => WD[d.getDay()];
export const wdLong = (i: number) => WD_LONG[i];
export const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

export function relDay(d: Date, now = new Date()) {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY_MS);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'amanhã';
  return `${wd(d)}, ${dayMonth(d)}`;
}
export const whenLabel = (d: Date, now = new Date()) => `${relDay(d, now)} às ${hhmm(d)}`;

export function durLabel(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

export function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
