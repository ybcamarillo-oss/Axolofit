-- Mediciones de báscula inteligente (composición corporal). Se ejecuta UNA vez en Supabase → SQL Editor.
create table if not exists public.composicion_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  grasa_pct numeric,
  musculo_kg numeric,
  agua_pct numeric,
  edad_metabolica int,
  bmr_kcal int,
  created_at timestamptz default now(),
  unique (user_id, fecha)
);

alter table public.composicion_log enable row level security;

create policy "composicion_propia" on public.composicion_log
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
