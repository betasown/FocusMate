# 📚 Système de Gestion des Devoirs - Documentation

## Vue d'ensemble

Ce système permet de gérer des devoirs dans Discord avec génération automatique d'un calendrier visuel coloré utilisant Canvas.

## ✨ Fonctionnalités

- 📝 **Ajouter des devoirs** avec titre, matière, date d'échéance et description
- 📅 **Calendrier visuel** généré automatiquement avec Canvas
- 🎨 **Couleurs par matière** pour une meilleure lisibilité
- 📋 **Lister les devoirs** avec différents filtres
- 💾 **Stockage MongoDB** persistant
- ✅ **Gestion de l'état** (terminé/en cours)

## 🎮 Commandes Discord

### `/devoir-add`

Ouvre un formulaire modal pour ajouter un nouveau devoir.

**Champs du formulaire:**

- **Titre** : Le nom du devoir (ex: "Exercice de mathématiques chapitre 5")
- **Matière** : La matière concernée (ex: "Mathématiques")
- **Date d'échéance** : Format JJ/MM/AAAA (ex: "25/12/2025")
- **Description** : (Optionnel) Détails supplémentaires

**Exemple:**

```
/devoir-add
→ Formulaire s'ouvre
→ Remplir les champs
→ Confirmer
```

### `/agenda`

Affiche un calendrier visuel du mois avec tous les devoirs.

**Options:**

- `mois` : Numéro du mois (1-12, défaut: mois actuel)
- `annee` : Année (2020-2030, défaut: année actuelle)
- `completes` : Inclure les devoirs terminés (oui/non, défaut: non)

**Exemples:**

```
/agenda
→ Affiche le calendrier du mois actuel

/agenda mois:12 annee:2025
→ Affiche le calendrier de décembre 2025

/agenda completes:true
→ Affiche le calendrier avec les devoirs terminés
```

### `/devoir-list`

Liste tous les devoirs sous forme de texte.

**Options:**

- `filtre` : Type de devoirs à afficher
  - **À venir** : Devoirs des 7 prochains jours
  - **En retard** : Devoirs dont la date est passée
  - **Terminés** : Devoirs marqués comme terminés
  - **Tous** : Tous les devoirs

**Exemples:**

```
/devoir-list
→ Affiche les devoirs à venir

/devoir-list filtre:"En retard"
→ Affiche les devoirs en retard
```

## 🎨 Palette de Couleurs

Le calendrier utilise des couleurs spécifiques pour chaque matière:

| Matière       | Couleur                   |
| ------------- | ------------------------- |
| Mathématiques | 🔴 Rouge (#FF6B6B)        |
| Français      | 🔷 Cyan (#4ECDC4)         |
| Anglais       | 🔵 Bleu (#45B7D1)         |
| Physique      | 🟠 Orange clair (#FFA07A) |
| Chimie        | 🟢 Vert menthe (#98D8C8)  |
| Histoire      | 🟡 Jaune (#F7DC6F)        |
| Géographie    | 🟣 Violet (#BB8FCE)       |
| SVT           | 🌿 Vert (#82E0AA)         |
| Informatique  | 💙 Bleu vif (#5DADE2)     |
| Sport         | 🟨 Orange (#F8B739)       |
| Philosophie   | 🟤 Marron clair (#E59866) |
| Autre         | ⚫ Gris (#95A5A6)         |

## 📁 Structure du Code

```
src/
├── commands/public/
│   ├── devoir-add.ts      # Commande pour ajouter un devoir
│   ├── devoir-list.ts     # Commande pour lister les devoirs
│   └── agenda.ts          # Commande pour afficher le calendrier
├── interactions/modal/
│   └── homework.add.ts    # Traitement du formulaire d'ajout
├── services/
│   └── homeworkDb.ts      # Service de gestion de la base de données
├── schema/bot/
│   └── homework.ts        # Schéma MongoDB
└── function/bot/
    └── CalendarGenerator.ts # Générateur de calendrier avec Canvas
```

## 🔧 Installation

1. **Installer la dépendance Canvas:**

```bash
npm install @napi-rs/canvas
```

2. **Compiler le projet:**

```bash
npm run build
```

3. **Démarrer le bot:**

```bash
npm start
```

## 📊 Base de Données

### Modèle Homework

```typescript
{
  title: string           // Titre du devoir
  subject: string         // Matière
  dueDate: Date          // Date d'échéance
  description?: string   // Description optionnelle
  createdBy: string      // ID Discord du créateur
  createdByName: string  // Nom du créateur
  guildId: string        // ID du serveur Discord
  completed: boolean     // État du devoir
  createdAt: Date        // Date de création
  updatedAt: Date        // Date de dernière modification
}
```

### Index

- `guildId + dueDate` : Pour recherches rapides par date
- `guildId + completed` : Pour filtrer les devoirs terminés

## 🎯 Exemple d'Utilisation

### Scénario Complet

1. **Ajouter des devoirs:**

```
/devoir-add
→ Titre: "DM de maths"
→ Matière: "Mathématiques"
→ Date: "20/10/2025"
→ Description: "Exercices 1 à 15 page 42"
```

2. **Voir le calendrier:**

```
/agenda
→ Le bot génère une image avec tous les devoirs du mois
→ Chaque devoir est coloré selon sa matière
→ Maximum 3 devoirs affichés par jour
```

3. **Lister les devoirs:**

```
/devoir-list filtre:"À venir"
→ Affiche la liste détaillée des devoirs à venir
```

## 🚀 Fonctionnalités Avancées

### Service HomeworkService

Le service offre plusieurs méthodes:

- `createHomework()` : Créer un nouveau devoir
- `getHomeworksByGuild()` : Récupérer tous les devoirs d'un serveur
- `getHomeworksByMonth()` : Récupérer les devoirs d'un mois
- `getUpcomingHomeworks()` : Devoirs à venir (N prochains jours)
- `getOverdueHomeworks()` : Devoirs en retard
- `markAsCompleted()` : Marquer un devoir comme terminé
- `updateHomework()` : Mettre à jour un devoir
- `deleteHomework()` : Supprimer un devoir

### Générateur de Calendrier

Le générateur utilise `@napi-rs/canvas` pour créer:

- Une grille de calendrier mensuel (7x6)
- Des rectangles colorés pour chaque devoir
- Une légende des matières
- Gestion intelligente de l'espace (max 3 devoirs/jour)

## 🐛 Résolution de Problèmes

### Problème: "Cannot find module 'canvas'"

**Solution:** Utilisez `@napi-rs/canvas` au lieu de `canvas` (fonctionne mieux sur Windows)

### Problème: "Date invalide"

**Solution:** Vérifiez le format de date (JJ/MM/AAAA) et que la date n'est pas passée

### Problème: "Image trop grande"

**Solution:** L'image fait 1400x1000px. Si nécessaire, ajustez les dimensions dans `CalendarGenerator.ts`

## 📝 Notes Techniques

- **Canvas:** Utilise `@napi-rs/canvas` (native bindings, performant)
- **Format d'image:** PNG
- **Dimensions:** 1400x1000 pixels
- **Police:** Arial (standard sur tous les OS)
- **Limite:** 3 devoirs affichés par jour sur le calendrier

## 🔮 Améliorations Futures

- [ ] Boutons pour marquer un devoir comme terminé
- [ ] Notifications de rappel avant échéance
- [ ] Export PDF du calendrier
- [ ] Vue hebdomadaire
- [ ] Statistiques (taux de complétion, etc.)
- [ ] Filtrage par matière dans le calendrier
- [ ] Personnalisation des couleurs par serveur

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.
