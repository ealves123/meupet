# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

O meuPet conecta tutores de pets a prestadores de serviços pet (banho e tosa, veterinário, pet shop, adestramento) em Alphaville, Barueri (SP). Este repositório é o MVP: um protótipo funcional instalável (PWA), feito a partir da "especificação v0.1" do fluxo de agendamento. Tem dois lados:

- **Tutor:** mapa e lista de prestadores, perfil, agendamento, meus agendamentos, mensagens, conta.
- **Prestador:** painel em `#/prestador` com agenda do dia, serviços, bloqueios, regras da agenda e indicadores.

Não há backend: tudo roda no navegador. Textos da interface, comentários, nomes de variáveis e termos do domínio estão em português; mantenha o código novo no mesmo padrão.

## Stack

- React 18 + TypeScript (modo `strict`)
- Vite 5
- PWA com `vite-plugin-pwa` (manifest + service worker; cache dos tiles do mapa)
- Leaflet + OpenStreetMap para o mapa
- `vite-plugin-singlefile` para o build de arquivo único (pré-visualização)

## Comandos

```bash
npm install
npm run dev           # servidor de desenvolvimento em http://localhost:5173
npm run build         # tsc --noEmit (checagem de tipos) + build PWA em dist/
npm run build:single  # um único index.html em dist-single/ (só pré-visualização, sem service worker)
npm run preview       # serve o dist/ gerado
```

Não há testes nem linter configurados. A única verificação é `npm run build` (ou `npx tsc --noEmit`); com `noUnusedLocals`, um import não usado quebra o build.

## Deploy

Cada push na `main` publica o app automaticamente na Vercel (integração Git configurada no painel da Vercel; não há `vercel.json` no repositório). Ou seja: commitar na `main` é publicar em produção. Garanta que `npm run build` passa antes de dar push.

## Estrutura de pastas

```
public/          ícones do PWA (192, 512, apple-touch-icon)
src/main.tsx     ponto de entrada; registra o service worker só no build PWA de produção
src/App.tsx      tabela de rotas e barra de navegação inferior
src/lib/         lógica sem UI: tipos, store, dados de exemplo, cálculo de horários, datas, geo, .ics, rótulos
src/screens/     telas (Explore, ProviderProfile, Booking, MyBookings, Messages, Account/About, ProviderPanel)
src/components/  mapa (MapView), login, formulário de pet, aviso de instalação, componentes de UI
```

## Arquitetura

