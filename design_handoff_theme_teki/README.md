# Handoff : Refonte TéKI — thème « 11b / 12 » (écru + couleurs du logo)

## Vue d'ensemble
Refonte visuelle de l'app TéKI (événements, commerces et entraide de proximité). Cinq écrans : Fil, Carte, Favoris, Profil, Fiche détail. Repo cible : `tekiapp49/teki-app` (branche `main`), React + composants existants sous `src/components/`.

## À propos des fichiers de design
Les fichiers de ce dossier sont des **références de design en HTML** (prototypes montrant le rendu et le comportement voulus), pas du code de production. La tâche est de **recréer ces écrans dans l'environnement existant du repo** (React, structure `src/components/fil|map|fiche|nav`, données démo `src/lib/`) en suivant ses patterns — ne pas copier le HTML tel quel.

## Fidélité
**Haute fidélité (hifi)** : couleurs, typo, espacements et rayons sont finaux. Reproduire au pixel près avec les libs du repo.

Deux variantes de vignettes existent : **tour 12 « écru »** (fond `#f2ede1`) et **tour 13 « blanc »** (fond `#fff` + liseré `1px solid rgba(32,30,29,.12)`). Implémenter la variante retenue par le client ; à défaut, faire de ce fond une constante unique facile à basculer.

## Design tokens

### Couleurs
- Fond app : `#faf7f0` (écru) · Surface : `#f2ede1` · Texte : `#201e1d` · Divider : `rgba(32,30,29,.12)`
- Neutres : 100 `#fbf9f4` · 200 `#f0ece3` · 300 `#dfdad0` · 600 `#837d71`
- **Accent 1 — magenta du logo** (promos/commerces, chip « Tout », « ! » du titre) : base `#d92ba3` ; 100 `#fbe0f2` · 200 `#f6bde3` · 300 `#ee85cc` · 600 `#bc2089` · 700 `#9c1a71` · 800 `#771456` · 900 `#5a0f41`
- **Accent 2 — vert du logo** (en-têtes, événements, entraide) : base `#12ab4b` ; 100 `#d7f5e0` · 200 `#a8ebc0` · 300 `#66d98f` · 600 `#0f9340` · 700 `#0b7a35` · 800 `#085d28` (fond des en-têtes) · 900 `#06471f`
- Texte sur fond magenta ou vert foncé : `#fff` ou `#faf7f0`

### Typographie
- Titres / chiffres / chips « voix de marque » : **Caprasimo** (Google Fonts)
- Corps : **Figtree** (Google Fonts)
- Échelle mobile (base 375 px) : h1 26px · h3 carte 15.5px · corps 12–13px · kicker 10px uppercase letter-spacing .1em · tabbar 10.5px

### Rayons & formes
- Boutons, chips, champs : `border-radius: 999px` (pilules)
- Vignettes de liste : `26px` · rangées réglages : `18px` · encart promo fiche : `22px`
- En-tête coloré : `border-radius: 0 0 30px 30px`
- Photo « arche » des vignettes : `76×88px, border-radius: 38px 38px 15px 15px`
- Pastille date : pilule Caprasimo posée à cheval sur le bas de l'arche
- Pins carte : `34px (46px sélectionné), border-radius: 50% 50% 50% 6px, rotate(-45deg)`

### Ombres
Reprendre les élévations existantes du repo ; sinon `0 2px 10px rgba(46,43,37,.12)` (cartes) et plus marquée pour la bottom-sheet carte.

### Icônes
Lucide, `stroke-width: 2.75`.

## Écrans

### 1. Fil (FilScreen)
- En-tête vert foncé `#085d28`, arrondi bas 30px : logo TéKI 32px (coin 10px) + « Salut Marie ! » (« ! » en `#ee85cc`) ; **bulle loupe 38px** en haut à droite (fond `#0b7a35`) — **la cloche de notification est supprimée, ainsi que le champ « Chercher »**.
- Ligne 2 : chip blanche « Jallais ▾ », chip « 10 km ▾ » (`#0b7a35`).
- Ligne 3 filtres : « Tout » plein magenta `#d92ba3` texte blanc Caprasimo ; autres chips outline `1.5px solid #12ab4b`, texte `#d7f5e0`.
- Sections « CE WEEK-END » / « LA SEMAINE PROCHAINE » (kicker uppercase).
- Vignettes : fond écru `#f2ede1` (var. 12) ou blanc + liseré (var. 13) ; photo arche à gauche ; kicker + titre + méta ; chevron rond 32px à droite — **magenta pour commerce/promo, vert `#0b7a35` pour événement/entraide**.

