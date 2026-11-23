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
 * No produto, a busca por endereço e CEP usa um serviço de geocodificação.
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
];

/** Cobertura do piloto [Suposição] RN-04: Alphaville e entorno imediato. */
export const PILOT_AREA_CENTER = ALPHAVILLE;
export const PILOT_AREA_RADIUS_KM = 6;
