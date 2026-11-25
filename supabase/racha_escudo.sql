-- Récord de racha y escudos de racha (correr una sola vez en Supabase > SQL Editor)
alter table public.axo_state add column if not exists racha_max integer default 0;
alter table public.axo_state add column if not exists escudos integer default 0;
