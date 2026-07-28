-- =====================================================================
--  TéKi — recherche « intelligente » (fautes + synonymes), 100% Postgres
-- =====================================================================
--  À exécuter une fois dans Supabase (SQL Editor). Ré-exécutable.
--  - unaccent  : recherche insensible aux accents
--  - pg_trgm   : tolérance aux fautes de frappe (similarité de trigrammes)
--  - table synonymes + fonction rechercher_fiches() : synonymes métier +
--    recherche floue sur nom + catégorie + description.
-- =====================================================================

create extension if not exists unaccent;
create extension if not exists pg_trgm;

-- ── Dictionnaire de synonymes ────────────────────────────────────────
-- « mot » = ce que tape l'utilisateur (sans accent, en minuscules) ;
-- « canonique » = terme réellement présent dans les fiches (nom/catégorie).
create table if not exists public.synonymes (
  mot       text primary key,
  canonique text not null
);
alter table public.synonymes enable row level security;
drop policy if exists synonymes_public_read on public.synonymes;
create policy synonymes_public_read on public.synonymes for select using (true);

-- ── Fonction de recherche ────────────────────────────────────────────
-- Étend la requête via les synonymes, puis classe les fiches par
-- similarité (fautes) et présence du terme (nom + catégorie + description).
create or replace function public.rechercher_fiches(q text)
returns setof public.fiches
language sql
stable
as $$
  with t as (
    select unaccent(lower(trim(q))) as terme
  ),
  expansion as (
    select terme from t
    union
    select unaccent(lower(s.canonique))
    from public.synonymes s, t
    where s.mot = t.terme
  ),
  scores as (
    select f.id,
      max(
        greatest(
          similarity(unaccent(lower(coalesce(f.nom, ''))), e.terme),
          similarity(unaccent(lower(coalesce(f.categorie, ''))), e.terme),
          case
            when unaccent(lower(
                   coalesce(f.nom, '') || ' ' ||
                   coalesce(f.categorie, '') || ' ' ||
                   coalesce(f.description, '')
                 )) like '%' || e.terme || '%'
            then 0.9 else 0
          end
        )
      ) as score
    from public.fiches f
    cross join expansion e
    where length(e.terme) >= 2
    group by f.id
  )
  select f.*
  from scores sc
  join public.fiches f on f.id = sc.id
  where sc.score >= 0.25
  order by sc.score desc
  limit 12;
$$;

grant execute on function public.rechercher_fiches(text) to anon, authenticated;

-- ── Dictionnaire maison (à compléter au fil des vraies fiches) ───────
insert into public.synonymes (mot, canonique) values
  -- Boulangerie / pâtisserie
  ('pain', 'boulangerie'),
  ('baguette', 'boulangerie'),
  ('croissant', 'boulangerie'),
  ('viennoiserie', 'boulangerie'),
  ('viennoiseries', 'boulangerie'),
  ('patisserie', 'boulangerie'),
  ('gateau', 'boulangerie'),
  ('boulanger', 'boulangerie'),
  -- Boucherie
  ('viande', 'boucherie'),
  ('boucher', 'boucherie'),
  ('charcuterie', 'boucherie'),
  -- Épicerie / alimentation
  ('courses', 'epicerie'),
  ('alimentation', 'epicerie'),
  ('superette', 'epicerie'),
  ('epicier', 'epicerie'),
  -- Restaurant / bar
  ('resto', 'restaurant'),
  ('manger', 'restaurant'),
  ('dejeuner', 'restaurant'),
  ('diner', 'restaurant'),
  ('brasserie', 'restaurant'),
  ('cafe', 'bar'),
  ('biere', 'bar'),
  -- Coiffure / beauté
  ('coiffeur', 'coiffure'),
  ('coiffeuse', 'coiffure'),
  ('coupe', 'coiffure'),
  ('esthetique', 'beaute'),
  -- Santé
  ('docteur', 'medecin'),
  ('toubib', 'medecin'),
  ('generaliste', 'medecin'),
  ('medicament', 'pharmacie'),
  ('medicaments', 'pharmacie'),
  ('pharmacien', 'pharmacie'),
  -- Fleurs
  ('fleurs', 'fleuriste'),
  ('fleur', 'fleuriste'),
  ('bouquet', 'fleuriste'),
  -- Auto
  ('garagiste', 'garage'),
  ('mecanicien', 'garage'),
  ('voiture', 'garage'),
  -- Producteurs / ferme
  ('legumes', 'producteur'),
  ('maraicher', 'producteur'),
  ('ferme', 'producteur'),
  ('fermier', 'producteur'),
  ('primeur', 'producteur'),
  ('marche', 'producteur'),
  ('bio', 'producteur'),
  -- Associations / entraide
  ('benevole', 'association'),
  ('benevolat', 'association'),
  ('entraide', 'association'),
  ('solidarite', 'association'),
  ('aide', 'association'),
  -- Sorties / événements (organisés par des assos)
  ('fete', 'comite'),
  ('animation', 'comite'),
  ('concert', 'comite'),
  ('festival', 'comite')
on conflict (mot) do update set canonique = excluded.canonique;
