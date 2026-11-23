-- meuPet: esquema principal (tabelas, regras de acesso e funções do fluxo de agendamento)
--
-- Regras de escrita:
--   * Leitura pública: prestadores (sem telefone), profissionais, serviços, preços, horários e avaliações.
--   * Tutor e prestador editam direto só o próprio cadastro (tutor, pets; dados, serviços, horários e bloqueios do prestador).
--   * Agendamentos, reservas, propostas, avaliações e mensagens só mudam pelas funções abaixo,
--     que conferem tudo numa transação. A restrição de exclusão impede dois agendamentos
--     sobrepostos no mesmo profissional (RN-21).
--   * Horários do prestador ficam em minutos desde 0h no fuso de São Paulo (como no app).

create extension if not exists btree_gist;

-- ---------------------------------------------------------------- tabelas

create table public.prestadores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  tipos text[] not null default '{}',
  descricao text not null default '',
  endereco text not null,
  bairro text not null,
  telefone text not null,
  lat double precision not null,
  lng double precision not null,
  passo_min int not null default 30 check (passo_min in (15, 30)),
  limpeza_min int not null default 15 check (limpeza_min between 0 and 120),
  antecedencia_min int not null default 120 check (antecedencia_min between 0 and 4320),
  janela_cancelamento_h int not null default 2 check (janela_cancelamento_h between 2 and 48),
  pausado_ate date,
  pagamentos text[] not null default '{Pix,"Cartão de crédito","Cartão de débito"}',
  cor text not null default '#0ea5e9',
  emoji text not null default '🐾',
  criado_em timestamptz not null default now()
);

create table public.profissionais (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores on delete cascade,
  nome text not null,
  ordem int not null default 0,
  ativo boolean not null default true
);
create index on public.profissionais (prestador_id);

create table public.membros_prestador (
  prestador_id uuid not null references public.prestadores on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  papel text not null default 'dono' check (papel in ('dono', 'equipe')),
  primary key (prestador_id, user_id)
);
create index on public.membros_prestador (user_id);

create table public.servicos (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('banho_tosa', 'veterinario', 'petshop', 'adestramento', 'hotel', 'creche')),
  especies text[] not null default '{cao,gato}',
  preco_a_partir boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
create index on public.servicos (prestador_id);

create table public.servico_portes (
  servico_id uuid not null references public.servicos on delete cascade,
  porte text not null check (porte in ('mini', 'pequeno', 'medio', 'grande', 'gigante')),
  duracao_min int not null check (duracao_min between 5 and 600),
  preco numeric(10, 2) check (preco >= 0), -- null = valor no local
  primary key (servico_id, porte)
);

create table public.horarios (
  prestador_id uuid not null references public.prestadores on delete cascade,
  dia_semana int not null check (dia_semana between 0 and 6), -- 0 = domingo
  abre_min int not null check (abre_min between 0 and 1440),
  fecha_min int not null check (fecha_min between 0 and 1440),
  primary key (prestador_id, dia_semana),
  check (fecha_min > abre_min)
);

create table public.tutores (
  id uuid primary key references auth.users on delete cascade,
  nome text not null,
  telefone text not null,
  email text not null,
  consentimento_whatsapp boolean not null default false,
  canal_whatsapp boolean not null default true,
  canal_email boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.tutores on delete cascade,
  nome text not null,
  especie text not null check (especie in ('cao', 'gato', 'outro')),
  porte text not null check (porte in ('mini', 'pequeno', 'medio', 'grande', 'gigante')),
  raca text,
  arquivado boolean not null default false,
  criado_em timestamptz not null default now()
);
create index on public.pets (tutor_id);

create table public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores,
  servico_id uuid not null references public.servicos,
  profissional_id uuid not null references public.profissionais,
  inicio timestamptz not null,
  fim timestamptz not null,
  -- período ocupado na agenda, com a limpeza; mantido pelo gatilho
  ocupa tstzrange not null,
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'recusado', 'concluido', 'no_show', 'cancelado_tutor', 'cancelado_prestador')),
  origem text not null check (origem in ('marketplace', 'agenda_prestador')),
  tutor_id uuid references public.tutores,
  pet_id uuid references public.pets,
  cliente_nome text, -- cliente lançado pelo prestador, fora do app
  pet_nome text,
  porte text not null check (porte in ('mini', 'pequeno', 'medio', 'grande', 'gigante')),
  preco numeric(10, 2),
  observacoes text not null default '',
  cliente_novo boolean not null default false,
  remarcacoes int not null default 0,
  prazo_resposta timestamptz,
  motivo_recusa text,
  motivo_cancelamento text,
  cancelamento_tardio boolean not null default false,
  presenca_confirmada boolean not null default false,
  reserva_id uuid unique, -- deixa o pedido idempotente
  criado_em timestamptz not null default now(),
  check (fim > inicio),
  check (origem = 'agenda_prestador' or (tutor_id is not null and pet_id is not null)),
  constraint sem_sobreposicao exclude using gist (profissional_id with =, ocupa with &&)
    where (status in ('pendente', 'confirmado', 'concluido', 'no_show'))
);
create index on public.agendamentos (prestador_id, inicio);
create index on public.agendamentos (tutor_id, inicio);
create index on public.agendamentos (status, prazo_resposta) where status = 'pendente';

