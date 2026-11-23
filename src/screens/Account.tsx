import { useState } from 'react';
import { useStore, logout, savePet, archivePet, updateTutor, resetDemo } from '../lib/store';
import { TopBar, Sheet, Sup, toast } from '../components/ui';
import { PetForm } from '../components/PetForm';
import { Login } from '../components/Login';
import { SIZE_SHORT, SPECIES_LABEL } from '../lib/labels';
import { go } from '../lib/router';
import type { Pet } from '../lib/types';

export function Account() {
  const s = useStore();
  const [editPet, setEditPet] = useState<Partial<Pet> | null>(null);
  const pets = s.pets.filter(p => !p.archived);
  return (
    <div>
      <TopBar title="Conta" />
      {!s.tutor ? (
        <section className="card"><h3>Entrar no meuPet</h3><Login onDone={() => toast('Pronto, você entrou.')} /></section>
      ) : (
        <>
          <section className="card">
            <h3>{s.tutor.name}</h3>
            <p className="muted">{s.tutor.phone} · {s.tutor.email}</p>
            <h4>Onde receber avisos</h4>
            <label className="check"><input type="checkbox" checked={s.tutor.channels.whatsapp} onChange={e => updateTutor({ channels: { ...s.tutor!.channels, whatsapp: e.target.checked } })} /> WhatsApp</label>
            <label className="check"><input type="checkbox" checked={s.tutor.channels.email} onChange={e => updateTutor({ channels: { ...s.tutor!.channels, email: e.target.checked } })} /> E-mail</label>
            <button className="link" onClick={logout}>Sair</button>
          </section>
          <section className="card">
            <h3>Meus pets</h3>
            <ul className="svc-list">
              {pets.map(p => (
                <li key={p.id}>
                  <div><b>{p.species === 'gato' ? '🐈' : '🐕'} {p.name}</b><div className="muted">{SPECIES_LABEL[p.species]} · {SIZE_SHORT[p.size]}{p.breed ? ` · ${p.breed}` : ''}</div></div>
                  <button className="btn sm ghost" onClick={() => setEditPet(p)}>Editar</button>
                </li>
              ))}
            </ul>
            <button className="btn ghost" onClick={() => setEditPet({})}>+ Adicionar pet</button>
          </section>
        </>
      )}
      <section className="card">
        <h3>Você é prestador?</h3>
        <p className="muted">Cadastre seu negócio, receba pedidos, aceite ou recuse e sugira serviços extras.</p>
        <button className="btn" onClick={() => go('/prestador')}>{s.providerSession ? 'Abrir painel do prestador' : 'Entrar ou cadastrar como prestador'}</button>
      </section>
      <section className="card">
        <h3>Sobre este protótipo</h3>
        <button className="link" onClick={() => go('/sobre')}>O que está simulado e quais suposições seguimos ›</button>
        <br />
        <button className="link danger" onClick={() => { if (confirm('Apagar tudo e voltar aos dados de exemplo?')) { resetDemo(); toast('Dados de exemplo restaurados'); } }}>Restaurar dados de exemplo</button>
      </section>
      <Sheet open={!!editPet} onClose={() => setEditPet(null)} title={editPet?.id ? 'Editar pet' : 'Novo pet'}>
        {editPet && <PetForm initial={editPet} onSave={p => { savePet(p); setEditPet(null); }} />}
        {editPet?.id && <button className="link danger pad" onClick={() => { archivePet(editPet.id!); setEditPet(null); toast('Pet arquivado. Agendamentos futuros dele foram cancelados.'); }}>Arquivar pet</button>}
      </Sheet>
    </div>
  );
}

export function About() {
  return (
    <div>
      <TopBar title="Sobre o protótipo" onBack />
      <div className="pad prose">
        <h3>O que é real aqui</h3>
        <p>O fluxo inteiro funciona: busca no mapa, filtros, perfil, horários calculados a partir do funcionamento, dos agendamentos, dos bloqueios e da duração do serviço, reserva temporária, confirmação, remarcação, cancelamento, avaliação e o painel do prestador.</p>
        <h3>O que está simulado</h3>
        <ul>
          <li>Os 12 prestadores e a agenda deles são fictícios. Para entrar como um deles, use o telefone dele, por exemplo (11) 4191-0001.</li>
          <li>Os dados ficam só neste aparelho. Tutor e prestador estão no mesmo celular para dar para testar os dois lados.</li>
          <li>O código de login e os lembretes de WhatsApp e e-mail aparecem na aba Mensagens em vez de serem enviados.</li>
          <li>A busca de endereço conhece só alguns lugares de Alphaville e arredores.</li>
        </ul>
        <h3>Suposições da especificação v0.1 <Sup /></h3>
        <ul>
          <li>O pedido nasce pendente e segura o horário. O prestador aceita ou recusa com motivo em até 4 h (ou até 1 h antes do horário); sem resposta, o pedido é recusado sozinho. Remarcar um agendamento já aceito não precisa de nova aprovação.</li>
          <li>O prestador pode sugerir um serviço extra (ex.: hidratação com o banho). Ele é feito logo depois, com o mesmo profissional, e só entra se o tutor aceitar e ainda couber na agenda.</li>
          <li>Cadastro de prestador sem aprovação manual: aparece no mapa ao ter um serviço ativo.</li>
          <li>Hotel e creche aparecem como "em breve". Atendimento a domicílio e leva e traz ficam para depois.</li>
          <li>Telefone e WhatsApp do prestador só aparecem depois de agendar.</li>
          <li>Cada agendamento guarda a origem e se é cliente novo, que é a base da comissão de 8%. A cobrança da comissão não está no MVP.</li>
          <li>Raio padrão de 3 km, ajustável de 1 a 15 km. Cobertura do piloto em Alphaville, Tamboré e Aldeia da Serra.</li>
          <li>Reserva temporária de 5 minutos. Antecedência mínima de 2 h. Janela de 14 dias, até 30.</li>
          <li>Cancelamento sem custo até 2 h antes (o prestador pode mudar). Até 2 remarcações e 3 agendamentos futuros por prestador.</li>
          <li>Login por código no WhatsApp ou SMS. Pagamento no local.</li>
          <li>Nenhum lembrete entre 22h e 7h.</li>
        </ul>
      </div>
    </div>
  );
}
