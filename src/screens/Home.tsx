import { useStore, logout, logoutProvider } from '../lib/store';
import { ratingOf } from '../lib/rating';
import { PILOT_TYPES, TYPE_EMOJI, TYPE_LABEL, STATUS_LABEL } from '../lib/labels';
import { whenLabel } from '../lib/dates';
import { go } from '../lib/router';
import { Stars, toast } from '../components/ui';
import { InstallHint } from '../components/InstallHint';
import { exploreType } from './Explore';

const TUTOR_STEPS = [
  ['🗺️', 'Encontre perto de casa', 'Busque pelo CEP ou bairro em Alphaville e região e no ABC.'],
  ['📅', 'Peça um horário', 'Só aparecem horários livres de verdade, já com o preço do porte do seu pet.'],
  ['✅', 'O prestador confirma', 'Você acompanha o pedido e recebe a confirmação no WhatsApp.'],
  ['🔔', 'Lembretes e detalhes', 'Avisos 24 h e 2 h antes, endereço, contato e histórico em um lugar.'],
];
const PROVIDER_STEPS = [
  ['🏪', 'Cadastro grátis', 'Monte seus serviços, preços por porte e horários em minutos.'],
  ['📥', 'Receba pedidos', 'O horário fica reservado enquanto você decide.'],
  ['👍', 'Aceite ou recuse', 'Em um toque, com motivo para o tutor quando recusar.'],
  ['✨', 'Sugira extras', 'Ofereça hidratação, corte de unhas e outros junto do atendimento.'],
];

