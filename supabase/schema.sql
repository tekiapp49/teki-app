-- =====================================================================
--  TéKi — schéma de base de données (Supabase / Postgres)
-- =====================================================================
--  À exécuter une fois dans Supabase : SQL Editor > New query > coller
--  ce fichier > Run. Réexécutable sans risque (idempotent).
--
--  Correspond à la section « Modèle de données » de CLAUDE.md. Le
--  téléphone et l'authentification sont gérés par Supabase (auth.users) ;
--  la table « profils » ci-dessous étend auth.users avec les infos métier
--  (c'est l'entité « users » du modèle produit).
-- =====================================================================

-- Types énumérés -------------------------------------------------------
do $$ begin
  create type fiche_type          as enum ('commerce', 'association');
exception when duplicate_object then null; end $$;

do $$ begin
  create type palier_abonnement   as enum ('proximite', 'commune', 'territoire');
exception when duplicate_object then null; end $$;

do $$ begin
  create type publication_type    as enum ('promo', 'evenement', 'actu');
exception when duplicate_object then null; end $$;

do $$ begin
  create type publication_statut  as enum ('brouillon', 'programme', 'publie');
exception when duplicate_object then null; end $$;


-- profils : extension métier de auth.users (= « users » du modèle) ------
create table if not exists public.profils (
  id                    uuid primary key references auth.users (id) on delete cascade,
  prenom                text not null,
  nom                   text,
  centres_interet       text[] not null default '{}',
  lieu_reference_lat    double precision,
  lieu_reference_lng    double precision,
  lieu_reference_nom    text,           -- nom de la commune de référence
  date_naissance        date,
  adresse               text,
  notifications_actives boolean not null default true,
  cree_le               timestamptz not null default now()
);

-- fiches : commerces & associations (créées à la main pour le pilote) ---
create table if not exists public.fiches (
  id                  uuid primary key default gen_random_uuid(),
  type                fiche_type not null,
  nom                 text not null,
  categorie           text not null,
  description         text,
  lat                 double precision,
  lng                 double precision,
  adresse             text,
  telephone           text,
  horaires            jsonb,                      -- ex. {"lun":[["09:00","12:30"]], ...}
  photos              text[] not null default '{}',
  proprietaire_user_id uuid references public.profils (id) on delete set null,
  palier_abonnement   palier_abonnement not null default 'proximite',
  cree_le             timestamptz not null default now()
);
create index if not exists fiches_type_idx on public.fiches (type);

-- publications : promos / événements / actus rattachées à une fiche -----
create table if not exists public.publications (
  id                     uuid primary key default gen_random_uuid(),
  fiche_id               uuid not null references public.fiches (id) on delete cascade,
  type                   publication_type not null,
  texte                  text not null,
  conditions             text,
  date_debut             date,        -- promos : début de validité
  date_fin               date,        -- promos : fin de validité
  date_evenement         timestamptz, -- événements : date/heure
  lieu_evenement         text,        -- si différent de l'adresse de la fiche
  statut                 publication_statut not null default 'brouillon',
  date_publication_prevue timestamptz,
  cree_le                timestamptz not null default now()
);
create index if not exists publications_fiche_idx  on public.publications (fiche_id);
create index if not exists publications_statut_idx on public.publications (statut);

-- favoris : sur une fiche OU une publication ---------------------------
create table if not exists public.favoris (
  user_id        uuid not null references public.profils (id) on delete cascade,
  fiche_id       uuid references public.fiches (id) on delete cascade,
  publication_id uuid references public.publications (id) on delete cascade,
  date_ajout     timestamptz not null default now(),
  -- exactement une cible : soit une fiche, soit une publication
  constraint favoris_cible_unique check (
    (fiche_id is not null)::int + (publication_id is not null)::int = 1
  )
);
create unique index if not exists favoris_fiche_uidx
  on public.favoris (user_id, fiche_id) where fiche_id is not null;
create unique index if not exists favoris_publication_uidx
  on public.favoris (user_id, publication_id) where publication_id is not null;

