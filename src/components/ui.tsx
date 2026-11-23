import { useEffect, type ReactNode } from 'react';
import { back } from '../lib/router';

/** Marca visual das suposições da especificação v0.1, que ainda aguardam decisão. */
export function Sup({ children, title }: { children?: ReactNode; title?: string }) {
  return <span className="sup" title={title ?? 'Suposição da especificação v0.1, aguardando decisão'}>suposição{children ? <> · {children}</> : null}</span>;
}

export function TopBar({ title, onBack, right }: { title: ReactNode; onBack?: (() => void) | true; right?: ReactNode }) {
  return (
    <header className="topbar">
      {onBack && <button className="icon-btn" aria-label="Voltar" onClick={() => (onBack === true ? back() : onBack())}>‹</button>}
      <h1>{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head"><h2>{title}</h2><button className="icon-btn" aria-label="Fechar" onClick={onClose}>×</button></div>
        {children}
      </div>
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return <span className="stars" style={{ fontSize: size }} aria-label={`${value.toFixed(1)} de 5`}>{'★'.repeat(Math.round(value))}<span className="stars-off">{'★'.repeat(5 - Math.round(value))}</span></span>;
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return <div className="empty"><div className="empty-icon">{icon}</div><h3>{title}</h3>{children}</div>;
}

let toastTimer: number | undefined;
export function toast(msg: string) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = msg; el.className = 'show';
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => { el!.className = ''; }, 3200);
}
