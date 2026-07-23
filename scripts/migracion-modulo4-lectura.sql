-- ============================================================
-- Módulo 4 · "Documento reconstruido" visible para todos
-- ============================================================
-- Permite que CUALQUIER usuario autenticado LEA la tabla `informes`
-- (necesario para que todos puedan ver el documento reconstruido).
-- La ESCRITURA (generar/regenerar/limpiar) sigue restringida a admin/propietario
-- por la política `informes_manage`, que no se toca.
--
-- Cómo aplicar: Supabase → SQL Editor → pega y ejecuta.

drop policy if exists "informes_select" on public.informes;
create policy "informes_select" on public.informes
  for select to authenticated using (true);