- **Estado — [src/lib/store.ts](src/lib/store.ts):** é toda a camada de dados. Um único `AppState` em memória, salvo no `localStorage` na chave `meupet:v2` (se `version` não bater com `VERSION`, descarta e gera o seed de novo). Toda alteração passa por `set(fn)`, que faz `structuredClone`, deixa `fn` mutar o rascunho, salva e notifica. Componentes leem com `useStore(seletor?)` (sobre `useSyncExternalStore`). As ações do domínio (confirmar/cancelar/remarcar, reservas temporárias, avaliações, edição do prestador, pausa, cliente de fora do app, bloqueios) são funções exportadas desse arquivo. Ao mudar o formato de `AppState` em [src/lib/types.ts](src/lib/types.ts), ajuste a versão/seed para não quebrar dados antigos. "Resetar demo" chama `resetDemo()`.
- **Dados de exemplo — [src/lib/seed.ts](src/lib/seed.ts):** 12 prestadores fictícios e suas agendas, gerados relativos a "agora".
- **Horários — [src/lib/slots.ts](src/lib/slots.ts) `daySlots()`:** regra central da agenda: funcionamento − agendamentos ativos (`confirmado`/`concluido`/`no_show`) − bloqueios − reservas temporárias de outros, usando duração por porte + `cleanupMin` + `minAdvanceMin`, em passos de `slotStep`. `staffSel = 'any'` une todos os profissionais. `confirmBooking()` recalcula a grade na hora de confirmar (espelha a futura transação no banco), devolve até 3 alternativas se o horário foi tomado, e é idempotente pelo `holdId` (id `bk-<holdId>`).
- **Reserva temporária:** escolher um horário cria uma reserva de 5 min (`HOLD_MIN`) que some da grade dos outros.
- **Ciclo do agendamento:** `confirmBooking()` cria o agendamento como `pendente` (ocupa o horário, prazo em `respondBy`, `RESPOND_H`). O prestador chama `acceptBooking()` (vira `confirmado` e só então saem confirmação e lembretes) ou `refuseBooking()` com motivo obrigatório (vira `recusado`, tutor recebe 3 horários alternativos). `sweep()` recusa sozinho o que venceu o prazo; roda ao carregar o store e a cada 30 s em `App.tsx`. Remarcar um pendente mantém pendente com novo prazo; remarcar um confirmado não precisa de nova aprovação.
- **Propostas de extra:** `proposeExtra()` sugere outro serviço do prestador para depois do atendimento, no mesmo profissional; `fitsExtension()` em `slots.ts` confere se cabe. Se o tutor aceita (`answerProposal()`), o serviço entra em `booking.extras` e `end` cresce. Use `bookingTotal()` para valores.
- **Prestador:** login e cadastro por código simulado (`ProviderAuth.tsx`); `providerSession` diz quem está no painel. O seed cria uma conta por prestador fictício com o telefone dele (ex.: (11) 4191-0001). Prestador novo começa sem serviços e só aparece no mapa depois de ter um ativo.
- **Mensagens simuladas:** WhatsApp/e-mail (código de login, confirmação, lembretes de 24 h e 2 h, pedido de avaliação, cancelamentos) entram em `state.messages` com `sendAt` futuro; a aba Mensagens mostra as que já "chegaram" (`sendAt <= agora`). `quiet()` joga envios entre 22h e 7h para 21h. Remarcar ou cancelar apaga os lembretes pendentes do agendamento.
- **Rotas — [src/lib/router.ts](src/lib/router.ts):** roteador por hash (`#/caminho?query`) com `useRoute()`, `go()` e `back()`. Rotas em [src/App.tsx](src/App.tsx): `/`, `/p/:slug`, `/agendar/:slug/:serviceId?remarcar=<id>`, `/agendamentos`, `/agendamento/:id` (detalhes), `/mensagens`, `/conta`, `/sobre`, `/prestador`. A barra inferior some no agendamento e no painel do prestador.
- **Mapa:** [src/components/MapView.tsx](src/components/MapView.tsx) com Leaflet; a busca de endereço usa uma lista fixa de lugares em [src/lib/geo.ts](src/lib/geo.ts).
- **Modos de build:** [vite.config.ts](vite.config.ts) troca entre `viteSingleFile` (`--mode single`) e `VitePWA` (padrão).

## Convenções

- Comentários citam regras e histórias da especificação (`RN-21`, `HU-13`, números de seção). Mantenha essas referências ao mexer na lógica.
- Decisões ainda não confirmadas pela especificação são marcadas `[Suposição]` no código e aparecem na interface com a etiqueta `<Sup>` de [src/components/ui.tsx](src/components/ui.tsx). A lista atual (pedido pendente com prazo de resposta de 4 h, raio de 3 km, reserva de 5 min, antecedência de 2 h, cancelamento grátis até 2 h, até 2 remarcações e 3 agendamentos futuros por prestador, comissão de 8% só sobre cliente novo vindo do meuPet etc.) está no [README.md](README.md).
- Datas ficam como strings ISO no estado; use os helpers de [src/lib/dates.ts](src/lib/dates.ts). Formatação de moeda e rótulos fica em [src/lib/labels.ts](src/lib/labels.ts).

## Fase 2 (planejada, segundo o README)

Trocar `store.ts` por Supabase (Postgres + PostGIS + login por telefone), com a confirmação como função no banco e restrição `EXCLUDE USING gist` por profissional e intervalo; mensagens reais pela API do WhatsApp Business; domínio próprio. Mantenha as ações do store com formato que se traduza 1:1 nessas chamadas futuras.
