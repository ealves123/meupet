import { useRoute, go } from './lib/router';
import { useStore } from './lib/store';
import { Explore } from './screens/Explore';
import { ProviderProfile } from './screens/ProviderProfile';
import { Booking } from './screens/Booking';
import { MyBookings } from './screens/MyBookings';
import { Messages } from './screens/Messages';
import { Account, About } from './screens/Account';
import { ProviderPanel } from './screens/ProviderPanel';

export function App() {
  const { parts, query } = useRoute();
  const s = useStore();
  const unread = s.messages.filter(m => m.to === 'tutor' && new Date(m.sendAt).getTime() <= Date.now()).length;
  const upcoming = s.tutor ? s.bookings.filter(b => b.tutorPhone === s.tutor!.phone && b.status === 'confirmado' && new Date(b.end) > new Date()).length : 0;
  const [a, b, c] = parts;
  let screen;
  let nav = true;
  if (!a) screen = <Explore />;
  else if (a === 'p' && b) screen = <ProviderProfile slug={b} />;
  else if (a === 'agendar' && b && c) { screen = <Booking key={`${b}/${c}/${query.get('remarcar') ?? ''}`} slug={b} serviceId={c} query={query} />; nav = false; }
  else if (a === 'agendamentos') screen = <MyBookings />;
  else if (a === 'mensagens') screen = <Messages />;
  else if (a === 'conta') screen = <Account />;
  else if (a === 'sobre') screen = <About />;
  else if (a === 'prestador') { screen = <ProviderPanel />; nav = false; }
  else screen = <Explore />;
  const tab = !a || a === 'p' ? 'explorar' : a;
  return (
    <div className={`app${nav ? ' with-nav' : ''}`}>
      <main>{screen}</main>
      {nav && (
        <nav className="bottom-nav" aria-label="Navegação principal">
          <button className={tab === 'explorar' ? 'on' : ''} onClick={() => go('/')}><span>🗺️</span>Explorar</button>
          <button className={tab === 'agendamentos' ? 'on' : ''} onClick={() => go('/agendamentos')}><span>📅{upcoming > 0 && <i className="badge-dot">{upcoming}</i>}</span>Agendamentos</button>
          <button className={tab === 'mensagens' ? 'on' : ''} onClick={() => go('/mensagens')}><span>💬{unread > 0 && <i className="badge-dot">{unread}</i>}</span>Mensagens</button>
          <button className={tab === 'conta' || tab === 'sobre' ? 'on' : ''} onClick={() => go('/conta')}><span>👤</span>Conta</button>
        </nav>
      )}
    </div>
  );
}