-- Serviço extra sugerido pelo prestador. Os aceitos são os extras do agendamento.
create table public.propostas (
  id uuid primary key default gen_random_uuid(),
  agendamento_id uuid not null references public.agendamentos on delete cascade,
  prestador_id uuid not null references public.prestadores,
  servico_id uuid not null references public.servicos,
  nome text not null,
  preco numeric(10, 2),
  duracao_min int not null,
  nota text not null default '',
  status text not null default 'pendente' check (status in ('pendente', 'aceita', 'recusada', 'expirada')),
  criado_em timestamptz not null default now(),
  respondida_em timestamptz
);
create index on public.propostas (agendamento_id);

create table public.bloqueios (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores on delete cascade,
  profissional_id uuid references public.profissionais on delete cascade, -- null = todos
  inicio timestamptz not null,
  fim timestamptz not null,
  rotulo text not null default 'Bloqueado',
  check (fim > inicio)
);
create index on public.bloqueios (prestador_id, inicio);

create table public.reservas_temporarias (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores on delete cascade,
  profissional_id uuid not null references public.profissionais on delete cascade,
  tutor_id uuid not null references auth.users on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null, -- já inclui a limpeza
  expira_em timestamptz not null
);
create index on public.reservas_temporarias (profissional_id, expira_em);

create table public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  prestador_id uuid not null references public.prestadores on delete cascade,
  agendamento_id uuid unique references public.agendamentos on delete set null,
  autor text not null,
  estrelas int not null check (estrelas between 1 and 5),
  texto text not null default '',
  resposta text,
  criado_em timestamptz not null default now()
);
create index on public.avaliacoes (prestador_id);

-- Caixa de saída. Hoje o app mostra; na fase do WhatsApp/e-mail um worker envia o que venceu `enviar_em`.
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  destino text not null check (destino in ('tutor', 'prestador')),
  tutor_id uuid references public.tutores on delete cascade,
  prestador_id uuid references public.prestadores on delete cascade,
  agendamento_id uuid references public.agendamentos on delete cascade,
  proposta_id uuid references public.propostas on delete cascade,
  canal text not null check (canal in ('whatsapp', 'email')),
  tipo text not null,
  enviar_em timestamptz not null default now(),
  enviada_em timestamptz,
  titulo text not null,
  corpo text not null,
  acoes text[] not null default '{}'
);
create index on public.mensagens (tutor_id, enviar_em);
create index on public.mensagens (prestador_id, enviar_em);
create index on public.mensagens (enviada_em, enviar_em) where enviada_em is null;

-- ---------------------------------------------------------------- utilidades

create function public.sp(ts timestamptz) returns timestamp
language sql immutable as $$ select ts at time zone 'America/Sao_Paulo' $$;

create function public.quando(ts timestamptz) returns text
language sql immutable as $$ select to_char(public.sp(ts), 'DD/MM "às" HH24:MI') $$;

-- RN-33: nada entre 22h e 7h; joga para as 21h
create function public.fora_do_silencio(ts timestamptz) returns timestamptz
language sql immutable as $$
  select case
    when extract(hour from public.sp(ts)) >= 22 then (date_trunc('day', public.sp(ts)) + interval '21 hours') at time zone 'America/Sao_Paulo'
    when extract(hour from public.sp(ts)) < 7 then (date_trunc('day', public.sp(ts)) - interval '3 hours') at time zone 'America/Sao_Paulo'
    else ts end
$$;

create function public.preco_txt(v numeric) returns text
language sql immutable as $$ select case when v is null then 'valor no local' else 'R$ ' || to_char(v, 'FM999G990') end $$;

create function public.eh_membro(p_prestador uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membros_prestador where prestador_id = p_prestador and user_id = auth.uid())
$$;

-- mantém `ocupa` = [inicio, fim + limpeza)
create function public.tg_agendamento_ocupa() returns trigger
language plpgsql as $$
begin
  new.ocupa := tstzrange(new.inicio, new.fim + make_interval(mins => (select limpeza_min from prestadores where id = new.prestador_id)), '[)');
  return new;
end $$;
create trigger agendamento_ocupa before insert or update of inicio, fim, prestador_id on public.agendamentos
  for each row execute function public.tg_agendamento_ocupa();

-- o período cabe no horário de funcionamento do dia e respeita a grade (passo)?
create function public.dentro_do_horario(p_prestador uuid, p_inicio timestamptz, p_fim timestamptz) returns boolean
language sql stable set search_path = public as $$
  select exists (
    select 1 from horarios h join prestadores p on p.id = h.prestador_id
    where h.prestador_id = p_prestador
      and h.dia_semana = extract(dow from sp(p_inicio))::int
      and sp(p_inicio)::date = sp(p_fim - interval '1 second')::date
      and extract(hour from sp(p_inicio)) * 60 + extract(minute from sp(p_inicio)) >= h.abre_min
      and (extract(epoch from sp(p_fim) - date_trunc('day', sp(p_inicio))) / 60) <= h.fecha_min
      and ((extract(hour from sp(p_inicio)) * 60 + extract(minute from sp(p_inicio)))::int - h.abre_min) % p.passo_min = 0
  )
$$;

