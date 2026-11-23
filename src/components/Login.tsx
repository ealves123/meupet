import { useState } from 'react';
import { sendLoginCode, loginTutor } from '../lib/store';
import { Sup, toast } from './ui';

/** Login por código no WhatsApp/SMS [Suposição] HU-16. No protótipo o código chega na aba Mensagens. */
export function Login({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<'dados' | 'codigo'>('dados');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [terms, setTerms] = useState(false);
  const [wa, setWa] = useState(true);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState('');
  const fmt = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  if (step === 'dados') return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      if (phone.replace(/\D/g, '').length < 10) return toast('Confira o celular com DDD.');
      const c = sendLoginCode(phone); setSent(c); setStep('codigo');
    }}>
      <p className="muted">Para confirmar, precisamos saber quem é você. Leva menos de um minuto. <Sup>login por código</Sup></p>
      <label>Seu nome<input required value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
      <label>Celular com WhatsApp<input required inputMode="tel" value={phone} onChange={e => setPhone(fmt(e.target.value))} placeholder="(11) 99999-9999" autoComplete="tel" /></label>
      <label>E-mail<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      <label className="check"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required /> Li e aceito os termos de uso e a política de privacidade</label>
      <label className="check"><input type="checkbox" checked={wa} onChange={e => setWa(e.target.checked)} /> Quero receber confirmações e lembretes pelo WhatsApp</label>
      <button className="btn" type="submit">Enviar código</button>
    </form>
  );
  return (
    <form className="form" onSubmit={e => {
      e.preventDefault();
      if (code !== sent) return toast('Código incorreto.');
      loginTutor({ name: name.trim(), phone, email, consentWhatsapp: wa, channels: { whatsapp: wa, email: true } });
      onDone();
    }}>
      <p>Enviamos um código para <b>{phone}</b>.</p>
      <div className="notice">Protótipo: o código é <b>{sent}</b>. Ele também aparece na aba Mensagens.</div>
      <label>Código<input autoFocus inputMode="numeric" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" /></label>
      <button className="btn" type="submit">Entrar</button>
      <button className="link" type="button" onClick={() => setStep('dados')}>Trocar número</button>
    </form>
  );
}
