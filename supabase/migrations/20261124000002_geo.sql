-- meuPet: busca por raio com PostGIS (RN-02). Separado do esquema principal para o resto rodar sem PostGIS.

create extension if not exists postgis with schema extensions;

alter table public.prestadores
  add column local extensions.geography(Point, 4326)
  generated always as (extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography) stored;
create index prestadores_local_idx on public.prestadores using gist (local);
grant select (local) on public.prestadores to anon, authenticated;

-- prestadores visíveis (não pausados, com serviço ativo) dentro do raio, do mais perto ao mais longe
create function public.prestadores_proximos(p_lat double precision, p_lng double precision, p_raio_km double precision default 3)
returns table (id uuid, distancia_km double precision)
language sql stable set search_path = public, extensions as $$
  select p.id, st_distance(p.local, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) / 1000
    from prestadores p
   where st_dwithin(p.local, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_raio_km * 1000)
     and (p.pausado_ate is null or p.pausado_ate < (now() at time zone 'America/Sao_Paulo')::date)
     and exists (select 1 from servicos s where s.prestador_id = p.id and s.ativo)
   order by 2
$$;