### 2. Carte (MapEntryScreen / LeafletMap)
- Barre haute vert foncé : chips Jallais + 10 km + **bulle loupe 34px alignée à droite** (remplace le champ).
- Filtres : « Aujourd'hui ▾ » magenta plein, autres outline vert.
- Pins Leaflet : vert `#0f9340` (événements), encre `#201e1d`, sélection magenta 46px avec anneau `outline: 3px solid #faf7f0` (adapter `pin-icon.ts`).
- Bottom-sheet vignette identique au fil.

### 3. Favoris
- En-tête vert foncé : « Tes favoris » + compteur ; filtres idem fil.
- Vignettes écru/blanc, cloche **par favori** conservée (32px : magenta = actif commerce, vert = actif asso, surface + cloche barrée = coupé).
- Pastille « nouveauté » 18px magenta sur le coin de l'arche, outline couleur du fond de carte.

### 4. Profil
- En-tête vert foncé : avatar 64px magenta (initiale Caprasimo), stats en 3 tuiles `#0b7a35` rayon 16px.
- Chips centres d'intérêt : teintes 100 magenta/vert, texte 800.
- Rangées réglages : surface (var. 12) ou blanc + liseré (var. 13), rayon 18px, icône ronde 38px teintée ; hover neutre 200.
- Carte « Espace pro & asso » : fond vert 100, icône ronde `#0b7a35`, bouton « Ouvrir » `#085d28` Caprasimo.

### 5. Fiche détail (FicheCommerce)
- Photo pleine largeur 216px arrondie bas 30px, `.washed` ; retour (bulle claire) à gauche, cœur favori magenta à droite ; badge initiales 56px chevauchant (-24px).
- Titre + « Ouvert · 19 h 30 » vert 700 ; boutons « Suivre » (magenta plein, Caprasimo), « Itinéraire » (surface), partage rond.
- **Encart promo pleine voix magenta** `#d92ba3` rayon 22px : kicker 100, badge « −20 % » fond clair texte 800, titre blanc.
- « Prochainement ici » : carte écru/blanc, médaillon date rond vert `#0b7a35`.

### Barre d'onglets (BottomNav)
4 onglets Explorer / Carte / Favoris / Profil, icônes Lucide 21px, actif `font-weight:700` couleur magenta 700 `#9c1a71`, inactif neutre 600.

## Interactions
- Hover vignettes : élévation (ombre) ; hover chips outline : fond `#0b7a35` ; boutons pleins : teinte 600 du même accent.
- Focus clavier : `outline: 2px solid` accent courant, `offset 2px`.
- Vignette (fil ou pin carte) → Fiche détail ; loupe → écran/overlay de recherche (nouveau, non maquetté — champ plein écran suggéré).
- La photo produit passe par le traitement « washed » (désaturation légère) déjà visible dans les maquettes.

## Traitement photo « .washed »
`filter: saturate(.82) contrast(.92) brightness(1.04)` (ou équivalent existant) pour asseoir les photos dans la page.

## Fichiers de ce dossier
- `TeKi - Refonte.dc.html` — document de design actif : **tour 13** (variante blanche) et **tour 12** (variante écru) = les 5 écrans finaux ; tours 11/10 = explorations.
- `archive-tours-1-5.dc.html`, `archive-tours-6-9.dc.html` — historique des explorations (contexte seulement).
- `teki-logo-512.png` — logo (512px, à intégrer en 32px dans l'en-tête du fil).

Ouvrir les `.html` dans un navigateur pour voir les rendus (colonnes de téléphones 375×812).

## Correspondance repo (point de départ)
| Écran | Fichiers repo |
| --- | --- |
| Fil | `src/components/fil/FilScreen.tsx`, `src/lib/feed/demo.ts` |
| Carte | `src/components/map/MapEntryScreen.tsx`, `src/components/map/LeafletMap.tsx`, `src/components/map/pin-icon.ts` |
| Favoris / Fiche | `src/components/fiche/FicheCommerce.tsx`, `src/lib/fiches/demo.ts` |
| Nav | `src/components/nav/BottomNav.tsx` |

Favoris et Profil sont peut-être à créer. Centraliser les tokens ci-dessus (theme/tailwind config ou CSS variables) avant de toucher aux écrans.
