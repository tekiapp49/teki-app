-- =====================================================================
--  TéKi — jeu de données de démarrage (fiches + publications réelles)
-- =====================================================================
--  À exécuter dans Supabase : SQL Editor > New query > coller > Run.
--  Ré-exécutable : on efface d'abord le jeu de démo puis on le réinsère
--  (les dates sont relatives à « maintenant », donc le contenu reste
--  actif dans le temps).
--
--  Coordonnées réelles sur le territoire pilote des Mauges (49).
-- =====================================================================

-- Nettoyage du jeu de démo (par identifiants fixes)
delete from public.publications where fiche_id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);
delete from public.fiches where id in (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- ── Fiches ────────────────────────────────────────────────────────────
insert into public.fiches
  (id, type, nom, categorie, description, lat, lng, adresse, telephone, horaires, photos, palier_abonnement)
values
  ('11111111-1111-1111-1111-111111111111', 'commerce', 'Boulangerie du Pont', 'Boulangerie',
   'Pain au levain, brioches vendéennes et gâche depuis 1987. Farines de la minoterie de la Sèvre, à 15 km.',
   47.1756, -0.8664, '12 rue du Pont, Jallais', '+33241000000',
   '{"lun":"7h – 19h30","mar":"7h – 19h30","mer":"7h – 19h30","jeu":"7h – 19h30","ven":"7h – 19h30","sam":"7h – 19h30","dim":"7h – 13h"}'::jsonb,
   array['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=70'],
   'proximite'),

  ('22222222-2222-2222-2222-222222222222', 'association', 'Amicale laïque', 'Association',
   'Association de bénévoles qui anime la vie du village : kermesse, vide-greniers, aide aux devoirs.',
   47.1740, -0.8690, 'Salle des fêtes, Jallais', '+33241000001',
   null, array[]::text[], 'proximite'),

  ('33333333-3333-3333-3333-333333333333', 'association', 'Comité des fêtes florentais', 'Association',
   'Organise les grands rendez-vous de Saint-Florent-le-Vieil, dont les Podiums florentais tout l''été.',
   47.3608, -1.0125, 'Quai de la Loire, Saint-Florent-le-Vieil', '+33241000002',
   null, array['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=70'], 'commune'),

  ('44444444-4444-4444-4444-444444444444', 'association', 'Les Producteurs des Mauges', 'Producteurs',
   'Collectif de producteurs locaux : marché hebdomadaire, paniers et vente directe.',
   47.2075, -0.9908, 'Place du Champ de Foire, Beaupréau', '+33241000003',
   null, array['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=70'], 'commune'),

  ('55555555-5555-5555-5555-555555555555', 'commerce', 'Ferme des Landes', 'Producteur',
   'Vente à la ferme : légumes de saison, œufs, volailles fermières.',
   47.1900, -0.9500, 'La Jubaudière', '+33241000004',
   '{"sam":"9h – 12h30"}'::jsonb,
   array['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=70'], 'proximite');

-- ── Publications ─────────────────────────────────────────────────────
insert into public.publications
  (fiche_id, type, texte, conditions, date_debut, date_fin, date_evenement, lieu_evenement, statut)
values
  -- Promo boulangerie (active 6 jours)
  ('11111111-1111-1111-1111-111111111111', 'promo',
   '−20 % sur les viennoiseries dès 18 h', 'Dans la limite des stocks disponibles',
   current_date - 1, current_date + 5, null, null, 'publie'),

  -- Actu amicale
  ('22222222-2222-2222-2222-222222222222', 'actu',
   'Cherche des bénévoles pour la kermesse', null,
   current_date, null, null, null, 'publie'),

  -- Événement Podiums florentais (dans quelques jours)
  ('33333333-3333-3333-3333-333333333333', 'evenement',
   'Podiums florentais', 'Entrée libre · au chapeau',
   null, null, (now() + interval '4 days')::date + time '21:00', 'Quai de la Loire, Saint-Florent-le-Vieil', 'publie'),

  -- Événement Marché des producteurs (ce week-end)
  ('44444444-4444-4444-4444-444444444444', 'evenement',
   'Marché des producteurs', 'Samedi 8 h – 13 h',
   null, null, (now() + interval '2 days')::date + time '08:00', 'Place du Champ de Foire, Beaupréau', 'publie'),

  -- Actu ferme
  ('55555555-5555-5555-5555-555555555555', 'actu',
   'Vente à la ferme samedi matin', null,
   current_date, null, null, null, 'publie');
