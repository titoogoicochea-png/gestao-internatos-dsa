-- ============================================================
-- SCHEMA: Gestão de Internatos DSA
-- Refleja la estructura REAL que usa la app (reconstruida desde los
-- server actions de app/modulo2 y app/modulo3 — la fuente de verdad de
-- lo que la BD en vivo necesita). Re-ejecutable de forma segura.
-- Ejecutar en: Supabase → SQL Editor → New query
-- Última sync: 2026-06-18
-- ============================================================

-- ------------------------------------------------------------
-- TABLAS
-- ------------------------------------------------------------

-- Perfiles de usuario (extiende auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  rol text not null default 'usuario' check (rol in ('usuario', 'admin', 'propietario')),
  created_at timestamptz default now()
);

-- Grupos de trabajo: un grupo pertenece a un nivel y a un workshop (taller)
create table if not exists public.grupos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  nivel text not null check (nivel in ('basica', 'superior')),
  taller text not null default 'tarde1' check (taller in ('tarde1', 'tarde2')),
  descripcion text,
  cupo_max int not null default 20,
  created_at timestamptz default now()
);

-- Suscripciones usuario → grupo (regla de negocio: un grupo por workshop, validada en código)
create table if not exists public.suscripciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(usuario_id, grupo_id)
);

-- Contenido asignado a cada grupo (capítulos en W1; subdimensiones del Anexo C en W2)
create table if not exists public.asignaciones (
  id uuid default gen_random_uuid() primary key,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  doc_codigo text not null,
  unique(grupo_id, doc_codigo)
);

-- Observaciones, sugerencias y comentarios por contenido asignado
create table if not exists public.observaciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  doc_codigo text not null,
  seccion_id text,
  tipo text not null default 'comentario',
  texto text not null,
  created_at timestamptz default now()
);

-- Estado de apertura de cada workshop (lo abre/cierra el admin)
create table if not exists public.fase_taller (
  taller text primary key check (taller in ('tarde1', 'tarde2')),
  abierto boolean not null default false,
  updated_at timestamptz default now()
);
insert into public.fase_taller (taller, abierto)
  values ('tarde1', false), ('tarde2', false)
  on conflict (taller) do nothing;

-- Informe consolidado por IA (Módulo 3): uno por nivel + workshop
create table if not exists public.informes (
  id uuid default gen_random_uuid() primary key,
  nivel text not null check (nivel in ('basica', 'superior')),
  taller text not null check (taller in ('tarde1', 'tarde2')),
  contenido jsonb not null,
  modelo text,
  generado_por uuid references public.profiles(id),
  generado_en timestamptz default now(),
  unique(nivel, taller)
);

-- NOTA: la tabla `doc_generado` del diseño original quedó obsoleta;
-- el Módulo 3 ahora usa `informes`. Si existe en la BD, puede dejarse o eliminarse.

-- ------------------------------------------------------------
-- MIGRACIÓN para bases ya existentes (idempotente)
-- ------------------------------------------------------------
alter table public.grupos        add column if not exists taller text not null default 'tarde1';
alter table public.grupos        add column if not exists cupo_max int not null default 20;
alter table public.observaciones add column if not exists tipo text not null default 'comentario';

-- Quitar el constraint viejo "un grupo por usuario" (UNIQUE(usuario_id)) si quedó en la BD:
do $$
declare c text;
begin
  select conname into c from pg_constraint
   where conrelid = 'public.suscripciones'::regclass and contype = 'u'
     and pg_get_constraintdef(oid) = 'UNIQUE (usuario_id)';
  if c is not null then execute format('alter table public.suscripciones drop constraint %I', c); end if;
end $$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.grupos        enable row level security;
alter table public.suscripciones enable row level security;
alter table public.asignaciones  enable row level security;
alter table public.observaciones enable row level security;
alter table public.fase_taller   enable row level security;
alter table public.informes      enable row level security;

-- profiles: todos los autenticados leen; solo el propio usuario actualiza el suyo
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- grupos: todos leen; solo admin/propietario gestionan
drop policy if exists "grupos_select" on public.grupos;
create policy "grupos_select" on public.grupos
  for select to authenticated using (true);
drop policy if exists "grupos_manage" on public.grupos;
create policy "grupos_manage" on public.grupos
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- suscripciones: todos ven; cada usuario gestiona las suyas
drop policy if exists "suscripciones_select" on public.suscripciones;
create policy "suscripciones_select" on public.suscripciones
  for select to authenticated using (true);
drop policy if exists "suscripciones_insert" on public.suscripciones;
create policy "suscripciones_insert" on public.suscripciones
  for insert to authenticated with check (usuario_id = auth.uid());
drop policy if exists "suscripciones_delete" on public.suscripciones;
create policy "suscripciones_delete" on public.suscripciones
  for delete to authenticated using (usuario_id = auth.uid());

-- asignaciones: todos leen; solo admin/propietario gestionan
drop policy if exists "asignaciones_select" on public.asignaciones;
create policy "asignaciones_select" on public.asignaciones
  for select to authenticated using (true);
drop policy if exists "asignaciones_manage" on public.asignaciones;
create policy "asignaciones_manage" on public.asignaciones
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- observaciones: miembros del grupo leen las del grupo; cada usuario escribe/edita las suyas
drop policy if exists "observaciones_select" on public.observaciones;
create policy "observaciones_select" on public.observaciones
  for select to authenticated using (
    grupo_id in (select grupo_id from public.suscripciones where usuario_id = auth.uid())
    or (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );
drop policy if exists "observaciones_insert" on public.observaciones;
create policy "observaciones_insert" on public.observaciones
  for insert to authenticated with check (
    usuario_id = auth.uid()
    and grupo_id in (select grupo_id from public.suscripciones where usuario_id = auth.uid())
  );
drop policy if exists "observaciones_update" on public.observaciones;
create policy "observaciones_update" on public.observaciones
  for update to authenticated using (usuario_id = auth.uid());
drop policy if exists "observaciones_delete" on public.observaciones;
create policy "observaciones_delete" on public.observaciones
  for delete to authenticated using (usuario_id = auth.uid());

-- fase_taller: todos leen (para saber si el workshop está abierto); solo admin/propietario cambian
drop policy if exists "fase_taller_select" on public.fase_taller;
create policy "fase_taller_select" on public.fase_taller
  for select to authenticated using (true);
drop policy if exists "fase_taller_manage" on public.fase_taller;
create policy "fase_taller_manage" on public.fase_taller
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- informes: solo admin/propietario (Módulo 3 es de administración)
drop policy if exists "informes_select" on public.informes;
create policy "informes_select" on public.informes
  for select to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );
drop policy if exists "informes_manage" on public.informes;
create policy "informes_manage" on public.informes
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    'usuario'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
