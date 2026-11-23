-- meuPet: tarefa agendada que recusa pedidos sem resposta no prazo e expira propostas antigas.
-- Antes de rodar: Database → Extensions → ative "pg_cron".

create extension if not exists pg_cron;

select cron.schedule('expirar-pedidos', '* * * * *', $$ select public.expirar_pedidos() $$);
