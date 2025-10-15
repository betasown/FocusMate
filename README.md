# Bot de productivité — Discord (TypeScript)

Ce dépôt contient un bot Discord écrit en TypeScript orienté productivité (gestion de devoirs, calendrier, reminders, todo). Le projet est conçu pour être simple à étendre : handlers dynamiques, commandes slash, interactions (boutons, modals, select menus) et génération d'images pour calendriers.

## Points clés

- Chargement dynamique des handlers (évite les imports bloquants au démarrage).
- Commandes publiques et privées (enregistrement auprès de l'API Discord).
- Générateur d'image pour calendrier hebdo/mensuel (`src/function/bot/CalendarGenerator.ts`).
- Routines planifiées (`src/routine.ts`) pour publier l'EDT et envoyer des notifications.

## Prérequis

- Node.js 18+
- npm
- MariaDB/MySQL si vous utilisez la persistance (le projet contient des services pour MariaDB)

## Variables d'environnement

Copiez `.env.example` (ou créez `.env`) et renseignez les valeurs nécessaires. Variables importantes :

- `token` : token du bot Discord
- `client` : application/client ID Discord
- `guild` : guild (server) ID (utilisé pour les commandes privées pendant le développement)
- `port` : port HTTP si utilisé (ex: 3000)
- `MARIADB_HOST`, `MARIADB_PORT`, `MARIADB_USER`, `MARIADB_PASSWORD`, `MARIADB_DATABASE` : configuration MariaDB
- `EDT_CHANNEL_ID` ou `NOTIFY_CHANNEL_ID` : canal par défaut pour publier l'EDT / notifications
- `NOTIFY_PING` : texte de ping pour les rappels (ex: `@here` ou `<@&ROLE_ID>`) — facultatif

Ne commitez jamais votre `.env` avec un token réel.

## Installation

1. Installer les dépendances :

```powershell
npm install
```

2. Compiler TypeScript :

```powershell
npm run build
```

3. Démarrer le bot :

```powershell
npm run start
```

## Commandes principales (exemples)

Les commandes disponibles se trouvent dans `src/commands/private` et `src/commands/public`.

- `/devoir-add` : ouvre un modal pour ajouter un devoir (titre, matière, date, description).
- `/devoir-list` : liste les devoirs (filtrage par `upcoming`, `overdue`, `completed`, `all`).
- `/devoir-delete id:<number>` : supprime un devoir par ID.
- `/devoir-delete-select` : ouvre un menu donnant les devoirs récents ; sélection puis suppression.
- `/agenda` : génère une image du calendrier hebdo ou mensuel et l'envoie (EDT/Agenda).
- `/edt` or `/edt-fast` : commandes liées au calendrier externe / iCal.

Interactions :

- Boutons, select menus et modals pour modifier/ajouter/supprimer des éléments (voir `src/interactions`).

Notes :

- Certaines commandes sont « privées » et sont déployées en scope guild (utile pendant le développement).

## Notifications / Reminders

Le bot contient une routine (`src/routine.ts`) qui exécute :

- une tâche planifiée pour publier l'EDT (configurable via `EDT_CRON`),
- un cron minute qui vérifie les devoirs à venir et envoie un rappel environ 15 minutes avant pour les devoirs qui ont une heure explicite.

Configuration :

- `NOTIFY_PING` : texte à utiliser pour ping (par défaut `@here`).
- `NOTIFY_CHANNEL_ID` : canal où poster les rappels (sinon utilisation de `EDT_CHANNEL_ID` ou `guild.systemChannel`).

Limitations actuelles :

- Le suivi des notifications envoyées est en mémoire (redémarrage du bot peut ré-envoyer des rappels pour événements proches). Pour robustesse, on peut persister les notifications envoyées en base.

## Développement & structure

- `src/bot.ts` : point d'entrée ; charge dynamiquement les handlers.
- `src/handlers/*` : registration des commandes, boutons, modals, selectmenus.
- `src/commands/*` : implémentations des commandes slash.
- `src/interactions/*` : handlers pour boutons / modals / select menus.
- `src/services/*` : accès base de données (homework, todo, etc.).
- `src/function/bot/CalendarGenerator.ts` : génération d'images (canvas native via @napi-rs/canvas).
- `src/routine.ts` : tâches planifiées (cron) et logic de notifications.

## Dépannage

- Erreur Discord 50035 (duplicate name) : les handlers font maintenant une déduplication automatique avant d'envoyer le payload à l'API.
- Si le bot ne s'authentifie pas : vérifie `token` et autorisations de l'application.
- Si la génération d'image plante : vérifie que `@napi-rs/canvas` est correctement installé sur ton OS (souvent binaire natif) et que tu as les dépendances système.

## Idées / évolutions possibles

- Persister les reminders envoyés en base pour éviter doublons après redémarrage.
- Ajouter un système de permissions plus fin (qui peut supprimer/voir les agendas).
- Ajouter export CSV/PDF, partage sécurisé d'agenda, ou intégration calendar externe complète.

## Contribution

Les contributions sont bienvenues : fork, branche feature, PR. Respecte l'indentation et le style TypeScript existant.
