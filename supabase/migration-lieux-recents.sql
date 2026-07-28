-- Historique des lieux récents, lié au compte.
-- À exécuter une fois dans Supabase (SQL Editor) si le projet a déjà été
-- créé avec l'ancien schema.sql. (schema.sql inclut désormais la colonne.)
alter table public.profils
  add column if not exists lieux_recents jsonb not null default '[]'::jsonb;
