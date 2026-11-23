import { useEffect, useState } from 'react';

interface BIPEvent extends Event { prompt: () => Promise<void> }

/** Convite para instalar o webapp na tela inicial (Android: botão; iPhone: instrução). */
export function InstallHint() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem('meupet:install-hidden') === '1'; } catch { return false; } });
  const standalone = typeof window !== 'undefined' && (matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    addEventListener('beforeinstallprompt', h); return () => removeEventListener('beforeinstallprompt', h);
  }, []);
  const hide = () => { setHidden(true); try { localStorage.setItem('meupet:install-hidden', '1'); } catch { /* ignora */ } };
  if (hidden || standalone || (!evt && !ios)) return null;
  return (
    <div className="install">
      <span>📲</span>
      <p>{evt ? 'Instale o meuPet na tela inicial.' : <>No iPhone, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.</>}</p>
      {evt && <button className="btn sm" onClick={() => { evt.prompt(); hide(); }}>Instalar</button>}
      <button className="icon-btn sm" aria-label="Fechar" onClick={hide}>×</button>
    </div>
  );
}