/** Página inicial: apresenta o meuPet e leva cada pessoa à sua jornada (tutor ou prestador). */
export function Home() {
  const s = useStore();
  const now = new Date();
  const visible = s.providers.filter(p => !p.paused && p.services.some(x => x.active));
  const top = visible
    .map(p => ({ p, r: ratingOf(s, p.id) }))
    .filter(x => !x.r.isNew)
    .sort((a, b) => b.r.avg - a.r.avg || b.r.count - a.r.count)
    .slice(0, 6);
  const next = s.tutor
    ? s.bookings
        .filter(b => b.tutorPhone === s.tutor!.phone && (b.status === 'confirmado' || b.status === 'pendente') && new Date(b.end) > now)
        .sort((a, b) => a.start.localeCompare(b.start))[0]
    : undefined;
  const nextP = next && s.providers.find(p => p.id === next.providerId);
  const nextSvc = next && nextP?.services.find(x => x.id === next.serviceId);
  const prov = s.providerSession && s.providers.find(p => p.id === s.providerSession!.providerId);
  const provPending = prov ? s.bookings.filter(b => b.providerId === prov.id && b.status === 'pendente').length : 0;
  const firstName = s.tutor?.name.split(' ')[0];

  return (
    <div className="home">
      <header className="home-hero">
        <div className="home-top">
          <div className="home-brand"><span className="logo" aria-hidden>🐾</span> meuPet</div>
          <div className="home-access">
            {!s.tutor && <button onClick={() => go('/entrar')}>Entrar</button>}
            <button className="pro" onClick={() => go('/prestador')}>{prov ? 'Meu painel' : 'Sou prestador'}</button>
          </div>
        </div>
        <div className="home-blobs" aria-hidden><span>🐕</span><span>🐈</span><span>🛁</span></div>
        <h1>{firstName ? <>Oi, {firstName}! O que o seu pet precisa hoje?</> : <>Cuidado para o seu pet, pertinho de casa</>}</h1>
        <p>Banho e tosa, veterinário, pet shop e adestramento em Alphaville e no ABC, com horário confirmado pelo prestador.</p>
        <button className="home-search" onClick={() => exploreType(null)}>
          <span aria-hidden>🔎</span><span>Encontrar serviços perto de mim</span><b aria-hidden>›</b>
        </button>
      </header>

      <InstallHint />

      {(s.tutor || prov) && (
        <section className="home-now">
          {next && nextP && (
            <button className="now-card" onClick={() => go(`/agendamento/${next.id}`)}>
              <span className="now-icon" style={{ background: nextP.color }}>{nextP.emoji}</span>
              <span className="now-body">
                <small>Seu próximo agendamento</small>
                <b>{nextSvc?.name} · {nextP.name}</b>
                <span className={`status s-${next.status}`}>{STATUS_LABEL[next.status]} · {whenLabel(new Date(next.start))}</span>
              </span>
              <span className="chev" aria-hidden>›</span>
            </button>
          )}
          {s.tutor && (
            <div className="session">
              <span className="session-av">🐶</span>
              <span className="session-who"><small>Tutor conectado</small><b>{s.tutor.name}</b></span>
              <button className="btn sm ghost danger" onClick={() => { logout(); toast('Você saiu da conta de tutor.'); }}>Sair</button>
            </div>
          )}
          {prov && (
            <button className="now-card dark" onClick={() => go('/prestador')}>
              <span className="now-icon" style={{ background: prov.color }}>{prov.emoji}</span>
              <span className="now-body">
                <small>Painel do prestador</small>
                <b>{prov.name}</b>
                <span>{provPending ? `${provPending} pedido${provPending > 1 ? 's' : ''} esperando resposta` : 'Nenhum pedido pendente'}</span>
              </span>
              <span className="chev" aria-hidden>›</span>
            </button>
          )}
          {prov && (
            <div className="session">
              <span className="session-av pro">🏪</span>
              <span className="session-who"><small>Prestador conectado</small><b>{prov.name}</b></span>
              <button className="btn sm ghost danger" onClick={() => { logoutProvider(); toast('Você saiu do painel do prestador.'); }}>Sair</button>
            </div>
          )}
        </section>
      )}

      <section className="home-sec">
        <h2>O que você procura?</h2>
        <div className="cats">
          {PILOT_TYPES.map(t => (
            <button key={t} className={`cat cat-${t}`} onClick={() => exploreType(t)}>
              <span aria-hidden>{TYPE_EMOJI[t]}</span>{TYPE_LABEL[t]}
            </button>
          ))}
        </div>
      </section>

      <section className="journeys">
        <article className="journey tutor">
          <span className="eyebrow">Sou tutor</span>
          <h2>Agende sem trocar 20 mensagens</h2>
          <ol className="steps">
            {TUTOR_STEPS.map(([i, t, d]) => <li key={t}><span className="step-i" aria-hidden>{i}</span><div><b>{t}</b><p>{d}</p></div></li>)}
          </ol>
          {s.tutor
            ? <div className="row gap wrap"><button className="btn" onClick={() => go('/agendamentos')}>Meus agendamentos</button><button className="btn ghost" onClick={() => exploreType(null)}>Agendar</button></div>
            : <div className="row gap wrap"><button className="btn" onClick={() => go('/entrar')}>Entrar como tutor</button><button className="btn ghost" onClick={() => exploreType(null)}>Ver prestadores</button></div>}
        </article>

        <article className="journey pro">
          <span className="eyebrow">Sou prestador</span>
          <h2>Sua agenda cheia, sem esforço</h2>
          <ol className="steps">
            {PROVIDER_STEPS.map(([i, t, d]) => <li key={t}><span className="step-i" aria-hidden>{i}</span><div><b>{t}</b><p>{d}</p></div></li>)}
          </ol>
          {prov
            ? <button className="btn light" onClick={() => go('/prestador')}>Abrir meu painel</button>
            : <div className="row gap wrap"><button className="btn light" onClick={() => go('/prestador')}>Entrar no painel</button><button className="btn outline-light" onClick={() => go('/prestador?cadastro=1')}>Cadastrar meu negócio</button></div>}
        </article>
      </section>

      {top.length > 0 && (
        <section className="home-sec">
          <div className="row between"><h2>Mais bem avaliados</h2><button className="link" onClick={() => exploreType(null)}>Ver todos</button></div>
          <div className="top-row">
            {top.map(({ p, r }) => (
              <button key={p.id} className="top-card" onClick={() => go(`/p/${p.slug}`)}>
                <span className="top-art" style={{ background: p.color }}>{p.emoji}</span>
                <b>{p.name}</b>
                <span className="muted small">{p.area}</span>
                <span className="small"><Stars value={r.avg} size={12} /> {r.avg.toFixed(1)} <span className="muted">({r.count})</span></span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="home-sec">
        <ul className="trust">
          <li><b>{visible.length}</b><span>prestadores na região</span></li>
          <li><b>{s.reviews.length}</b><span>avaliações de tutores</span></li>
          <li><b>0%</b><span>de taxa para o tutor</span></li>
        </ul>
        <ul className="perks">
          <li>💳 Pagamento direto no local</li>
          <li>↩️ Cancelamento sem custo até 2 h antes</li>
          <li>💬 Confirmação e lembretes no WhatsApp</li>
        </ul>
      </section>

      <footer className="home-foot">
        <span>meuPet · Alphaville e ABC (SP)</span>
        <button className="link" onClick={() => go('/sobre')}>Sobre este protótipo</button>
      </footer>
    </div>
  );
}
