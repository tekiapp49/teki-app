 # TéKi — contexte projet pour Claude Code

## Vision

TéKi connecte habitants, commerçants/artisans et associations d'un territoire rural (pilote : Mauges, Maine-et-Loire). Gratuit pour les habitants, abonnement pour les commerçants/artisans, gratuit pour les associations (avec options payantes plus tard). Ton éditorial : bienveillant, jamais anxiogène, jamais pushy. Toujours mentionner explicitement la gratuité de l'inscription dans les messages d'incitation.

Objectif de cette V1 : un test réel sur une commune pilote, avec de vrais comptes et de vraies fiches — pas une démo. Périmètre volontairement réduit (voir plus bas) pour aller vite.

## Stack recommandée

- **Next.js (App Router, TypeScript)** — app web responsive, pensée mobile d'abord. Pas d'app native en V1.
- **Supabase** — auth par téléphone + code SMS (natif, pas besoin de service tiers), base Postgres, stockage des photos.
- **Leaflet + tuiles OpenStreetMap** pour la carte — gratuit, sans clé API à gérer.
- **Déploiement : Vercel** — connecté au repo Git, déploiement automatique à chaque push.
- **Tailwind CSS** pour le style, cohérent avec la palette ci-dessous.

## Identité visuelle

- Vert principal (marque, boutons, navigation active) : `#2F5233`
- Vert clair (associations) : `#3B6D11`
- Terracotta (accent, promos, commerces) : `#C1673B`
- Crème (fond, jamais blanc pur) : `#FAF6EF`
- Carte/fond secondaire : `#F4EEE0` / `#EAE2CC`
- Texte : anthracite `#2B2B28` (jamais noir pur), texte secondaire `#6B6A63`, texte sur fond marron `#8A6A4F`
- Logo : carré vert arrondi, cercle blanc décentré en diagonale (haut-gauche), point terracotta centré avec liseré blanc autour (voir capture du logo si disponible, sinon recréer un simple rond+point comme repère de marque)
- Interface épurée façon Airbnb / Too Good To Go : grandes cartes illustrées, une seule couleur signature à la fois, beaucoup de blanc/crème, pas de dégradés ni d'ombres lourdes.
- Icônes : outline uniquement (type Tabler icons), jamais de pictos remplis façon skeuomorphe.

## Périmètre V1 — inclus

1. **Entrée carte-first** : premier écran = carte avec géolocalisation demandée explicitement (message expliquant pourquoi), repli manuel par recherche de commune si refusée, bandeau persistant tant que la géoloc n'est pas activée.
2. **Fil "TéKi là"** (liste, la bascule carte peut attendre une V1.1) : mélange commerces/associations/événements/infos officielles, filtré par 4 familles en icônes (Commerces, Sorties, Entraide, Pratique) + "Tout". Ne montre que du contenu actif (offre en cours ou événement à venir), pas les fiches sans actualité.
3. **Tri du fil** : favoris toujours en premier (peu importe la distance), puis proximité croissante. **Jamais de classement payant** — l'abonnement élargit la zone de diffusion (village → commune → territoire), jamais la position dans le fil.
4. **Fiches détail** (commerce, association, événement) — règle stricte visible/verrouillé :
   - Toujours visible : nom, catégorie, distance, statut ouvert/fermé, horaires, adresse exacte, photos, avis (lecture), lieu et jauge de participation (événement).
   - Verrouillé jusqu'à inscription : bouton Appeler, bouton Itinéraire, message privé, détail d'une offre (texte flouté + cadenas, avec ses conditions).
   - Chaque message de verrouillage doit dire "Gratuit" avant d'inciter à s'inscrire.
   - Bouton "Favoris" (pas "Suivre") déclenche l'inscription pour un visiteur.
5. **Inscription** : numéro de téléphone → code SMS (Supabase Auth phone OTP). Après validation, l'utilisateur revient automatiquement sur l'écran d'origine, action débloquée (jamais renvoyé à l'accueil s'il avait un point de départ précis).
6. **Profil (complétion)** : prénom obligatoire, nom optionnel, au moins un centre d'intérêt (icônes, pas de texte seul), un lieu de référence minimum (extensible à plusieurs plus tard), naissance/adresse optionnels — jamais écrire "(facultatif)", seul le champ obligatoire porte un astérisque avec une note unique en haut du formulaire.
7. **Favoris** : trois sections — Nouveautés (contenu non lu), À venir (événements triés par date), Mes favoris. État vide avec illustration simple + invitation à explorer, pas de texte à base de jeux de mots.
8. **Navigation** : barre à 4 icônes toujours visible (TéKi là, Favoris, Messages, Profil). Un visiteur voit les 4 icônes ; Favoris/Messages/Profil déclenchent l'inscription au tap.
9. **Espace pro minimal** : accessible depuis Profil → "Mes fiches pro" (pas de navigation séparée). Un bandeau de contexte plein largeur, coloré selon la fiche, affiche son nom sur chaque écran pro. Fonctions : publier (Promo/Événement/Actu avec durée de validité "Du/Au" et conditions optionnelles, publication immédiate ou programmée), voir ses stats simples (favoris, vues).

## Différé (pas en V1)

- Messages : remplacer par un simple lien "contacter" (tel/email) au départ plutôt qu'une vraie messagerie in-app.
- Sélecteur multi-fiches pro (gérer plusieurs fiches à la fois).
- Auto-inscription complète des fiches commerces/associations : **pour le pilote, les fiches sont créées et alimentées manuellement** (par le porteur du projet, via l'admin Supabase ou un formulaire simple) plutôt que par un vrai flux self-service — ça évite de construire tout l'onboarding pro dès la V1.
- Système de recherche avancée, avis détaillés avec réponse du commerçant, notifications push (un simple toggle placeholder suffit).
- Bascule carte interactive complète (V1 peut se limiter à la liste + un lien "voir sur la carte" basique).

## Modèle de données (aperçu)

- `users` : id, téléphone (auth Supabase), prénom, nom (optionnel), centres_intérêt[], lieu_référence (lat/lng + nom commune), date_naissance (optionnel), adresse (optionnel), notifications_actives (bool, true par défaut)
- `fiches` : id, type (commerce | association), nom, catégorie, description, lat/lng, adresse, téléphone, horaires (json), photos[], propriétaire_user_id (nullable si créée manuellement), palier_abonnement (proximité | commune | territoire)
- `publications` : id, fiche_id, type (promo | evenement | actu), texte, conditions (optionnel), date_debut, date_fin (pour les promos), date_evenement (pour les événements), lieu_evenement (si différent de la fiche), statut (brouillon | programmé | publié), date_publication_prevue
- `favoris` : user_id, fiche_id ou publication_id, date_ajout
- `participations` : user_id, publication_id (pour "J'y serai" et la jauge de participation)
- `avis` : id, fiche_id, user_id, note, commentaire

## Règles de ton (contenu sensible)

Pour tout contenu lié à des sujets sensibles du territoire (précarité, restrictions d'eau, solidarité) : toujours accompagner un constat d'une action possible, vocabulaire positif et collectif, jamais de bandeau rouge alarmant, badge discret "Info officielle" (mairie/collectivité) ou "Solidarité" pour indiquer la source sans dramatiser.

## Nommage

Le nom "CéMoi" et les jeux de mots associés à l'ancien onboarding ont été abandonnés (jugés trop enfantins) — utiliser un wording neutre ("Inscrit", "S'inscrire") en attendant qu'un nom définitif soit retravaillé. Le nom du produit reste **TéKi**, et le fil d'accueil s'appelle **TéKi là**.
