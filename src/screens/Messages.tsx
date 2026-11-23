import { useState } from 'react';
import { useStore, confirmPresence, answerProposal, tutorInbox } from '../lib/store';
import { TopBar, Empty, toast } from '../components/ui';
import { whenLabel } from '../lib/dates';
import { go } from '../lib/router';

/** Caixa simulada do WhatsApp e do e-mail do tutor (seção 7). Na fase 2 isso é enviado de verdade. */
export function Messages() {
  const s = useStore();
  const [showFuture, setShowFuture] = useState(false);
  const now = Date.now();
  const mine = tutorInbox(s);
  const sent = mine.filter(m => new Date(m.sendAt).getTime() <= now).sort((a, b) => b.sendAt.localeCompare(a.sendAt));
  const future = mine.filter(m => new Date(m.sendAt).getTime() > now).sort((a, b) => a.sendAt.localeCompare(b.sendAt));
  const act = (a: string, bookingId?: string, proposalId?: string) => {
    const b = s.bookings.find(x => x.id === bookingId);
    if ((a === 'aceitar_extra' || a === 'recusar_extra') && proposalId) {
      const r = answerProposal(proposalId, a === 'aceitar_extra');
      toast(r.ok ? (a === 'aceitar_extra' ? 'Extra adicionado. O prestador foi avisado.' : 'Tudo bem, avisamos o prestador.') : 'Essa sugestão não está mais disponível.');
      return;
    }
    if (a === 'confirmar' && b) { confirmPresence(b.id); toast('Presença confirmada. O prestador já sabe.'); return; }
    if (a === 'remarcar' && b) { const p = s.providers.find(x => x.id === b.providerId)!; go(b.status === 'confirmado' ? `/agendar/${p.slug}/${b.serviceId}?remarcar=${b.id}` : `/agendar/${p.slug}/${b.serviceId}`); return; }
    go(bookingId && b ? `/agendamento/${bookingId}` : '/agendamentos');
  };
  // botões de proposta só enquanto ela está pendente; "cancelar" de um pedido só enquanto ele está ativo
  const visible = (a: string, m: (typeof mine)[number]) => {
    if (a === 'aceitar_extra' || a === 'recusar_extra') return s.proposals.find(x => x.id === m.proposalId)?.status === 'pendente';
    return true;
  };
  const LABEL: Record<string, string> = { aceitar_extra: 'Quero o extra', recusar_extra: 'Agora não', confirmar: 'Confirmo presença', remarcar: 'Remarcar', cancelar: 'Cancelar', avaliar: 'Avaliar', ver: 'Ver detalhes' };
  return (
    <div>
      <TopBar title="Mensagens" />
      <div className="notice">Simulação do que o tutor recebe no WhatsApp e no e-mail. No app real, chega no celular dele.</div>
      <div className="pad">
        {sent.length === 0 && <Empty icon="💬" title="Nenhuma mensagem ainda"><p>Confirmações e lembretes aparecem aqui.</p></Empty>}
        {sent.map(m => (
          <article key={m.id} className={`msg ${m.channel}`}>
            <header><span>{m.channel === 'whatsapp' ? '🟢 WhatsApp' : '✉️ E-mail'}</span><small className="muted">{whenLabel(new Date(m.sendAt))}</small></header>
            <b>{m.title}</b>
            <p>{m.body}</p>
            {m.actions && <div className="row gap wrap">{m.actions.filter(a => visible(a, m)).map(a => <button key={a} className="btn sm ghost" onClick={() => act(a, m.bookingId, m.proposalId)}>{LABEL[a]}</button>)}</div>}
          </article>
        ))}
        {future.length > 0 && (
          <>
            <button className="link" onClick={() => setShowFuture(v => !v)}>{showFuture ? 'Esconder' : 'Ver'} {future.length} lembretes programados</button>
            {showFuture && future.map(m => (
              <article key={m.id} className="msg scheduled">
                <header><span>⏰ Sai {whenLabel(new Date(m.sendAt))}</span></header>
                <b>{m.title}</b><p>{m.body}</p>
                {m.actions && <div className="row gap wrap">{m.actions.map(a => <button key={a} className="btn sm ghost" onClick={() => act(a, m.bookingId)}>{LABEL[a]}</button>)}</div>}
              </article>
            ))}
            <p className="muted small">Nenhum lembrete sai entre 22h e 7h. Agendamento feito com menos de 24 h não recebe o lembrete da véspera.</p>
          </>
        )}
      </div>
    </div>
  );
}