-- o profissional está livre em [p_de, p_ate)? (agendamentos, bloqueios e reservas de outros)
create function public.profissional_livre(p_prof uuid, p_de timestamptz, p_ate timestamptz, p_ignorar_agendamento uuid default null, p_ignorar_reserva uuid default null)
returns boolean language sql stable set search_path = public as $$
  select not exists (
      select 1 from agendamentos a
      where a.profissional_id = p_prof and a.status in ('pendente', 'confirmado', 'concluido', 'no_show')
        and a.ocupa && tstzrange(p_de, p_ate, '[)') and a.id is distinct from p_ignorar_agendamento)
    and not exists (
      select 1 from bloqueios b join profissionais f on f.id = p_prof
      where b.prestador_id = f.prestador_id and (b.profissional_id is null or b.profissional_id = p_prof)
        and tstzrange(b.inicio, b.fim, '[)') && tstzrange(p_de, p_ate, '[)'))
    and not exists (
      select 1 from reservas_temporarias r
      where r.profissional_id = p_prof and r.expira_em > now() and r.id is distinct from p_ignorar_reserva
        and tstzrange(r.inicio, r.fim, '[)') && tstzrange(p_de, p_ate, '[)'))
$$;

create function public.msg(p_destino text, p_tutor uuid, p_prestador uuid, p_agendamento uuid, p_tipo text, p_titulo text, p_corpo text,
  p_acoes text[] default '{}', p_enviar_em timestamptz default now(), p_canal text default 'whatsapp', p_proposta uuid default null)
returns void language sql set search_path = public as $$
  insert into mensagens (destino, tutor_id, prestador_id, agendamento_id, proposta_id, canal, tipo, enviar_em, titulo, corpo, acoes)
  values (p_destino, p_tutor, p_prestador, p_agendamento, p_proposta, p_canal, p_tipo, p_enviar_em, p_titulo, p_corpo, p_acoes)
$$;

create function public.resumo(a agendamentos) returns text
language sql stable set search_path = public as $$
  select s.nome || coalesce((select ' + ' || string_agg(lower(x.nome), ' + ') from propostas x where x.agendamento_id = a.id and x.status = 'aceita'), '')
    || ' do ' || coalesce(pt.nome, a.pet_nome, 'pet') || ' no ' || p.nome || ', ' || quando(a.inicio)
  from servicos s join prestadores p on p.id = s.prestador_id left join pets pt on pt.id = a.pet_id
  where s.id = a.servico_id
$$;

-- confirmação (WhatsApp + e-mail) e lembretes de 24 h, 2 h e avaliação (seção 7)
create function public.agendar_lembretes(a agendamentos, p_titulo text) returns void
language plpgsql set search_path = public as $$
declare p prestadores;
begin
  select * into p from prestadores where id = a.prestador_id;
  perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'confirmacao', p_titulo,
    resumo(a) || E'.\n' || p.endereco || ', ' || p.bairro || '. Contato: ' || p.telefone || E'.\nCancelamento sem custo até ' || p.janela_cancelamento_h || ' h antes. Pagamento no local.',
    '{remarcar,cancelar}');
  perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'confirmacao', 'Comprovante do agendamento', 'Cópia por e-mail com o arquivo .ics para a sua agenda.', '{}', now(), 'email');
  if a.inicio - now() >= interval '24 hours' then -- RN-34
    perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'lembrete24', 'Lembrete de amanhã', resumo(a) || '. Você confirma presença?',
      '{confirmar,remarcar,cancelar}', fora_do_silencio(a.inicio - interval '24 hours'));
  end if;
  if a.inicio - now() >= interval '2 hours' then
    perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'lembrete2', 'Daqui a 2 horas', resumo(a) || '. ' || p.endereco || '.',
      '{ver,cancelar}', fora_do_silencio(a.inicio - interval '2 hours'));
  end if;
  perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'avaliacao', 'Como foi?', 'Conte como foi: ' || resumo(a) || '.', '{avaliar}', fora_do_silencio(a.fim + interval '2 hours'));
end $$;

create function public.apagar_lembretes(p_agendamento uuid) returns void
language sql set search_path = public as $$
  delete from mensagens where agendamento_id = p_agendamento and destino = 'tutor' and enviar_em > now() and enviada_em is null
$$;

create function public.expirar_propostas(p_agendamento uuid) returns void
language sql set search_path = public as $$
  update propostas set status = 'expirada' where agendamento_id = p_agendamento and status = 'pendente'
$$;

create function public.avisar_pedido(a agendamentos, p_remarcado boolean) returns void
language plpgsql set search_path = public as $$
declare p prestadores; t tutores;
begin
  select * into p from prestadores where id = a.prestador_id;
  select * into t from tutores where id = a.tutor_id;
  perform msg('tutor', a.tutor_id, a.prestador_id, a.id, 'pedido', case when p_remarcado then 'Novo horário pedido ⏳' else 'Pedido enviado ⏳' end,
    resumo(a) || E'.\nO horário fica reservado para você. ' || p.nome || ' responde até ' || quando(a.prazo_resposta) || '; se não responder, o pedido é cancelado e avisamos.',
    '{cancelar}');
  perform msg('prestador', a.tutor_id, a.prestador_id, a.id, 'pedido', case when p_remarcado then 'Pedido remarcado pelo tutor' else 'Novo pedido pelo meuPet' end,
    t.nome || ' pediu ' || resumo(a) || '. Responda até ' || quando(a.prazo_resposta) || '.');
end $$;

-- ---------------------------------------------------------------- leitura pública da agenda

