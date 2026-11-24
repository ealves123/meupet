export interface LatLng { lat: number; lng: number }

/** Centro comercial de Alphaville, Barueri. Centro padrão do mapa. */
export const ALPHAVILLE: LatLng = { lat: -23.4992, lng: -46.8486 };
export const DEFAULT_RADIUS_KM = 3; // [Suposição] RN-02

export function distanceKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
export const kmLabel = (km: number) => `${km.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

/**
 * Lugares conhecidos para a busca do protótipo. Coordenadas aproximadas.
 * No produto, a busca por endereço usa um serviço de geocodificação; o CEP já é
 * resolvido pelas faixas de CEP_RANGES.
 */
export const PLACES: { name: string; hint: string; lat: number; lng: number }[] = [
  { name: 'Centro Comercial Alphaville', hint: 'Barueri', lat: -23.4992, lng: -46.8486 },
  { name: 'Alameda Rio Negro', hint: 'Alphaville, Barueri', lat: -23.4985, lng: -46.8497 },
  { name: 'Alphaville Industrial', hint: 'Barueri', lat: -23.5050, lng: -46.8570 },
  { name: 'Alphaville Residencial 1', hint: 'Barueri', lat: -23.4905, lng: -46.8560 },
  { name: 'Alphaville Residencial 2', hint: 'Barueri', lat: -23.4870, lng: -46.8490 },
  { name: 'Alphaville Residencial 3', hint: 'Santana de Parnaíba', lat: -23.4800, lng: -46.8560 },
  { name: 'Tamboré', hint: 'Barueri / Santana de Parnaíba', lat: -23.5010, lng: -46.8330 },
  { name: 'Tamboré 3', hint: 'Santana de Parnaíba', lat: -23.4930, lng: -46.8270 },
  { name: 'Aldeia da Serra', hint: 'Barueri / Santana de Parnaíba', lat: -23.4640, lng: -46.8790 },
  { name: 'Centro de Barueri', hint: 'Barueri', lat: -23.5110, lng: -46.8760 },
  // ABC
  { name: 'Centro de Santo André', hint: 'Santo André', lat: -23.6639, lng: -46.5383 },
  { name: 'Jardim', hint: 'Santo André', lat: -23.6560, lng: -46.5300 },
  { name: 'Vila Bastos', hint: 'Santo André', lat: -23.6545, lng: -46.5320 },
  { name: 'Campestre', hint: 'Santo André', lat: -23.6440, lng: -46.5360 },
  { name: 'Vila Assunção', hint: 'Santo André', lat: -23.6650, lng: -46.5230 },
  { name: 'Centro de São Bernardo', hint: 'São Bernardo do Campo', lat: -23.6914, lng: -46.5646 },
  { name: 'Rudge Ramos', hint: 'São Bernardo do Campo', lat: -23.6590, lng: -46.5700 },
  { name: 'Nova Petrópolis', hint: 'São Bernardo do Campo', lat: -23.7000, lng: -46.5540 },
  { name: 'Jardim do Mar', hint: 'São Bernardo do Campo', lat: -23.6950, lng: -46.5500 },
  { name: 'Baeta Neves', hint: 'São Bernardo do Campo', lat: -23.6800, lng: -46.5560 },
  { name: 'Centro de São Caetano', hint: 'São Caetano do Sul', lat: -23.6229, lng: -46.5548 },
  { name: 'Santa Paula', hint: 'São Caetano do Sul', lat: -23.6180, lng: -46.5660 },
  { name: 'Barcelona', hint: 'São Caetano do Sul', lat: -23.6300, lng: -46.5600 },
  { name: 'Santo Antônio', hint: 'São Caetano do Sul', lat: -23.6250, lng: -46.5700 },
];

/** Áreas atendidas [Suposição] RN-04: Alphaville e entorno, e o ABC (Santo André, São Bernardo e São Caetano). */
export const COVERAGE: { name: string; center: LatLng; radiusKm: number }[] = [
  { name: 'Alphaville e arredores', center: ALPHAVILLE, radiusKm: 6 },
  { name: 'ABC', center: { lat: -23.6650, lng: -46.5500 }, radiusKm: 9 },
];
export const inCoverage = (c: LatLng) => COVERAGE.some(a => distanceKm(c, a.center) <= a.radiusKm);

/**
 * Faixas de CEP dos Correios por cidade atendida. Sem serviço externo: o CEP
 * leva ao centro da cidade (ou do trecho, quando há subfaixa conhecida).
 * As subfaixas vêm antes da faixa da cidade. Coordenadas aproximadas.
 */
export const CEP_RANGES: { from: number; to: number; name: string; city: string; center: LatLng }[] = [
  { from: 6453000, to: 6474999, name: 'Alphaville', city: 'Barueri', center: ALPHAVILLE },
  { from: 6400001, to: 6499999, name: 'Barueri', city: 'Barueri', center: { lat: -23.5110, lng: -46.8760 } },
  { from: 6540000, to: 6549999, name: 'Alphaville e Tamboré', city: 'Santana de Parnaíba', center: { lat: -23.4850, lng: -46.8450 } },
  { from: 6500001, to: 6549999, name: 'Santana de Parnaíba', city: 'Santana de Parnaíba', center: { lat: -23.4440, lng: -46.9180 } },
  { from: 9000001, to: 9299999, name: 'Santo André', city: 'Santo André', center: { lat: -23.6639, lng: -46.5383 } },
  { from: 9500001, to: 9599999, name: 'São Caetano do Sul', city: 'São Caetano do Sul', center: { lat: -23.6229, lng: -46.5548 } },
  { from: 9600001, to: 9899999, name: 'São Bernardo do Campo', city: 'São Bernardo do Campo', center: { lat: -23.6914, lng: -46.5646 } },
];

/** Texto parece CEP? (1 a 8 dígitos, com ou sem hífen depois do quinto) */
export const looksLikeCep = (q: string) => /^\d{1,5}(-\d{0,3})?$/.test(q.trim());
export const fmtCep = (d: string) => (d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5, 8)}` : d);
export const cepOf = (n: number) => fmtCep(String(n).padStart(8, '0'));

/**
 * Autocompletar do CEP: faixas que ainda combinam com os primeiros números digitados.
 * "09" mostra Santo André, São Caetano e São Bernardo; "096" só São Bernardo.
 * Com o CEP completo, devolve só a faixa exata (subfaixa primeiro).
 */
export function cepSuggest(q: string) {
  const d = q.replace(/\D/g, '').slice(0, 8);
  if (!d) return [];
  if (d.length === 8) { const r = cepLookup(d); return r ? [r] : []; }
  const scale = 10 ** (8 - d.length);
  const lo = Number(d) * scale, hi = lo + scale - 1;
  return CEP_RANGES.filter(r => r.from <= hi && r.to >= lo);
}

/** CEP completo (8 dígitos) para a faixa conhecida, ou null se fora da área atendida. */
export function cepLookup(q: string) {
  const d = q.replace(/\D/g, '');
  if (d.length !== 8) return null;
  const n = Number(d);
  return CEP_RANGES.find(r => n >= r.from && n <= r.to) ?? null;
}

/** Comparação sem acentos e sem caixa, para a busca por nome ("sao bernardo"). */
export const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
