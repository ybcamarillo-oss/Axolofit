-- (Corre primero composicion.sql, porque esta función borra también esa tabla.)
-- Borra la cuenta de quien la llama (y todos sus datos). Se ejecuta UNA vez en Supabase → SQL Editor.
create or replace function public.eliminar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;
  delete from public.game_scores where user_id = uid;
  delete from public.food_log    where user_id = uid;
  delete from public.peso_log    where user_id = uid;
  delete from public.composicion_log where user_id = uid;
  delete from public.axo_state   where id = uid;
  delete from public.profiles    where id = uid;
  delete from auth.users         where id = uid;
end;
$$;

revoke all on function public.eliminar_mi_cuenta() from public, anon;
grant execute on function public.eliminar_mi_cuenta() to authenticated;
