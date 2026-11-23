import { useState } from 'react';
import { findProviderAccount, loginProvider, registerProvider, sendProviderCode } from '../lib/store';
import { PLACES } from '../lib/geo';
import { PILOT_TYPES, TYPE_LABEL, fmtPhone, onlyDigits } from '../lib/labels';
import type { ServiceType } from '../lib/types';
import { Sup, toast } from './ui';
import { AuthHero } from './AuthHero';
import { go } from '../lib/router';

/**
 * Entrada do prestador: login por código no celular ou cadastro do negócio.
 * No protótipo o código aparece na tela. Na fase 2 vira Supabase Auth + membros_prestador.
 */
export function ProviderAuth({ onDone, initialMode = 'entrar' }: { onDone: (isNew: boolean) => void; initialMode?: 'entrar' | 'cadastrar' }) {
  const [mode, setMode] = useState<'entrar' | 'cadastrar'>(initialMode);
  return (
    <div className="auth">
      <AuthHero kind="prestador" title={mode === 'entrar' ? 'Área do prestador' : 'Cadastre seu negócio'}
        text="Receba pedidos de tutores da região, aceite ou recuse em um toque e sugira serviços extras." />
      <div className="auth-card">
      <div className="tabs flat" role="tablist">
        <button role="tab" aria-selected={mode === 'entrar'} className={mode === 'entrar' ? 'on' : ''} onClick={() => setMode('entrar')}>Entrar</button>
        <button role="tab" aria-selected={mode === 'cadastrar'} className={mode === 'cadastrar' ? 'on' : ''} onClick={() => setMode('cadastrar')}>Cadastrar meu negócio</button>
      </div>
      {mode === 'entrar' ? <SignIn onDone={() => onDone(false)} onSignup={() => setMode('cadastrar')} /> : <SignUp onDone={() => onDone(true)} />}
      </div>
      <p className="auth-switch">É tutor? <button className="link" onClick={() => go('/entrar')}>Entrar como tutor</button></p>
    </div>
  );
}

function CodeStep({ phone, code, onOk, onBack, label }: { phone: string; code: string; onOk: () => void; onBack: () => void; label: string }) {
  const [typed, setTyped] = useState('');
  return (
    <form className="form" onSubmit={e => { e.preventDefault(); if (typed !== code) return toast('Código incorreto.'); onOk(); }}>
      <p>Enviamos um código para <b>{phone}</b>.</p>
      <div className="notice">Protótipo: o código é <b>{code}</b>.</div>
      <label>Código<input autoFocus inputMode="numeric" value={typed} onChange={e => setTyped(onlyDigits(e.target.value).slice(0, 4))} placeholder="0000" /></label>
      <button className="btn" type="submit">{label}</button>
      <button className="link" type="button" onClick={onBack}>Voltar</button>
    </form>
  );
}

function SignIn({ onDone, onSignup }: { onDone: () => void; onSignup: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  if (code) return <CodeStep phone={phone} code={code} label="Entrar" onBack={() => setCode('')} onOk={() => { if (loginProvider(phone)) onDone(); }} />;
  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      if (onlyDigits(phone).length < 10) return toast('Confira o telefone com DDD.');
      if (!findProviderAccount(phone)) return toast('Não achamos cadastro com esse telefone.');
      setCode(sendProviderCode());
    }}>
      <p className="muted">Entre com o celular cadastrado no seu negócio. <Sup>login por código</Sup></p>
      <label>Celular<input required inputMode="tel" value={phone} onChange={e => setPhone(fmtPhone(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" /></label>
      <button className="btn" type="submit">Enviar código</button>
      <div className="notice">Para testar com um prestador de exemplo, use <button type="button" className="link" onClick={() => setPhone('(11) 4191-0001')}>(11) 4191-0001</button> (Bicho Cheiroso).</div>
      <button className="link" type="button" onClick={onSignup}>Ainda não tem cadastro? Cadastre seu negócio</button>
    </form>
  );
}

function SignUp({ onDone }: { onDone: () => void }) {
  const [businessName, setBusinessName] = useState('');
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState(0);
  const [staff, setStaff] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState('');

  const create = () => {
    const pl = PLACES[place];
    const r = registerProvider({
      businessName, types, ownerName, phone, email, address, description,
      area: `${pl.name === 'Centro Comercial Alphaville' ? 'Alphaville' : pl.name}, ${pl.hint}`, lat: pl.lat, lng: pl.lng,
      staff: staff.split(',').map(x => x.trim()).filter(Boolean),
    });
    if (!r.ok) { toast('Esse telefone já tem cadastro. Use Entrar.'); setCode(''); return; }
    onDone();
  };
  if (code) return <CodeStep phone={phone} code={code} label="Criar cadastro" onBack={() => setCode('')} onOk={create} />;

  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      if (!types.length) return toast('Escolha ao menos um tipo de serviço.');
      if (onlyDigits(phone).length < 10) return toast('Confira o telefone com DDD.');
      if (findProviderAccount(phone)) return toast('Esse telefone já tem cadastro. Use Entrar.');
      setCode(sendProviderCode());
    }}>
      <p className="muted">Cadastro gratuito. Você aparece no mapa assim que cadastrar o primeiro serviço. <Sup>sem aprovação manual no piloto</Sup></p>
      <label>Nome do negócio<input required value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex.: Banho & Cia" /></label>
      <fieldset><legend>O que você oferece</legend>
        <div className="chips wrap">{PILOT_TYPES.map(t => (
          <button key={t} type="button" className={`chip small${types.includes(t) ? ' on' : ''}`} aria-pressed={types.includes(t)}
            onClick={() => setTypes(v => (v.includes(t) ? v.filter(x => x !== t) : [...v, t]))}>{TYPE_LABEL[t]}</button>
        ))}</div>
      </fieldset>
      <label>Seu nome (responsável)<input required value={ownerName} onChange={e => setOwnerName(e.target.value)} autoComplete="name" /></label>
      <label>Celular com WhatsApp<input required inputMode="tel" value={phone} onChange={e => setPhone(fmtPhone(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" /></label>
      <label>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Endereço<input required value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, loja" autoComplete="street-address" /></label>
      <label>Região<select value={place} onChange={e => setPlace(Number(e.target.value))}>
        {PLACES.map((pl, i) => <option key={pl.name} value={i}>{pl.name} · {pl.hint}</option>)}
      </select></label>
      <p className="muted small">No protótipo o pino no mapa fica no centro da região escolhida. <Sup>geocodificação na fase 2</Sup></p>
      <label>Profissionais (separados por vírgula)<input value={staff} onChange={e => setStaff(e.target.value)} placeholder="Ex.: Carla, Joana" /></label>
      <label>Descrição curta<textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="O que o tutor precisa saber sobre você" /></label>
      <label className="check"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required /> Li e aceito os termos para prestadores e a comissão de 8% sobre clientes novos vindos do meuPet</label>
      <button className="btn" type="submit">Enviar código</button>
    </form>
  );
}
