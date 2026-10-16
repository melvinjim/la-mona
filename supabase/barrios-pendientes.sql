-- Lo que falta por cambiar, sobre lo que ya corriste.
-- Pega todo en el SQL Editor de Supabase y pulsa Run.

-- 1. Precios que el mapa corrige (4)
update public.delivery_zones set fee = 12000 where lower(btrim(name)) = 'las palmeras';   -- antes 10000
update public.delivery_zones set fee = 10000 where lower(btrim(name)) = 'simón bolívar';   -- antes 5000
update public.delivery_zones set fee =  7000 where lower(btrim(name)) = 'villate';   -- antes 9000
update public.delivery_zones set fee =  7000 where lower(btrim(name)) = 'buena esperanza';   -- antes 9000

-- 2. Barrios que faltaban (9)
insert into public.delivery_zones (name, fee) values
  ('San Francisco'::text             , 10000::integer),
  ('Modelo'                          , 10000),
  ('Los Girasoles'                   , 15000),
  ('Las Dunas'                       , 10000),
  ('Santo Domingo de Guzmán'         , 10000),
  ('América'                         , 10000),
  ('Colombia'                        , 10000),
  ('Granadillo'                      , 10000),
  ('Primero de Mayo'                 , 10000)
on conflict do nothing;

select count(*) as barrios from public.delivery_zones;
