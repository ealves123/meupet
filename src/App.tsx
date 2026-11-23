import { useRoute, go } from './lib/router';
import { useEffect } from 'react';
import { useStore, sweep } from './lib/store';
import { Explore } from './screens/Explore';
import { ProviderProfile } from './screens/ProviderProfile';
import { Booking } from './screens/Booking';
import { MyBookings } from './screens/MyBookings';
import { BookingDetail } from './screens/BookingDetail';
import { Messages } from './screens/Messages';
import { Account, About } from './screens/Account';
import { ProviderPanel } from './screens/ProviderPanel';
import { Home } from './screens/Home';
import { TutorAuth } from './screens/TutorAuth';

export function App() {
  const { parts, query } = useRoute();
  const s = useStore();
  // pedidos sem resposta no prazo são recusados sozinhos
  useEffect(() => { const t = setInterval(sweep, 30_000); return () => clearInterval(t); }, []);
  const unread = s.messages.filter(m => m.to === 'tutor' && new Date(m.sendAt).getTime() <= Date.now()).length;
  const upcoming = s.tutor ? s.bookings.filter(b => b.tutorPhone === s.tutor!.phone && (b.status === 'confirmado' || b.status === 'pendente') && new Date(b.end) > new Date()).length : 0;
  const [a, b, c] = parts;
  let screen;
  let nav = true;
  if (!a) screen = <Home />;
  else if (a === 'explorar') screen = <Explore />;
  else if (a === 'entrar') { screen = s.tutor ? <Home /> : <TutorAuth next={query.get('volta')} />; nav = !!s.tutor; }
  else if (a === 'p' && b) screen = <ProviderProfile slug={b} />;
  else if (a === 'agendar' && b && c) { screen = <Booking key={`${b}/${c}/${query.get('remarcar') ?? ''}`} slug={b} serviceId={c} query={query} />; nav = false; }
  else if (a === 'agendamentos') screen = <MyBookings />;
  else if (a === 'agendamento' && b) screen = <BookingDetail key={b} id={b} />;
  else if (a === 'mensagens') screen = <Messages />;
  else if (a === 'conta') screen = <Account />;
  else if (a === 'sobre') screen = <About />;
  else if (a === 'prestador') { screen = <ProviderPanel key={query.get('cadastro') ?? ''} initialMode={query.get('cadastro') ? 'cadastrar' : 'entrar'} />; nav = false; }
  else screen = <Home />;
  const tab = !a || a === 'entrar' ? 'inicio' : a === 'p' ? 'explorar' : a === 'agendamento' ? 'agendamentos' : a;
  return (
    <div className={`app${nav ? ' with-nav' : ''}`}>
      <main>{screen}</main>
      {nav && (
        <nav className="bottom-nav" aria-label="Navegação principal">
          <button className={tab === 'inicio' ? 'on' : ''} onClick={() => go('/')}><span>🏠</span>Início</button>
          <button className={tab === 'explorar' ? 'on' : ''} onClick={() => go('/explorar')}><span>🗺️</span>Explorar</button>
          <button className={tab === 'agendamentos' ? 'on' : ''} onClick={() => go('/agendamentos')}><span>📅{upcoming > 0 && <i className="badge-dot">{upcoming}</i>}</span>Agenda</button>
          <button className={tab === 'mensagens' ? 'on' : ''} onClick={() => go('/mensagens')}><span>💬{unread > 0 && <i className="badge-dot">{unread}</i>}</span>Mensagens</button>
          <button className={tab === 'conta' || tab === 'sobre' ? 'on' : ''} onClick={() => go('/conta')}><span>👤</span>Conta</button>
        </nav>
      )}
    </div>
  );
}
