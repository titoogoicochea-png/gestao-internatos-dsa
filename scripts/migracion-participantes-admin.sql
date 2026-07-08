-- ============================================================
-- MIGRACIÓN: el propietario/admin puede añadir y quitar
-- participantes de cualquier grupo desde "Participantes por grupo".
--
-- Ejecutar en: Supabase → SQL Editor → New query
-- Re-ejecutable de forma segura (usa drop policy if exists).
-- ============================================================

-- Permitir que admin/propietario inserte inscripciones de cualquier usuario.
drop policy if exists "suscripciones_admin_insert" on public.suscripciones;
create policy "suscripciones_admin_insert" on public.suscripciones
  for insert to authenticated with check (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );

-- Permitir que admin/propietario elimine inscripciones de cualquier usuario.
drop policy if exists "suscripciones_admin_delete" on public.suscripciones;
create policy "suscripciones_admin_delete" on public.suscripciones
  for delete to authenticated using (
    (select rol from public.profiles where id = auth.uid()) in ('admin', 'propietario')
  );