-- participations : « J'y serai » + jauge de participation --------------
create table if not exists public.participations (
  user_id        uuid not null references public.profils (id) on delete cascade,
  publication_id uuid not null references public.publications (id) on delete cascade,
  date_ajout     timestamptz not null default now(),
  primary key (user_id, publication_id)
);

-- avis -----------------------------------------------------------------
create table if not exists public.avis (
  id         uuid primary key default gen_random_uuid(),
  fiche_id   uuid not null references public.fiches (id) on delete cascade,
  user_id    uuid not null references public.profils (id) on delete cascade,
  note       smallint not null check (note between 1 and 5),
  commentaire text,
  cree_le    timestamptz not null default now()
);
create index if not exists avis_fiche_idx on public.avis (fiche_id);


-- =====================================================================
--  Row Level Security (RLS)
-- ---------------------------------------------------------------------
--  Principe pilote : le contenu public (fiches, publications publiées,
--  avis) est lisible par tous — y compris un visiteur non inscrit, pour
--  respecter la règle « toujours visible » des fiches. Les données
--  personnelles (profil, favoris, participations) restent privées à
--  chaque utilisateur. Les fiches du pilote sont créées à la main via
--  le dashboard Supabase (rôle service, qui contourne la RLS).
-- =====================================================================
alter table public.profils         enable row level security;
alter table public.fiches          enable row level security;
alter table public.publications    enable row level security;
alter table public.favoris         enable row level security;
alter table public.participations  enable row level security;
alter table public.avis            enable row level security;

-- profils : chacun ne voit et ne modifie que son propre profil
drop policy if exists profils_self_select on public.profils;
create policy profils_self_select on public.profils
  for select using (auth.uid() = id);
drop policy if exists profils_self_upsert on public.profils;
create policy profils_self_upsert on public.profils
  for insert with check (auth.uid() = id);
drop policy if exists profils_self_update on public.profils;
create policy profils_self_update on public.profils
  for update using (auth.uid() = id);

-- fiches : lecture publique ; un propriétaire peut éditer sa fiche
drop policy if exists fiches_public_read on public.fiches;
create policy fiches_public_read on public.fiches
  for select using (true);
drop policy if exists fiches_owner_update on public.fiches;
create policy fiches_owner_update on public.fiches
  for update using (auth.uid() = proprietaire_user_id);

-- publications : lecture publique des publications publiées ;
-- un propriétaire de fiche voit et gère toutes les siennes (brouillons inclus)
drop policy if exists publications_public_read on public.publications;
create policy publications_public_read on public.publications
  for select using (
    statut = 'publie'
    or exists (
      select 1 from public.fiches f
      where f.id = publications.fiche_id and f.proprietaire_user_id = auth.uid()
    )
  );
drop policy if exists publications_owner_write on public.publications;
create policy publications_owner_write on public.publications
  for all using (
    exists (
      select 1 from public.fiches f
      where f.id = publications.fiche_id and f.proprietaire_user_id = auth.uid()
    )
  );

-- favoris : privés à chaque utilisateur
drop policy if exists favoris_owner_all on public.favoris;
create policy favoris_owner_all on public.favoris
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- participations : chacun gère les siennes ; lecture publique autorisée
-- (nécessaire pour afficher la jauge de participation à un visiteur)
drop policy if exists participations_public_read on public.participations;
create policy participations_public_read on public.participations
  for select using (true);
drop policy if exists participations_owner_write on public.participations;
create policy participations_owner_write on public.participations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- avis : lecture publique ; chacun gère les siens
drop policy if exists avis_public_read on public.avis;
create policy avis_public_read on public.avis
  for select using (true);
drop policy if exists avis_owner_write on public.avis;
create policy avis_owner_write on public.avis
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =====================================================================
--  Création automatique du profil à l'inscription
-- ---------------------------------------------------------------------
--  À la validation du code SMS, Supabase crée une ligne dans auth.users.
--  Ce trigger crée en miroir une ligne « profils » (prénom provisoire,
--  complété ensuite à l'écran de complétion de profil).
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profils (id, prenom)
  values (new.id, '')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
