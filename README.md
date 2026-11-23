# meuPet — MVP (webapp instalável / PWA)

Protótipo funcional do meuPet, feito a partir da especificação v0.1 do fluxo de agendamento.
Roda no navegador do celular e pode ser instalado na tela inicial (Android e iPhone).

## Como rodar

```bash
npm install
npm run dev          # desenvolvimento em http://localhost:5173
npm run build        # PWA pronto para hospedar (pasta dist/)
npm run build:single # um único index.html, para pré-visualização (pasta dist-single/)
```

## O que tem

**Tutor:** mapa centrado em Alphaville com raio de 3 km e lista sincronizada, busca por residencial ou bairro, "Buscar nesta área",
filtros (tipo de serviço, dia, raio, avaliação, preço), perfil do prestador, horários reais (funcionamento − agendamentos − bloqueios −
reservas temporárias, respeitando duração por porte, limpeza e antecedência), reserva temporária de 5 min, login por código, pedido pendente até o prestador aceitar,
cadastro do pet no meio do fluxo, status do pedido (pendente, confirmado, recusado), tela de detalhes do agendamento, .ics, remarcação, cancelamento com motivo e aviso de cancelamento tardio,
aceitar ou recusar serviço extra sugerido pelo prestador, avaliação depois do serviço, e caixa simulada de WhatsApp/e-mail com os lembretes (confirmação, 24 h, 2 h, avaliação; nada entre 22h e 7h).

**Prestador:** cadastro e login por código, pedidos pendentes para aceitar ou recusar com motivo, sugestão de serviço extra (ex.: hidratação com o banho), agenda por dia com origem (meuPet ou agenda própria), selo de cliente novo, presença confirmada, concluir, marcar falta,
cancelar com aviso ao tutor e 3 horários alternativos, lançar cliente de fora do app, bloquear horário, editar serviços (preço e duração
por porte), horário de funcionamento, regras da agenda, pausar agenda, e indicadores (falta, presença, comissão estimada de 8%).

## O que está simulado

- 12 prestadores fictícios e a agenda deles (`src/lib/seed.ts`).
- Os dados ficam no `localStorage` do aparelho (`src/lib/store.ts`).
- Código de login e mensagens aparecem na aba Mensagens.
- Busca de endereço com uma lista fixa de lugares (`src/lib/geo.ts`).

## Suposições seguidas (marcadas no app com a etiqueta "suposição")

O prestador responde em até 4 h (ou 1 h antes do horário), senão o pedido é recusado sozinho; cadastro de prestador sem aprovação manual; hotel e creche "em breve"; sem atendimento a domicílio; contato escondido até agendar; comissão de 8% só sobre
cliente novo vindo do meuPet (só registrada, não cobrada); raio de 3 km; reserva de 5 min; antecedência de 2 h; janela de 14 a 30 dias;
cancelamento grátis até 2 h; até 2 remarcações e 3 agendamentos futuros por prestador; pagamento no local.

## Próximos passos (fase 2)

1. **Supabase** (Postgres + PostGIS + Auth por telefone): trocar `src/lib/store.ts` por chamadas ao banco. A confirmação vira uma função
   no banco com restrição de exclusão (`EXCLUDE USING gist`) por profissional e intervalo, para nunca haver dois agendamentos no mesmo horário.
2. **WhatsApp Business API** (Twilio, Z-API ou Meta direto): modelos aprovados para confirmação, lembretes e código de login.
3. **Hospedagem** na Vercel ou Netlify com domínio próprio (meupet.com.br) e URLs amigáveis para SEO local.
4. Geocodificação de endereço e CEP, fotos dos prestadores, cadastro e aprovação de prestadores.

## Estrutura

```
src/lib/      tipos, dados de exemplo, cálculo de horários (slots.ts), store, datas, geo
src/screens/  Explore, ProviderProfile, Booking, MyBookings, Messages, Account/About, ProviderPanel
src/components/ mapa (Leaflet + OpenStreetMap), login, formulário de pet, UI
```
