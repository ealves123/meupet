/** Cabeçalho das telas de entrada (tutor e prestador). */
export function AuthHero({ kind, title, text }: { kind: 'tutor' | 'prestador'; title: string; text: string }) {
  return (
    <div className={`auth-hero ${kind}`}>
      <div className="auth-badge" aria-hidden>{kind === 'tutor' ? '🐶' : '✂️'}</div>
      <span className="eyebrow">{kind === 'tutor' ? 'Para tutores' : 'Para prestadores'}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}
