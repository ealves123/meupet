import type { ServiceType, Size, Species, BookingStatus } from './types';

export const TYPE_LABEL: Record<ServiceType, string> = {
  banho_tosa: 'Banho e tosa',
  veterinario: 'Veterinário',
  petshop: 'Pet shop',
  adestramento: 'Adestramento',
  hotel: 'Hotel',
  creche: 'Creche',
};
export const TYPE_EMOJI: Record<ServiceType, string> = {
  banho_tosa: '🛁',
  veterinario: '🩺',
  petshop: '🦴',
  adestramento: '🎾',
  hotel: '🏨',
  creche: '🏡',
};
/** Tipos que funcionam no piloto. Hotel e creche (diárias) ficam para depois. [Suposição] */
export const PILOT_TYPES: ServiceType[] = ['banho_tosa', 'veterinario', 'petshop', 'adestramento'];
export const SOON_TYPES: ServiceType[] = ['hotel', 'creche'];

export const SIZE_LABEL: Record<Size, string> = {
  mini: 'Mini (até 3 kg)',
  pequeno: 'Pequeno (3 a 10 kg)',
  medio: 'Médio (10 a 25 kg)',
  grande: 'Grande (25 a 45 kg)',
  gigante: 'Gigante (45 kg+)',
};
export const SIZE_SHORT: Record<Size, string> = {
  mini: 'Mini', pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande', gigante: 'Gigante',
};
export const SIZES: Size[] = ['mini', 'pequeno', 'medio', 'grande', 'gigante'];
export const SPECIES_LABEL: Record<Species, string> = { cao: 'Cão', gato: 'Gato', outro: 'Outro' };

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pendente: 'Aguardando o prestador',
  recusado: 'Recusado pelo prestador',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  no_show: 'Falta',
  cancelado_tutor: 'Cancelado por você',
  cancelado_prestador: 'Cancelado pelo prestador',
};

export const brl = (v: number | null | undefined) =>
  v == null ? 'Valor no local' : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const onlyDigits = (v: string) => v.replace(/\D/g, '');
export function fmtPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
