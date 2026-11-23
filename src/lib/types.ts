export type ServiceType = 'banho_tosa' | 'veterinario' | 'petshop' | 'adestramento' | 'hotel' | 'creche';
export type Size = 'mini' | 'pequeno' | 'medio' | 'grande' | 'gigante';
export type Species = 'cao' | 'gato' | 'outro';

export interface Service {
  id: string;
  name: string;
  type: ServiceType;
  /** duração em minutos por porte */
  duration: Record<Size, number>;
  /** preço em reais por porte; null = valor no local */
  price: Record<Size, number | null>;
  priceFrom?: boolean;
  species: Species[];
  active: boolean;
}

/** [abre, fecha] em minutos desde 0h, ou null = fechado. Índice 0 = domingo. */
export type WeekHours = ([number, number] | null)[];

export interface Provider {
  id: string;
  slug: string;
  name: string;
  types: ServiceType[];
  lat: number;
  lng: number;
  address: string;
  area: string;
  phone: string;
  description: string;
  hours: WeekHours;
  slotStep: 15 | 30;
  cleanupMin: number;
  minAdvanceMin: number;
  cancelWindowH: number;
  staff: string[];
  services: Service[];
  payments: string[];
  paused?: { until: string } | null;
  color: string;
  emoji: string;
}

/** O agendamento nasce "pendente" e o prestador aceita (confirmado) ou recusa (recusado). */
export type BookingStatus = 'pendente' | 'confirmado' | 'recusado' | 'concluido' | 'no_show' | 'cancelado_tutor' | 'cancelado_prestador';

/** Serviço extra que o tutor aceitou junto com o principal (ex.: hidratação com o banho). */
export interface Extra {
  proposalId: string;
  serviceId: string;
  name: string;
  price: number | null;
  duration: number;
}

/** Proposta de serviço extra feita pelo prestador para um agendamento. */
export interface Proposal {
  id: string;
  bookingId: string;
  providerId: string;
  serviceId: string;
  name: string;
  price: number | null;
  duration: number;
  note: string;
  status: 'pendente' | 'aceita' | 'recusada' | 'expirada';
  createdAt: string;
  respondedAt?: string;
}

/** Conta de acesso ao painel. Na fase 2 vira membros_prestador + auth.users. */
export interface ProviderAccount {
  /** só dígitos, com DDD */
  phone: string;
  name: string;
  email: string;
  providerId: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  providerId: string;
  serviceId: string;
  staff: string;
  start: string; // ISO
  end: string; // ISO
  status: BookingStatus;
  origin: 'marketplace' | 'agenda_prestador';
  /** tutor do app (marketplace) */
  tutorPhone?: string;
  petId?: string;
  /** cliente lançado pelo prestador (fora do app) */
  clientName?: string;
  petName?: string;
  size: Size;
  price: number | null;
  notes?: string;
  isNewClient: boolean;
  reschedules: number;
  lateCancel?: boolean;
  cancelReason?: string;
  /** motivo da recusa pelo prestador (obrigatório) */
  refuseReason?: string;
  /** prazo para o prestador responder um pedido pendente */
  respondBy?: string;
  extras?: Extra[];
  presenceConfirmed?: boolean;
  reviewed?: boolean;
  createdAt: string;
}

export interface Block {
  id: string;
  providerId: string;
  staff: string | null; // null = todos
  start: string;
  end: string;
  label: string;
}

export interface Hold {
  id: string;
  providerId: string;
  staff: string;
  start: string;
  end: string;
  expiresAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: Species;
  size: Size;
  breed?: string;
  archived?: boolean;
}

export interface Tutor {
  name: string;
  phone: string;
  email: string;
  consentWhatsapp: boolean;
  channels: { whatsapp: boolean; email: boolean };
}

export interface Review {
  id: string;
  providerId: string;
  bookingId?: string;
  author: string;
  stars: number;
  text: string;
  date: string;
  reply?: string;
}

export interface Message {
  id: string;
  bookingId?: string;
  channel: 'whatsapp' | 'email';
  sendAt: string;
  title: string;
  body: string;
  actions?: ('confirmar' | 'remarcar' | 'cancelar' | 'avaliar' | 'ver' | 'aceitar_extra' | 'recusar_extra')[];
  kind: 'codigo' | 'confirmacao' | 'lembrete24' | 'lembrete2' | 'avaliacao' | 'cancel_prestador' | 'cancel_tutor' | 'remarcacao'
    | 'pedido' | 'recusa' | 'proposta' | 'proposta_resposta';
  proposalId?: string;
  /** mensagens para o prestador ficam fora da caixa do tutor */
  to: 'tutor' | 'prestador';
  providerId?: string;
}

export interface AppState {
  version: number;
  seededAt: string;
  providers: Provider[];
  bookings: Booking[];
  blocks: Block[];
  holds: Hold[];
  reviews: Review[];
  messages: Message[];
  proposals: Proposal[];
  tutor: Tutor | null;
  pets: Pet[];
  selectedPetId: string | null;
  providerAccounts: ProviderAccount[];
  /** prestador logado no painel (mesmo aparelho do tutor no protótipo) */
  providerSession: { providerId: string; phone: string } | null;
}