-- intervalos ocupados de cada profissional, sem dados pessoais (o app calcula a grade com isso)
create function public.ocupacao(p_prestador uuid, p_de timestamptz, p_ate timestamptz)
returns table (profissional_id uuid, inicio timestamptz, fim timestamptz)
language sql stable security definer set search_path = public as $$
  select a.profissional_id, lower(a.ocupa), upper(a.ocupa) from agendamentos a
   where a.prestador_id = p_prestador and a.status in ('pendente', 'confirmado', 'concluido', 'no_show')
     and a.ocupa && tstzrange(p_de, p_ate, '[)')
  union all
  select f.id, b.inicio, b.fim from bloqueios b join profissionais f on f.prestador_id = b.prestador_id and (b.profissional_id is null or b.profissional_id = f.id)
   where b.prestador_id = p_prestador and tstzrange(b.inicio, b.fim, '[)') && tstzrange(p_de, p_ate, '[)')
  union all
  select r.profissional_id, r.inicio, r.fim from reservas_temporarias r
   where r.prestador_id = p_prestador and r.expira_em > now() and (r.tutor_id is distinct from auth.uid())
     and tstzrange(r.inicio, r.fim, '[)') && tstzrange(p_de, p_ate, '[)')
$$;

-- telefone do prestador: só para quem tem agendamento confirmado com ele, ou para a equipe
create function public.contato_prestador(p_prestador uuid) returns text
language sql stable security definer set search_path = public as $$
  select p.telefone from prestadores p
   where p.id = p_prestador and (eh_membro(p.id) or exists (
     select 1 from agendamentos a where a.prestador_id = p.id and a.tutor_id = auth.uid() and a.status in ('confirmado', 'concluido', 'no_show')))
$$;

-- ---------------------------------------------------------------- tutor

-- RN-20: segura o horário por 5 min enquanto o tutor confirma [Suposição]
create function public.criar_reserva(p_profissional uuid, p_inicio timestamptz, p_fim timestamptz) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_id uuid; f profissionais; p prestadores;
begin
  if auth.uid() is null then raise exception 'login' using errcode = 'P0001'; end if;
  select * into f from profissionais where id = p_profissional and ativo;
  if not found then raise exception 'profissional_invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = f.prestador_id;
  delete from reservas_temporarias where expira_em <= now() or (tutor_id = auth.uid());
  insert into reservas_temporarias (prestador_id, profissional_id, tutor_id, inicio, fim, expira_em)
  values (p.id, f.id, auth.uid(), p_inicio, p_fim + make_interval(mins => p.limpeza_min), now() + interval '5 minutes')
  returning id into v_id;
  return v_id;
end $$;

create function public.liberar_reserva(p_reserva uuid) returns void
language sql security definer set search_path = public as $$
  delete from reservas_temporarias where id = p_reserva and tutor_id = auth.uid()
$$;

/**
 * Pedido do tutor (RN-19/21). Nasce "pendente" e segura o horário até o prestador responder.
 * p_profissional null = qualquer profissional livre (HU-13). p_remarcar = id do agendamento a remarcar:
 * pendente continua pendente com novo prazo; confirmado continua confirmado [Suposição].
 * Erros (mensagem): login, servico_indisponivel, agenda_pausada, pet_invalido, remarcacao_invalida,
 * limite_remarcacoes, limite, antecedencia, fora_do_horario, ocupado.
 */
create function public.pedir_agendamento(p_servico uuid, p_inicio timestamptz, p_pet uuid, p_profissional uuid default null,
  p_observacoes text default '', p_reserva uuid default null, p_remarcar uuid default null)
returns agendamentos language plpgsql security definer set search_path = public as $$
declare
  v_tutor uuid := auth.uid();
  s servicos; p prestadores; pt pets; v_old agendamentos; v_ag agendamentos;
  v_dur int; v_preco numeric; v_extra int := 0; v_fim timestamptz; v_prof uuid; v_cand uuid;
