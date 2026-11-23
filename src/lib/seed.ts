import type { AppState, Provider, Service, ServiceType, Size, Booking, Review, WeekHours, Block } from './types';
import { addDays, atMinutes, addMin, startOfDay } from './dates';
import { daySlots } from './slots';

// Todos os prestadores abaixo são FICTÍCIOS, criados só para demonstrar o fluxo.

const H = (o: string, c: string): [number, number] => {
  const t = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + (m || 0); };
  return [t(o), t(c)];
};
const comercial = (sab: [number, number] | null = H('08:00', '14:00')): WeekHours =>
  [null, H('08:00', '18:00'), H('08:00', '18:00'), H('08:00', '18:00'), H('08:00', '18:00'), H('08:00', '18:00'), sab];

const by = (mini: number, peq: number, med: number, gra: number, gig: number): Record<Size, number> =>
  ({ mini, pequeno: peq, medio: med, grande: gra, gigante: gig });
const same = (v: number): Record<Size, number> => by(v, v, v, v, v);
const nullP = (): Record<Size, number | null> => ({ mini: null, pequeno: null, medio: null, grande: null, gigante: null });

let sid = 0;
const svc = (type: ServiceType, name: string, duration: Record<Size, number>, price: Record<Size, number | null>, extra: Partial<Service> = {}): Service =>
  ({ id: `s${++sid}`, type, name, duration, price, species: ['cao', 'gato'], active: true, ...extra });

const banho = (base: number) => svc('banho_tosa', 'Banho', by(45, 60, 75, 90, 120), by(base, base + 10, base + 25, base + 45, base + 70));
const banhoTosa = (base: number) => svc('banho_tosa', 'Banho e tosa', by(75, 90, 105, 120, 150), by(base, base + 15, base + 35, base + 60, base + 90));
const tosaHig = (p: number) => svc('banho_tosa', 'Tosa higiênica', same(30), same(p));
const consulta = (p: number) => svc('veterinario', 'Consulta clínica', same(30), same(p), { species: ['cao', 'gato', 'outro'] });
const vacina = (p: number) => svc('veterinario', 'Vacinação', same(15), same(p), { priceFrom: true, species: ['cao', 'gato'] });
const retorno = () => svc('veterinario', 'Retorno de consulta', same(15), same(0));
const exame = () => svc('veterinario', 'Exames de sangue (coleta)', same(15), nullP(), { priceFrom: true, species: ['cao', 'gato'] });
const adest = (p: number) => svc('adestramento', 'Aula de adestramento', same(60), same(p), { species: ['cao'] });
const avalComp = (p: number) => svc('adestramento', 'Avaliação comportamental', same(45), same(p), { species: ['cao'] });
const unhas = (p: number) => svc('petshop', 'Corte de unhas', same(15), same(p));
const hidrat = (p: number) => svc('petshop', 'Hidratação de pelos', same(30), by(p, p, p + 10, p + 20, p + 30));

const base = { slotStep: 30 as const, cleanupMin: 15, minAdvanceMin: 120, cancelWindowH: 2, payments: ['Pix', 'Cartão de crédito', 'Cartão de débito'], paused: null };

