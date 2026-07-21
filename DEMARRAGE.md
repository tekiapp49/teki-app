# Démarrer avec Claude Code sur le projet TéKi

Ce guide suppose que tu n'as jamais utilisé Claude Code. Compte environ une demi-journée pour la mise en place, avant même de commencer à construire l'appli.

## 1. Ce qu'il te faut avant de commencer

- Un ordinateur (Mac, Windows ou Linux)
- Un compte Anthropic avec un accès à Claude Code (abonnement Claude Pro/Max, ou un accès à l'API Anthropic avec du crédit)
- Un compte [Supabase](https://supabase.com) (gratuit pour démarrer) — c'est ce qui va gérer les comptes utilisateurs (téléphone + SMS) et stocker les données
- Un compte [Vercel](https://vercel.com) (gratuit pour démarrer) — c'est ce qui va héberger le site une fois construit
- Un compte [GitHub](https://github.com) (gratuit) — pour stocker le code

Aucun de ces comptes ne coûte quoi que ce soit pour un usage pilote à petite échelle.

## 2. Installer les outils de base

Ouvre le Terminal (sur Mac : Cmd+Espace puis tape "Terminal").

Installe Node.js si ce n'est pas déjà fait : télécharge-le sur [nodejs.org](https://nodejs.org) (choisis la version "LTS"), lance l'installeur.

Vérifie que ça fonctionne :
```
node --version
```

Installe Claude Code :
```
npm install -g @anthropic-ai/claude-code
```

Vérifie :
```
claude --version
```

## 3. Créer le dossier du projet

Crée un nouveau dossier sur ton ordinateur, par exemple `teki-app`, et place dedans le fichier `CLAUDE.md` que je t'ai préparé — c'est le fichier que Claude Code va lire automatiquement à chaque démarrage pour comprendre le projet, les règles et ce qu'il faut construire.

## 4. Lancer Claude Code

Dans le Terminal, déplace-toi dans le dossier :
```
cd chemin/vers/teki-app
```

Lance Claude Code :
```
claude
```

Il va détecter le fichier `CLAUDE.md` et avoir tout le contexte du projet.

## 5. Premier message à donner à Claude Code

Une fois Claude Code lancé, tu peux commencer par quelque chose comme :

> Lis CLAUDE.md. Initialise un projet Next.js avec TypeScript et Tailwind, connecté à Supabase pour l'auth par téléphone et la base de données.   (géolocalisation + repli manuel) décrit dans le fichier.

Claude Code va te poser des questions au fur et à mesure (clés Supabase à renseigner, choix techniques) — réponds-y comme tu le ferais avec moi ici. Il va créer les fichiers, et tu pourras lui demander de te montrer le résultat, de corriger, d'avancer écran par écran — exactement la même méthode qu'on a utilisée aujourd'hui, mais avec du vrai code à la clé.

## 6. Mettre en ligne

Une fois qu'une première version tourne sur ton ordinateur, connecte le dossier à un dépôt GitHub (Claude Code peut t'guider pour ça aussi), puis relie ce dépôt à Vercel — chaque mise à jour du code se déploie alors automatiquement sur une vraie adresse web, accessible à n'importe qui.

## Le plus important

Avance écran par écran, comme aujourd'hui. Ne demande pas à Claude Code de tout construire d'un coup — commence par l'entrée carte-first et une seule fiche commerce fonctionnelle, vérifie que ça marche vraiment (sur ton téléphone, en conditions réelles), puis enchaîne. C'est plus lent en apparence, mais c'est ce qui évite de se retrouver avec un projet à moitié cassé qu'on ne comprend plus.