begin
  if v_tutor is null or not exists (select 1 from tutores where id = v_tutor) then raise exception 'login' using errcode = 'P0001'; end if;
  if p_reserva is not null and p_remarcar is null then
    select * into v_ag from agendamentos where reserva_id = p_reserva and tutor_id = v_tutor;
    if found then return v_ag; end if;
  end if;
  select * into s from servicos where id = p_servico and ativo;
  if not found then raise exception 'servico_indisponivel' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = s.prestador_id;
  if p.pausado_ate is not null and p.pausado_ate >= sp(p_inicio)::date then raise exception 'agenda_pausada' using errcode = 'P0001'; end if;
  select * into pt from pets where id = p_pet and tutor_id = v_tutor and not arquivado;
  if not found or not (pt.especie = any (s.especies)) then raise exception 'pet_invalido' using errcode = 'P0001'; end if;
  select duracao_min, preco into v_dur, v_preco from servico_portes where servico_id = s.id and porte = pt.porte;
  if v_dur is null then raise exception 'servico_indisponivel' using errcode = 'P0001'; end if;

  if p_remarcar is not null then
    select * into v_old from agendamentos where id = p_remarcar and tutor_id = v_tutor for update;
    if not found or v_old.status not in ('pendente', 'confirmado') or v_old.inicio <= now() or v_old.servico_id <> s.id then
      raise exception 'remarcacao_invalida' using errcode = 'P0001'; end if;
    if v_old.remarcacoes >= 2 then raise exception 'limite_remarcacoes' using errcode = 'P0001'; end if; -- RN-27
    select coalesce(sum(duracao_min), 0) into v_extra from propostas where agendamento_id = v_old.id and status = 'aceita';
  elsif (select count(*) from agendamentos where tutor_id = v_tutor and prestador_id = p.id and status in ('pendente', 'confirmado') and inicio > now()) >= 3 then
    raise exception 'limite' using errcode = 'P0001'; -- RN-25
  end if;

  if p_inicio < now() + make_interval(mins => p.antecedencia_min) then raise exception 'antecedencia' using errcode = 'P0001'; end if; -- RN-14
  v_fim := p_inicio + make_interval(mins => v_dur + v_extra);
  if not dentro_do_horario(p.id, p_inicio, v_fim) then raise exception 'fora_do_horario' using errcode = 'P0001'; end if;

  -- trava os profissionais do prestador para serializar pedidos simultâneos
  for v_cand in select id from profissionais where prestador_id = p.id and ativo and (p_profissional is null or id = p_profissional) order by ordem, nome for update loop
    if profissional_livre(v_cand, p_inicio, v_fim + make_interval(mins => p.limpeza_min), p_remarcar, p_reserva) then v_prof := v_cand; exit; end if;
  end loop;
  if v_prof is null then raise exception 'ocupado' using errcode = 'P0001'; end if;
  delete from reservas_temporarias where id = p_reserva;

  if v_old.id is not null then
    update agendamentos set inicio = p_inicio, fim = v_fim, profissional_id = v_prof, remarcacoes = remarcacoes + 1, presenca_confirmada = false,
      prazo_resposta = case when status = 'pendente' then least(now() + interval '4 hours', p_inicio - interval '1 hour') end
     where id = v_old.id returning * into v_ag;
    perform expirar_propostas(v_ag.id);
    perform apagar_lembretes(v_ag.id);
    if v_ag.status = 'pendente' then
      perform avisar_pedido(v_ag, true);
    else
      perform agendar_lembretes(v_ag, 'Horário alterado ✅');
      perform msg('prestador', v_tutor, p.id, v_ag.id, 'remarcacao', 'Agendamento remarcado pelo tutor', resumo(v_ag) || '.');
    end if;
  else
    insert into agendamentos (prestador_id, servico_id, profissional_id, inicio, fim, ocupa, status, origem, tutor_id, pet_id, porte, preco,
      observacoes, cliente_novo, prazo_resposta, reserva_id)
    values (p.id, s.id, v_prof, p_inicio, v_fim, tstzrange(p_inicio, v_fim), 'pendente', 'marketplace', v_tutor, pt.id, pt.porte, v_preco,
      coalesce(p_observacoes, ''),
      not exists (select 1 from agendamentos where prestador_id = p.id and tutor_id = v_tutor and status in ('confirmado', 'concluido', 'no_show')),
      least(now() + interval '4 hours', p_inicio - interval '1 hour'), -- prazo de resposta [Suposição]
      p_reserva)
    returning * into v_ag;
    perform avisar_pedido(v_ag, false);
  end if;
  return v_ag;
exception when exclusion_violation then
  raise exception 'ocupado' using errcode = 'P0001';
end $$;

create function public.cancelar_pelo_tutor(p_agendamento uuid, p_motivo text default '') returns agendamentos
language plpgsql security definer set search_path = public as $$
declare a agendamentos; p prestadores; v_pendente boolean;
begin
  select * into a from agendamentos where id = p_agendamento and tutor_id = auth.uid() for update;
  if not found or a.status not in ('pendente', 'confirmado') then raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = a.prestador_id;
  v_pendente := a.status = 'pendente';
  update agendamentos set status = 'cancelado_tutor', motivo_cancelamento = nullif(p_motivo, ''), prazo_resposta = null,
    cancelamento_tardio = not v_pendente and inicio - now() < make_interval(hours => p.janela_cancelamento_h) -- RN-26
   where id = a.id returning * into a;
  perform apagar_lembretes(a.id);
  perform expirar_propostas(a.id);
  perform msg('prestador', a.tutor_id, a.prestador_id, a.id, 'cancel_tutor', case when v_pendente then 'Pedido retirado pelo tutor' else 'Agendamento cancelado pelo tutor' end,
    quando(a.inicio) || '. Motivo: ' || coalesce(nullif(p_motivo, ''), 'não informado') || '. O horário voltou para a agenda.');
  return a;
end $$;

create function public.confirmar_presenca(p_agendamento uuid) returns void
language sql security definer set search_path = public as $$
  update agendamentos set presenca_confirmada = true where id = p_agendamento and tutor_id = auth.uid() and status = 'confirmado'
$$;

-- resposta do tutor a um extra. Retorna 'ok' ou 'nao_cabe' (o extra deixa de valer se não cabe mais).
create function public.responder_proposta(p_proposta uuid, p_aceitar boolean) returns text
language plpgsql security definer set search_path = public as $$
declare x propostas; a agendamentos; p prestadores; t tutores;
begin
  select * into x from propostas where id = p_proposta for update;
  select * into a from agendamentos where id = x.agendamento_id and tutor_id = auth.uid() for update;
  if x.id is null or a.id is null or x.status <> 'pendente' or a.status not in ('pendente', 'confirmado') then raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = a.prestador_id;
  select * into t from tutores where id = a.tutor_id;
  if p_aceitar and not (dentro_do_horario(p.id, a.inicio, a.fim + make_interval(mins => x.duracao_min))
       and profissional_livre(a.profissional_id, a.fim, a.fim + make_interval(mins => x.duracao_min + p.limpeza_min), a.id)) then
    update propostas set status = 'expirada', respondida_em = now() where id = x.id;
    return 'nao_cabe';
  end if;
  update propostas set status = case when p_aceitar then 'aceita' else 'recusada' end, respondida_em = now() where id = x.id;
  if p_aceitar then
    update agendamentos set fim = fim + make_interval(mins => x.duracao_min) where id = a.id returning * into a;
  end if;
  perform msg('prestador', a.tutor_id, p.id, a.id, 'proposta_resposta',
    split_part(t.nome, ' ', 1) || case when p_aceitar then ' aceitou o extra ✅' else ' recusou o extra' end,
    x.nome || ' em ' || quando(a.inicio) || '.' || case when p_aceitar then ' O atendimento agora termina às ' || to_char(sp(a.fim), 'HH24:MI') || '.' else '' end,
    '{}', now(), 'whatsapp', x.id);
  return 'ok';