export const SEED_PROVIDERS: Provider[] = [
  { ...base, id: 'p1', slug: 'bicho-cheiroso-rio-negro', name: 'Bicho Cheiroso', types: ['banho_tosa', 'petshop'], lat: -23.4979, lng: -46.8501, address: 'Alameda Rio Negro, 1030 – loja 12', area: 'Alphaville, Barueri', phone: '(11) 4191-0001', description: 'Banho e tosa com secagem silenciosa e espaço separado para gatos.', hours: comercial(), staff: ['Carla', 'Joana'], services: [banho(65), banhoTosa(95), tosaHig(40), hidrat(35), unhas(20)], color: '#0ea5e9', emoji: '🛁' },
  { ...base, id: 'p2', slug: 'clinica-vet-alpha-care', name: 'Clínica Vet Alpha Care', types: ['veterinario'], lat: -23.5013, lng: -46.8462, address: 'Alameda Araguaia, 750', area: 'Alphaville, Barueri', phone: '(11) 4191-0002', description: 'Clínica geral, vacinas e exames. Atende cães, gatos e pets não convencionais.', hours: [H('09:00', '13:00'), H('08:00', '20:00'), H('08:00', '20:00'), H('08:00', '20:00'), H('08:00', '20:00'), H('08:00', '20:00'), H('08:00', '16:00')], staff: ['Dra. Paula', 'Dr. Renato'], services: [consulta(220), vacina(110), retorno(), exame()], cancelWindowH: 12, slotStep: 15, cleanupMin: 0, color: '#ef4444', emoji: '🩺' },
  { ...base, id: 'p3', slug: 'tosa-da-vila', name: 'Tosa da Vila', types: ['banho_tosa'], lat: -23.4931, lng: -46.8546, address: 'Av. Copacabana, 112', area: 'Alphaville, Barueri', phone: '(11) 4191-0003', description: 'Especialista em tosa na tesoura e raças de pelo longo.', hours: comercial(H('08:00', '16:00')), staff: ['Marcos'], services: [banho(70), banhoTosa(110), tosaHig(45)], color: '#0ea5e9', emoji: '🛁' },
  { ...base, id: 'p4', slug: 'patas-e-cia-tambore', name: 'Patas & Cia', types: ['petshop', 'banho_tosa'], lat: -23.5002, lng: -46.8365, address: 'Av. Marcos Penteado de Ulhôa Rodrigues, 939', area: 'Tamboré, Barueri', phone: '(11) 4191-0004', description: 'Pet shop completo com banho e tosa e entrega de ração.', hours: [H('09:00', '14:00'), H('09:00', '19:00'), H('09:00', '19:00'), H('09:00', '19:00'), H('09:00', '19:00'), H('09:00', '19:00'), H('09:00', '17:00')], staff: ['Bia', 'Rafa', 'Lu'], services: [banho(60), banhoTosa(90), unhas(15), hidrat(30)], color: '#f59e0b', emoji: '🦴' },
  { ...base, id: 'p5', slug: 'adestra-alpha', name: 'AdestrAlpha', types: ['adestramento'], lat: -23.4888, lng: -46.8478, address: 'Calçada das Margaridas, 163', area: 'Alphaville, Barueri', phone: '(11) 4191-0005', description: 'Adestramento positivo, filhotes e correção de comportamento.', hours: [null, H('07:00', '12:00'), H('07:00', '12:00'), H('07:00', '12:00'), H('07:00', '12:00'), H('07:00', '12:00'), H('08:00', '12:00')], staff: ['Tiago'], services: [adest(180), avalComp(150)], slotStep: 30, cleanupMin: 30, cancelWindowH: 24, color: '#8b5cf6', emoji: '🎾' },
  { ...base, id: 'p6', slug: 'vet-24-tambore', name: 'Hospital Vet Tamboré', types: ['veterinario'], lat: -23.4985, lng: -46.8302, address: 'Al. Rio Negro, 3600 (Tamboré)', area: 'Tamboré, Santana de Parnaíba', phone: '(11) 4191-0006', description: 'Consultas com hora marcada, vacinas e coleta de exames.', hours: [H('08:00', '20:00'), H('07:00', '21:00'), H('07:00', '21:00'), H('07:00', '21:00'), H('07:00', '21:00'), H('07:00', '21:00'), H('08:00', '20:00')], staff: ['Dra. Helena', 'Dr. Caio', 'Dra. Sofia'], services: [consulta(260), vacina(120), retorno(), exame()], slotStep: 15, cleanupMin: 0, cancelWindowH: 12, color: '#ef4444', emoji: '🩺' },
  { ...base, id: 'p7', slug: 'banho-express-industrial', name: 'Banho Express', types: ['banho_tosa'], lat: -23.5057, lng: -46.8566, address: 'Av. Tamboré, 1400', area: 'Alphaville Industrial, Barueri', phone: '(11) 4191-0007', description: 'Banho rápido para quem tem pressa. Atende até 20h.', hours: [null, H('10:00', '20:00'), H('10:00', '20:00'), H('10:00', '20:00'), H('10:00', '20:00'), H('10:00', '20:00'), H('09:00', '15:00')], staff: ['Edu', 'Nina'], services: [banho(55), tosaHig(35)], color: '#0ea5e9', emoji: '🛁' },
  { ...base, id: 'p8', slug: 'gatil-zen', name: 'Gatil Zen', types: ['banho_tosa', 'veterinario'], lat: -23.4952, lng: -46.8433, address: 'Alameda Grajaú, 98', area: 'Alphaville, Barueri', phone: '(11) 4191-0008', description: 'Só gatos: ambiente sem cães, banho e consulta felina.', hours: comercial(null), staff: ['Dra. Lia'], services: [svc('banho_tosa', 'Banho felino', same(60), same(90), { species: ['gato'] }), svc('veterinario', 'Consulta felina', same(40), same(240), { species: ['gato'] })], color: '#ec4899', emoji: '🐈' },
  { ...base, id: 'p9', slug: 'mundo-pet-aldeia', name: 'Mundo Pet Aldeia', types: ['petshop', 'banho_tosa'], lat: -23.4672, lng: -46.8771, address: 'Estr. da Aldeia, 2100', area: 'Aldeia da Serra, Barueri', phone: '(11) 4191-0009', description: 'Pet shop de bairro na Aldeia da Serra.', hours: comercial(), staff: ['Gil'], services: [banho(55), banhoTosa(85), unhas(15)], color: '#f59e0b', emoji: '🦴' },
  { ...base, id: 'p10', slug: 'faro-fino-adestramento', name: 'Faro Fino', types: ['adestramento'], lat: -23.5038, lng: -46.8400, address: 'Calçada dos Cravos, 40', area: 'Alphaville, Barueri', phone: '(11) 4191-0010', description: 'Aulas individuais e socialização de filhotes.', hours: [null, null, H('15:00', '20:00'), H('15:00', '20:00'), H('15:00', '20:00'), H('15:00', '20:00'), H('09:00', '13:00')], staff: ['Ana'], services: [adest(160), avalComp(120)], cleanupMin: 30, cancelWindowH: 24, color: '#8b5cf6', emoji: '🎾' },
  { ...base, id: 'p11', slug: 'pet-center-barueri', name: 'Pet Center Barueri', types: ['petshop', 'veterinario'], lat: -23.5115, lng: -46.8752, address: 'R. Campos Sales, 300', area: 'Centro, Barueri', phone: '(11) 4191-0011', description: 'Pet shop com consultório veterinário.', hours: comercial(), staff: ['Dr. Felipe'], services: [consulta(180), vacina(95), unhas(15)], slotStep: 15, cleanupMin: 0, color: '#f59e0b', emoji: '🦴' },
  { ...base, id: 'p12', slug: 'spa-canino-alpha', name: 'Spa Canino Alpha', types: ['banho_tosa'], lat: -23.4961, lng: -46.8575, address: 'Av. Andrômeda, 885', area: 'Alphaville, Barueri', phone: '(11) 4191-0012', description: 'Banho com ozônio, hidratação e tosa da raça.', hours: comercial(H('08:00', '16:00')), staff: ['Vivi', 'Duda'], services: [banho(85), banhoTosa(130), tosaHig(50), hidrat(45)], color: '#0ea5e9', emoji: '🛁', paused: null },
];

