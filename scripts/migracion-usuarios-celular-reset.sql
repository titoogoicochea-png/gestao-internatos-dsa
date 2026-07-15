-- ============================================================
-- MIGRACIÓN: celular (WhatsApp) en perfiles + restablecer contraseña
--
-- Habilita:
--   1. Guardar el celular/WhatsApp del usuario (registro y edición).
--   2. Que el trigger persista email y celular al registrarse.
--
-- El restablecimiento de contraseña en sí lo hace la Auth Admin API
-- desde un server action (requiere SUPABASE_SERVICE_ROLE_KEY), no SQL.
--
-- Ejecutar en: Supabase → SQL Editor → New query
-- Re-ejecutable de forma segura (usa "if not exists").
-- ============================================================

-- 1. Columnas nuevas en profiles (email ya se usaba en el código; se asegura aquí).
alter table public.profiles add column if not exists email   text;
alter table public.profiles add column if not exists celular text;

-- 2. Backfill del email para perfiles antiguos que aún no lo tuvieran.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and (p.email is null or p.email = '');

-- 3. Trigger de creación de perfil: ahora también guarda email y celular
--    tomados de los metadatos del registro.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, rol, email, celular)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    'usuario',
    new.email,
    nullif(new.raw_user_meta_data->>'celular', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