end $$;

create function public.avaliar(p_agendamento uuid, p_estrelas int, p_texto text default '') returns void
language plpgsql security definer set search_path = public as $$
declare a agendamentos; t tutores;
begin
  select * into a from agendamentos where id = p_agendamento and tutor_id = auth.uid() and status = 'concluido';
  if not found then raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into t from tutores where id = a.tutor_id;
  insert into avaliacoes (prestador_id, agendamento_id, autor, estrelas, texto) values (a.prestador_id, a.id, split_part(t.nome, ' ', 1), p_estrelas, coalesce(p_texto, ''));
end $$;

-- ---------------------------------------------------------------- prestador

-- cadastro do negócio pelo usuário logado; entra sem serviços (só aparece no mapa com um serviço ativo, RN-01)
create function public.cadastrar_prestador(p_nome text, p_tipos text[], p_telefone text, p_endereco text, p_bairro text,
  p_lat double precision, p_lng double precision, p_profissionais text[] default '{}', p_descricao text default '')
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_slug text; v_nome text; i int := 0;
begin
  if auth.uid() is null then raise exception 'login' using errcode = 'P0001'; end if;
  v_slug := trim(both '-' from regexp_replace(lower(translate(p_nome, 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')), '[^a-z0-9]+', '-', 'g'));
  if v_slug = '' then v_slug := 'prestador'; end if;
  if exists (select 1 from prestadores where slug = v_slug) then v_slug := v_slug || '-' || substr(md5(random()::text), 1, 4); end if;
  insert into prestadores (slug, nome, tipos, descricao, endereco, bairro, telefone, lat, lng)
  values (v_slug, trim(p_nome), p_tipos, coalesce(p_descricao, ''), trim(p_endereco), p_bairro, p_telefone, p_lat, p_lng) returning id into v_id;
  insert into membros_prestador (prestador_id, user_id, papel) values (v_id, auth.uid(), 'dono');
  foreach v_nome in array (case when cardinality(p_profissionais) > 0 then p_profissionais else array['Equipe'] end) loop
    insert into profissionais (prestador_id, nome, ordem) values (v_id, v_nome, i); i := i + 1;
  end loop;
  insert into horarios (prestador_id, dia_semana, abre_min, fecha_min)
  select v_id, d, 480, case when d = 6 then 840 else 1080 end from generate_series(1, 6) d;
  return v_id;
end $$;

create function public.aceitar_agendamento(p_agendamento uuid) returns agendamentos
language plpgsql security definer set search_path = public as $$
declare a agendamentos; p prestadores;
begin
  select * into a from agendamentos where id = p_agendamento for update;
  if not found or not eh_membro(a.prestador_id) or a.status <> 'pendente' then raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = a.prestador_id;
  update agendamentos set status = 'confirmado', prazo_resposta = null where id = a.id returning * into a;
  perform agendar_lembretes(a, p.nome || ' aceitou seu pedido ✅');
  return a;
end $$;

-- usada pela recusa do prestador e pela recusa automática quando vence o prazo
create function public._recusar(p_agendamento uuid, p_motivo text, p_auto boolean) returns void
language plpgsql set search_path = public as $$
declare a agendamentos; p prestadores;
begin
  update agendamentos set status = 'recusado', motivo_recusa = p_motivo, prazo_resposta = null
   where id = p_agendamento and status = 'pendente' returning * into a;
  if a.id is null then return; end if;
  select * into p from prestadores where id = a.prestador_id;
  perform apagar_lembretes(a.id);
  perform expirar_propostas(a.id);
  perform msg('tutor', a.tutor_id, p.id, a.id, 'recusa',
    case when p_auto then p.nome || ' não respondeu a tempo' else p.nome || ' não pôde aceitar seu pedido' end,
    resumo(a) || case when p_auto then '' else E'.\nMotivo: ' || p_motivo end || E'.\nVeja os horários livres mais próximos no app.', '{remarcar}');
end $$;

create function public.recusar_agendamento(p_agendamento uuid, p_motivo text) returns void
language plpgsql security definer set search_path = public as $$
declare a agendamentos;
begin
  select * into a from agendamentos where id = p_agendamento for update;
  if not found or not eh_membro(a.prestador_id) or a.status <> 'pendente' then raise exception 'invalido' using errcode = 'P0001'; end if;
  if coalesce(trim(p_motivo), '') = '' then raise exception 'motivo_obrigatorio' using errcode = 'P0001'; end if;
  perform _recusar(a.id, trim(p_motivo), false);
end $$;

-- roda pelo pg_cron (ver migração de agendamento): pedidos vencidos e propostas de horários que já passaram
create function public.expirar_pedidos() returns int
language plpgsql security definer set search_path = public as $$
declare v_id uuid; n int := 0;
begin
  for v_id in select id from agendamentos where status = 'pendente' and prazo_resposta <= now() for update skip locked loop
    perform _recusar(v_id, 'Sem resposta do prestador no prazo', true); n := n + 1;
  end loop;
  update propostas x set status = 'expirada' from agendamentos a where a.id = x.agendamento_id and x.status = 'pendente' and a.inicio <= now();
  delete from reservas_temporarias where expira_em <= now() - interval '1 hour';
  return n;
end $$;

-- RN-30: cancelar um confirmado avisa o tutor
create function public.cancelar_pelo_prestador(p_agendamento uuid, p_motivo text default '') returns void
language plpgsql security definer set search_path = public as $$
declare a agendamentos; p prestadores;
begin
  select * into a from agendamentos where id = p_agendamento for update;
  if not found or not eh_membro(a.prestador_id) or a.status <> 'confirmado' then raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = a.prestador_id;
  update agendamentos set status = 'cancelado_prestador', motivo_cancelamento = nullif(p_motivo, '') where id = a.id;
  perform apagar_lembretes(a.id);
  perform expirar_propostas(a.id);
  if a.origem = 'marketplace' then
    perform msg('tutor', a.tutor_id, p.id, a.id, 'cancel_prestador', p.nome || ' cancelou seu horário',
      'O horário de ' || quando(a.inicio) || ' foi cancelado' || coalesce(' (' || nullif(p_motivo, '') || ')', '') || E'.\nVeja os horários livres mais próximos no app.', '{remarcar}');
  end if;
end $$;

create function public.marcar_atendimento(p_agendamento uuid, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_status not in ('concluido', 'no_show') then raise exception 'invalido' using errcode = 'P0001'; end if;
  update agendamentos set status = p_status
   where id = p_agendamento and status = 'confirmado' and inicio <= now() and eh_membro(prestador_id);
  if not found then raise exception 'invalido' using errcode = 'P0001'; end if;
end $$;

-- sugere outro serviço do prestador para logo depois do atendimento, com o mesmo profissional
create function public.sugerir_extra(p_agendamento uuid, p_servico uuid, p_nota text default '') returns propostas
language plpgsql security definer set search_path = public as $$
declare a agendamentos; s servicos; p prestadores; pt pets; x propostas; v_dur int; v_preco numeric;
begin
  select * into a from agendamentos where id = p_agendamento;
  if not found or not eh_membro(a.prestador_id) or a.status not in ('pendente', 'confirmado') or a.inicio <= now() or a.origem <> 'marketplace' then
    raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into s from servicos where id = p_servico and prestador_id = a.prestador_id and ativo and id <> a.servico_id;
  select * into pt from pets where id = a.pet_id;
  if s.id is null or not (pt.especie = any (s.especies))
     or exists (select 1 from propostas where agendamento_id = a.id and servico_id = s.id and status in ('pendente', 'aceita')) then
    raise exception 'invalido' using errcode = 'P0001'; end if;
  select duracao_min, preco into v_dur, v_preco from servico_portes where servico_id = s.id and porte = a.porte;
  select * into p from prestadores where id = a.prestador_id;
  if not (dentro_do_horario(p.id, a.inicio, a.fim + make_interval(mins => v_dur))
          and profissional_livre(a.profissional_id, a.fim, a.fim + make_interval(mins => v_dur + p.limpeza_min), a.id)) then
    raise exception 'nao_cabe' using errcode = 'P0001'; end if;
  insert into propostas (agendamento_id, prestador_id, servico_id, nome, preco, duracao_min, nota)
  values (a.id, p.id, s.id, s.nome, v_preco, v_dur, coalesce(trim(p_nota), '')) returning * into x;
  perform msg('tutor', a.tutor_id, p.id, a.id, 'proposta', p.nome || ' sugeriu um extra',
    s.nome || ' para o ' || pt.nome || ' junto com o atendimento de ' || quando(a.inicio) || ': +' || preco_txt(v_preco) || ', +' || v_dur || ' min.'
      || coalesce(E'\n“' || nullif(x.nota, '') || '”', ''),
    '{aceitar_extra,recusar_extra}', now(), 'whatsapp', x.id);
  return x;
end $$;

-- cliente que marcou por WhatsApp ou no balcão: ocupa a agenda para ela continuar real
create function public.lancar_cliente_externo(p_servico uuid, p_profissional uuid, p_inicio timestamptz, p_porte text, p_cliente text, p_pet text)
returns agendamentos language plpgsql security definer set search_path = public as $$
declare s servicos; p prestadores; v_dur int; v_preco numeric; a agendamentos;
begin
  select * into s from servicos where id = p_servico;
  if not found or not eh_membro(s.prestador_id) or not exists (select 1 from profissionais where id = p_profissional and prestador_id = s.prestador_id) then
    raise exception 'invalido' using errcode = 'P0001'; end if;
  select * into p from prestadores where id = s.prestador_id;
  select duracao_min, preco into v_dur, v_preco from servico_portes where servico_id = s.id and porte = p_porte;
  perform 1 from profissionais where id = p_profissional for update;
  if not profissional_livre(p_profissional, p_inicio, p_inicio + make_interval(mins => v_dur + p.limpeza_min)) then raise exception 'ocupado' using errcode = 'P0001'; end if;
  insert into agendamentos (prestador_id, servico_id, profissional_id, inicio, fim, ocupa, status, origem, cliente_nome, pet_nome, porte, preco)
  values (p.id, s.id, p_profissional, p_inicio, p_inicio + make_interval(mins => v_dur), tstzrange(p_inicio, p_inicio + make_interval(mins => v_dur)),
    'confirmado', 'agenda_prestador', coalesce(nullif(trim(p_cliente), ''), 'Cliente'), coalesce(nullif(trim(p_pet), ''), 'Pet'), p_porte, v_preco)
  returning * into a;
  return a;
exception when exclusion_violation then
  raise exception 'ocupado' using errcode = 'P0001';
end $$;

-- pausa (férias, reforma): pedidos viram recusa e confirmados viram cancelamento com aviso
create function public.pausar_agenda(p_prestador uuid, p_ate date) returns void
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not eh_membro(p_prestador) then raise exception 'invalido' using errcode = 'P0001'; end if;
  update prestadores set pausado_ate = p_ate where id = p_prestador;
  if p_ate is null then return; end if;
  for v_id in select id from agendamentos where prestador_id = p_prestador and status = 'pendente' and sp(inicio)::date <= p_ate loop
    perform _recusar(v_id, 'Agenda pausada', false);
  end loop;
  for v_id in select id from agendamentos where prestador_id = p_prestador and status = 'confirmado' and inicio > now() and sp(inicio)::date <= p_ate loop
    perform cancelar_pelo_prestador(v_id, 'agenda pausada');
  end loop;
end $$;

-- ---------------------------------------------------------------- permissões

-- funções internas não ficam expostas na API
revoke execute on function public._recusar(uuid, text, boolean), public.expirar_pedidos(), public.agendar_lembretes(agendamentos, text),
  public.avisar_pedido(agendamentos, boolean), public.msg(text, uuid, uuid, uuid, text, text, text, text[], timestamptz, text, uuid),
  public.apagar_lembretes(uuid), public.expirar_propostas(uuid), public.tg_agendamento_ocupa()
  from public, anon, authenticated;

alter table public.prestadores enable row level security;
alter table public.profissionais enable row level security;
alter table public.membros_prestador enable row level security;
alter table public.servicos enable row level security;
alter table public.servico_portes enable row level security;
alter table public.horarios enable row level security;
alter table public.tutores enable row level security;
alter table public.pets enable row level security;
alter table public.agendamentos enable row level security;
alter table public.propostas enable row level security;
alter table public.bloqueios enable row level security;
alter table public.reservas_temporarias enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.mensagens enable row level security;

-- catálogo público
create policy leitura_publica on public.prestadores for select using (true);
create policy leitura_publica on public.profissionais for select using (true);
create policy leitura_publica on public.servicos for select using (true);
create policy leitura_publica on public.servico_portes for select using (true);
create policy leitura_publica on public.horarios for select using (true);
create policy leitura_publica on public.avaliacoes for select using (true);
-- o telefone do prestador só sai por contato_prestador() (aparece depois de confirmado)
revoke select on public.prestadores from anon, authenticated;
grant select (id, slug, nome, tipos, descricao, endereco, bairro, lat, lng, passo_min, limpeza_min, antecedencia_min,
  janela_cancelamento_h, pausado_ate, pagamentos, cor, emoji, criado_em) on public.prestadores to anon, authenticated;

-- equipe do prestador edita o próprio negócio
create policy equipe_edita on public.prestadores for update using (eh_membro(id)) with check (eh_membro(id));
create policy equipe_edita on public.profissionais for all using (eh_membro(prestador_id)) with check (eh_membro(prestador_id));
create policy equipe_edita on public.servicos for all using (eh_membro(prestador_id)) with check (eh_membro(prestador_id));
create policy equipe_edita on public.servico_portes for all
  using (eh_membro((select prestador_id from public.servicos where id = servico_id)))
  with check (eh_membro((select prestador_id from public.servicos where id = servico_id)));
create policy equipe_edita on public.horarios for all using (eh_membro(prestador_id)) with check (eh_membro(prestador_id));
create policy equipe_le_e_edita on public.bloqueios for all using (eh_membro(prestador_id)) with check (eh_membro(prestador_id));
create policy equipe_responde on public.avaliacoes for update using (eh_membro(prestador_id)) with check (eh_membro(prestador_id));
create policy proprio_vinculo on public.membros_prestador for select using (user_id = auth.uid() or eh_membro(prestador_id));

-- tutor: o próprio cadastro e os próprios pets
create policy proprio on public.tutores for all using (id = auth.uid()) with check (id = auth.uid());
create policy proprio on public.pets for all using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
-- a equipe vê nome do tutor e do pet de quem agendou com ela
create policy equipe_ve_clientes on public.tutores for select
  using (exists (select 1 from public.agendamentos a where a.tutor_id = tutores.id and eh_membro(a.prestador_id)));
create policy equipe_ve_clientes on public.pets for select
  using (exists (select 1 from public.agendamentos a where a.pet_id = pets.id and eh_membro(a.prestador_id)));

-- agendamentos, propostas e mensagens: só leitura; escrita pelas funções
create policy envolvidos_leem on public.agendamentos for select using (tutor_id = auth.uid() or eh_membro(prestador_id));
create policy envolvidos_leem on public.propostas for select
  using (eh_membro(prestador_id) or exists (select 1 from public.agendamentos a where a.id = agendamento_id and a.tutor_id = auth.uid()));
create policy destinatario_le on public.mensagens for select
  using ((destino = 'tutor' and tutor_id = auth.uid()) or (destino = 'prestador' and eh_membro(prestador_id)));
-- reservas_temporarias: sem política = ninguém lê direto (a ocupação sai por ocupacao())
