import { Login } from '../components/Login';
import { AuthHero } from '../components/AuthHero';
import { TopBar, toast } from '../components/ui';
import { go } from '../lib/router';

/** Área de login do tutor. Também usada pela aba Conta quando ninguém entrou. */
export function TutorAuthBody({ onDone }: { onDone: () => void }) {
  return (
    <div className="auth">
      <AuthHero kind="tutor" title="Entre como tutor" text="Acompanhe seus pedidos, receba a confirmação do prestador e lembretes no WhatsApp." />
      <div className="auth-card"><Login onDone={onDone} /></div>
      <p className="auth-switch">Tem um negócio pet? <button className="link" onClick={() => go('/prestador')}>Área do prestador</button></p>
    </div>
  );
}

export function TutorAuth({ next }: { next: string | null }) {
  return (
    <div>
      <TopBar title="Entrar" onBack={() => go('/')} />
      <TutorAuthBody onDone={() => { toast('Pronto, você entrou.'); go(next || '/'); }} />
    </div>
  );
}
