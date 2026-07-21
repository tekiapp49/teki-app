# TéKi — pas-à-pas pour construire l'app avec Claude Code

Ce guide part du principe que `CLAUDE.md` et `DEMARRAGE.md` sont dans le dossier du projet, et que Claude Code est installé (voir `DEMARRAGE.md` sinon). Il donne les étapes dans l'ordre, avec le prompt à donner à chaque fois et ce qu'il faut vérifier avant de passer à la suite. Garde le PDF `Teki-ecrans-valides.pdf` ouvert à côté — c'est la référence visuelle de chaque écran.

**Règle d'or : une étape à la fois.** Ne demande jamais "construis toute l'appli" — c'est exactement l'erreur à éviter. Termine une étape, teste-la en vrai, puis seulement enchaîne.

## Étape 0 — Comptes à créer avant de commencer

- [Supabase](https://supabase.com) → créer un projet (gratuit). Noter l'URL du projet et la clé API (`anon key`), Claude Code te demandera de les renseigner.
- [Vercel](https://vercel.com) → créer un compte (gratuit), connecté à GitHub.
- [GitHub](https://github.com) → créer un compte si tu n'en as pas, créer un dépôt vide nommé `teki-app`.

## Étape 1 — Initialiser le projet

Prompt à donner à Claude Code :

> Lis CLAUDE.md. Initialise un projet Next.js (App Router, TypeScript) avec Tailwind CSS. Connecte-le à Supabase (je vais te donner l'URL et la clé API). Crée les tables décrites dans la section "Modèle de données" de CLAUDE.md. Ne construis aucun écran pour l'instant, juste la base technique.

**Vérifier avant de continuer :** le projet démarre en local (`npm run dev`), la connexion à Supabase fonctionne (Claude Code peut te montrer comment vérifier).

## Étape 2 — Écran d'entrée carte-first

Prompt :

> Construis l'écran d'entrée décrit dans CLAUDE.md (section "Périmètre V1", point 1) : demande de géolocalisation avec message explicatif, et repli par recherche manuelle de commune si refusée. Utilise Leaflet + OpenStreetMap pour la carte. Reprends l'identité visuelle (couleurs, style) décrite dans CLAUDE.md. Réfère-toi à la page 1, 2 et 3 du PDF Teki-ecrans-valides pour le rendu attendu.

**Vérifier :** ouvre le site sur ton téléphone (pas juste l'ordinateur), teste le "Autoriser" et le "refuser" de la géolocalisation, vérifie que les deux chemins fonctionnent.

## Étape 3 — Une fiche commerce (avec données factices)

Prompt :

> Crée une fiche commerce avec des données de test (une boulangerie), en respectant la règle visible/verrouillé décrite dans CLAUDE.md (section 4). Pas encore de vraie logique d'inscription à ce stade — simule juste l'état "visiteur non inscrit" avec les infos verrouillées. Réfère-toi à la page 8 du PDF.

**Vérifier :** la fiche s'affiche correctement, les infos verrouillées (téléphone, itinéraire, détail de l'offre) sont bien floutées/grisées avec le mot "Gratuit" visible.

## Étape 4 — Inscription réelle (téléphone + SMS)

Prompt :

> Implémente l'inscription par téléphone + code SMS avec Supabase Auth (OTP phone). Quand un visiteur clique sur une info verrouillée, déclenche ce flux. Après validation du code, l'utilisateur doit revenir automatiquement sur l'écran d'où il venait, avec l'action débloquée — voir CLAUDE.md section 4, "Retour après inscription". Réfère-toi aux pages 5, 6 et 9 du PDF.

**Vérifier — celle-ci est importante :** teste avec ton vrai numéro de téléphone, vérifie que tu reçois vraiment le SMS, vérifie que tu reviens bien sur la fiche débloquée après le code.

## Étape 5 — Profil (complétion à l'inscription)

Prompt :

> Ajoute l'écran de complétion de profil juste après l'inscription : prénom obligatoire, nom optionnel, un centre d'intérêt minimum (icônes), un lieu de référence, naissance/adresse optionnels. Respecte la règle "pas de mention facultatif" de CLAUDE.md. Réfère-toi à la page 7 du PDF.

**Vérifier :** impossible de continuer sans prénom ni centre d'intérêt ; le reste est bien laissable vide.

## Étape 6 — Fil d'accueil "TéKi là"

Prompt :

> Construis le fil d'accueil décrit dans CLAUDE.md (section "Périmètre V1", points 2 et 3) : liste des commerces/associations/événements avec offre ou événement actif, triée par favoris puis proximité, filtrée par les 4 familles en icônes. Réfère-toi à la page 11 du PDF.

**Vérifier :** avec plusieurs fiches de test à des distances différentes, l'ordre d'affichage suit bien la règle (favoris d'abord, puis proximité).

## Étape 7 — Favoris

Prompt :

> Ajoute la page Favoris avec ses trois sections (Nouveautés, À venir, Mes favoris) et son état vide, décrite dans CLAUDE.md. Réfère-toi aux pages 14 et 15 du PDF.

## Étape 8 — Profil principal et espace pro minimal

Prompt :

> Ajoute l'écran Profil principal (infos, réglages notifications/localisation, section "Mes fiches pro"), et un espace pro minimal avec le bandeau de contexte coloré permanent et la fonction "Publier" (Promo/Événement/Actu, durée de validité, conditions, publication immédiate ou programmée). Réfère-toi aux pages 16, 17 et 18 du PDF.

**Rappel important (voir CLAUDE.md, "Différé") :** pas besoin de construire l'auto-inscription des commerçants pour l'instant — les fiches de la commune pilote seront ajoutées à la main, directement dans Supabase.

## Étape 9 — Mettre en ligne

Prompt :

> Connecte ce projet à mon dépôt GitHub teki-app et prépare le déploiement sur Vercel.

Ensuite, sur [vercel.com](https://vercel.com) : "Add New Project" → sélectionner le dépôt GitHub → suivre les instructions à l'écran (Vercel détecte Next.js automatiquement). Il faudra renseigner les mêmes clés Supabase que Claude Code a utilisées en local, dans les "Environment Variables" de Vercel.

**Vérifier :** ouvrir l'adresse Vercel sur ton téléphone, refaire tout le parcours (géoloc → fiche → inscription → profil) en conditions réelles.

## Étape 10 — Remplir avec les vraies fiches de la commune pilote

Une fois que tout fonctionne avec des données de test, ajoute les 15-20 premiers commerces/associations réels directement dans Supabase (table `fiches`), comme prévu dans la stratégie de lancement — pas besoin d'attendre que l'espace pro self-service soit parfait pour commencer à tester avec de vrais habitants.

---

Si un écran ne correspond pas à ce qu'on a validé aujourd'hui, montre à Claude Code la page correspondante du PDF et demande-lui d'ajuster — exactement comme on l'a fait ensemble ici.
