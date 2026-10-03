-- ---------------------------------------------------------------------------
-- Restaurante La Mona — base de datos del panel administrativo
--
-- Cómo usarlo: entra a tu proyecto en supabase.com, abre "SQL Editor",
-- pega todo este archivo y pulsa "Run". Se puede volver a ejecutar sin problema.
-- ---------------------------------------------------------------------------

-- 1. Contenido del sitio -----------------------------------------------------
-- Dos filas: 'menu' (el menú completo) y 'site' (datos del restaurante y la promoción).
-- Se guardan como JSON con la misma forma de src/lib/types.ts.

create table if not exists public.content (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now(),
  constraint content_key_valido check (key in ('menu', 'site'))
);

alter table public.content enable row level security;

-- Cualquiera puede leer el menú: es lo que muestra la página pública.
drop policy if exists "content: lectura pública" on public.content;
create policy "content: lectura pública"
  on public.content for select
  to anon, authenticated
  using (true);

-- Solo quien haya iniciado sesión puede modificarlo (el panel administrativo).
drop policy if exists "content: escritura del administrador" on public.content;
create policy "content: escritura del administrador"
  on public.content for all
  to authenticated
  using (true)
  with check (true);

-- 2. Fotos -------------------------------------------------------------------
-- Bucket público para las fotos de los platos, el logo, la portada y la promoción.

insert into storage.buckets (id, name, public)
values ('menu', 'menu', true)
on conflict (id) do update set public = true;

drop policy if exists "menu: lectura pública" on storage.objects;
create policy "menu: lectura pública"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu');

drop policy if exists "menu: subir fotos" on storage.objects;
create policy "menu: subir fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu');

drop policy if exists "menu: reemplazar fotos" on storage.objects;
create policy "menu: reemplazar fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu')
  with check (bucket_id = 'menu');

drop policy if exists "menu: borrar fotos" on storage.objects;
create policy "menu: borrar fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu');

-- 3. Quién puede entrar ------------------------------------------------------
-- El usuario del panel se crea a mano en Supabase:
--   Authentication → Users → "Add user" → correo y contraseña, con "Auto Confirm User".
--
-- Recomendado: Authentication → Providers → Email → desactivar "Enable sign ups",
-- para que nadie más pueda crearse una cuenta y entrar al panel.