/** PRNG determinístico, para a agenda de exemplo ser sempre parecida. */
function rng(seed: number) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
}

const CLIENTS = [['Fernanda', 'Thor'], ['Ricardo', 'Mel'], ['Juliana', 'Bob'], ['Paulo', 'Luna'], ['Camila', 'Pipoca'], ['André', 'Nina'], ['Beatriz', 'Max'], ['Gustavo', 'Amora'], ['Larissa', 'Fred'], ['Marina', 'Belinha'], ['Rodrigo', 'Simba'], ['Tatiane', 'Chico']];
const REVIEW_TEXTS = ['Atendimento ótimo, meu cachorro voltou tranquilo.', 'Pontuais e cuidadosos. Recomendo.', 'Gostei muito, preço justo.', 'Equipe atenciosa, explicaram tudo.', 'Bom, mas atrasou uns 15 minutos.', 'Melhor da região, sempre volto.', 'Ambiente limpo e organizado.', ''];

export function buildSeed(now = new Date()): AppState {
  const r = rng(42);
  const providers: Provider[] = JSON.parse(JSON.stringify(SEED_PROVIDERS));
  const state: AppState = {
    version: 1, seededAt: now.toISOString(), providers, bookings: [], blocks: [], holds: [], reviews: [], messages: [],
    tutor: null, pets: [], selectedPetId: null, actingProviderId: 'p1',
  };
  const today = startOfDay(now);
  let bid = 0;
  for (const p of providers) {
    // agenda dos próximos 14 dias com ~45% ocupada por clientes do próprio prestador
    for (let d = -10; d < 14; d++) {
      const day = addDays(today, d);
      for (const staff of p.staff) {
        const sv = p.services[Math.floor(r() * p.services.length)];
        const size: Size = (['pequeno', 'medio', 'grande'] as Size[])[Math.floor(r() * 3)];
        const slots = daySlots(state, p, sv, size, day, staff, new Date(0));
        for (const s of slots) {
          if (r() > 0.32) continue;
          const sv2 = p.services[Math.floor(r() * p.services.length)];
          const dur = sv2.duration[size];
          // confere de novo (pode ter ocupado com o anterior)
          if (!daySlots(state, p, sv2, size, day, staff, new Date(0)).some(x => x.start.getTime() === s.start.getTime())) continue;
          const [client, pet] = CLIENTS[Math.floor(r() * CLIENTS.length)];
          const past = s.start < now;
          const b: Booking = {
            id: `b${++bid}`, providerId: p.id, serviceId: sv2.id, staff, start: s.start.toISOString(), end: addMin(s.start, dur).toISOString(),
            status: past ? (r() < 0.08 ? 'no_show' : 'concluido') : 'confirmado', origin: r() < 0.3 ? 'marketplace' : 'agenda_prestador',
            clientName: client, petName: pet, size, price: sv2.price[size], isNewClient: r() < 0.25, reschedules: 0,
            presenceConfirmed: !past && r() < 0.5, createdAt: addDays(s.start, -3).toISOString(),
          };
          state.bookings.push(b);
        }
      }
      // almoço bloqueado em alguns prestadores
      if (p.hours[day.getDay()] && r() < 0.5) {
        const blk: Block = { id: `k${p.id}${d}`, providerId: p.id, staff: null, start: atMinutes(day, 12 * 60).toISOString(), end: atMinutes(day, 13 * 60).toISOString(), label: 'Almoço' };
        state.blocks.push(blk);
      }
    }
    // avaliações
    const nRev = p.id === 'p12' ? 2 : 3 + Math.floor(r() * 25);
    for (let i = 0; i < nRev; i++) {
      const stars = r() < 0.7 ? 5 : r() < 0.7 ? 4 : 3;
      const [client] = CLIENTS[Math.floor(r() * CLIENTS.length)];
      const rev: Review = { id: `r${p.id}-${i}`, providerId: p.id, author: client, stars, text: REVIEW_TEXTS[Math.floor(r() * REVIEW_TEXTS.length)], date: addDays(today, -Math.floor(r() * 120) - 1).toISOString() };
      state.reviews.push(rev);
    }
  }
  return state;
}
