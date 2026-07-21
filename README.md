# TéKi

App web (Next.js, App Router, TypeScript) connectant habitants, commerçants/artisans
et associations d'un territoire rural — pilote sur les Mauges (Maine-et-Loire).
Voir [CLAUDE.md](./CLAUDE.md) pour le contexte produit complet.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Créer les tables : SQL Editor > New query > coller le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql) > Run.
3. Activer l'auth par téléphone (Authentication > Providers > Phone) et
   configurer un fournisseur SMS.
4. Copier `.env.local.example` en `.env.local` et renseigner
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project
   Settings > API).

Sans ce fichier `.env.local`, l'app fonctionne quand même (carte, géolocalisation,
recherche de commune) — seules les fonctionnalités d'inscription en dépendront.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS
- Supabase (auth téléphone/SMS, Postgres, storage)
- Leaflet + tuiles OpenStreetMap pour la carte
- Déploiement prévu sur Vercel
