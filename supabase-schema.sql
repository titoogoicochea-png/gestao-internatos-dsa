-- ============================================================
-- SCHEMA: Gestão de Internatos DSA
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- Perfiles de usuario (extiende auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text not null,
  rol text not null default 'usuario' check (rol in ('usuario', 'admin', 'propietario')),
  created_at timestamptz default now()
);

-- Grupos de trabajo
create table public.grupos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  nivel text not null check (nivel in ('basica', 'superior')),
  descripcion text,
  created_at timestamptz default now()
);

-- Suscripciones usuario → grupo
create table public.suscripciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(usuario_id, grupo_id)
);

-- Capítulos asignados a cada grupo (zona de trabajo)
create table public.asignaciones (
  id uuid default gen_random_uuid() primary key,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  doc_codigo text not null,
  unique(grupo_id, doc_codigo)
);

-- Observaciones y comentarios por capítulo
create table public.observaciones (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references public.profiles(id) on delete cascade not null,
  grupo_id uuid references public.grupos(id) on delete cascade not null,
  doc_codigo text not null,
  seccion_id text,
  texto text not null,
  created_at timestamptz default now()
);

-- Documentos generados por IA (Módulo 3)
create table public.doc_generado (
  id uuid default gen_random_uuid() primary key,
  nivel text not null check (nivel in ('basica', 'superior')),
  doc_codigo text not null,
  contenido_es text not null,
  instrucciones text,
  estado text not null default 'borrador' check (estado in ('borrador', 'publicado')),
  generado_por uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.grupos enable row level security;
alter table public.suscripciones enable row level security;
alter table public.asignaciones enable row level security;
alter table public.observaciones enable row level security;
alter table public.doc_generado enable row level security;

-- profiles: todos los autenticados pueden leer; solo el propio usuario actualiza el suyo
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- grupos: todos los autenticados pueden leer; solo admin/propietario crean/editan
create policy "grupos_select" on public.grupos
  for select to authenticated using (true);
create policy "grupos_manage" on public.grupos
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- suscripciones: todos ven; cada usuario gestiona las suyas
create policy "suscripciones_select" on public.suscripciones
  for select to authenticated using (true);
create policy "suscripciones_insert" on public.suscripciones
  for insert to authenticated with check (usuario_id = auth.uid());
create policy "suscripciones_delete" on public.suscripciones
  for delete to authenticated using (usuario_id = auth.uid());

-- asignaciones: todos leen; solo admin/propietario gestionan
create policy "asignaciones_select" on public.asignaciones
  for select to authenticated using (true);
create policy "asignaciones_manage" on public.asignaciones
  for all to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- observaciones: miembros del grupo leen las del grupo; cada usuario escribe/edita las suyas
create policy "observaciones_select" on public.observaciones
  for select to authenticated using (
    grupo_id in (select grupo_id from public.suscripciones where usuario_id = auth.uid())
    or (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );
create policy "observaciones_insert" on public.observaciones
  for insert to authenticated with check (
    usuario_id = auth.uid()
    and grupo_id in (select grupo_id from public.suscripciones where usuario_id = auth.uid())
  );
create policy "observaciones_update" on public.observaciones
  for update to authenticated using (usuario_id = auth.uid());
create policy "observaciones_delete" on public.observaciones
  for delete to authenticated using (usuario_id = auth.uid());

-- doc_generado: todos ven los publicados; admin/propietario ven y gestionan todos
create policy "doc_generado_select" on public.doc_generado
  for select to authenticated using (
    estado = 'publicado'
    or (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );
create policy "doc_generado_manage" on public.doc_generado
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
