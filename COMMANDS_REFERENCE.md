# 📝 Commandes Pratiques - Système de Devoirs

## 🚀 Installation et Compilation

```powershell
# Installation des dépendances (incluant @napi-rs/canvas)
npm install

# Compilation TypeScript → JavaScript
npm run build

# Démarrer le bot
npm start
```

## 🧪 Tester le Générateur

```powershell
# Générer un calendrier d'exemple avec 10 devoirs
node dist/test-calendar.js

# Ouvrir l'image générée
start dist/test-calendar.png
```

## 📋 Commandes Discord

### Ajouter un Devoir

```
/devoir-add
```

**Formulaire qui s'ouvre :**

- **Titre** : Nom du devoir (max 100 caractères)
- **Matière** : Matière concernée (max 50 caractères)
- **Date d'échéance** : Format JJ/MM/AAAA (ex: 25/12/2025)
- **Description** : Détails optionnels (max 500 caractères)

**Exemple de remplissage :**

```
Titre:       DM de Mathématiques
Matière:     Mathématiques
Date:        20/10/2025
Description: Exercices 1 à 15 page 42
```

---

### Afficher l'Agenda (Vue Hebdomadaire - PAR DÉFAUT)

```
/agenda
```
**Affiche la semaine en cours avec tous les détails**

```
/agenda vue:semaine
```
**Vue hebdomadaire explicite (7 jours, détails complets)**

```
/agenda vue:semaine decalage:1
```
**Semaine prochaine**

```
/agenda vue:semaine decalage:-1
```
**Semaine précédente**

```
/agenda vue:semaine completes:True
```
**Inclure les devoirs terminés**

**Avantages de la Vue Semaine :**
- ✅ Jusqu'à 12 devoirs visibles par jour
- ✅ Heures de rendu affichées
- ✅ Nom de la matière + titre du devoir
- ✅ Indicateur ✓ pour devoirs terminés
- ✅ Bordure dorée pour le jour actuel
- ✅ Navigation rapide (semaine par semaine)

---

### Afficher l'Agenda (Vue Mensuelle)

```
/agenda vue:mois
```
**Affiche le mois complet en format calendrier**

```
/agenda vue:mois decalage:1
```
**Mois prochain**

```
/agenda vue:mois decalage:-1
```
**Mois précédent**

**Avantages de la Vue Mois :**
- ✅ Vision d'ensemble sur 30 jours
- ✅ Identifier les périodes chargées
- ✅ Planification à long terme

**💡 Conseil** : Utilisez la vue semaine pour le quotidien, la vue mois pour la planification !

---

### Afficher le Calendrier

```
/agenda
/agenda mois:12
/agenda mois:12 annee:2025
/agenda completes:true
```

**Options :**

- `mois` : Numéro du mois (1-12) - Défaut: mois actuel
- `annee` : Année (2020-2030) - Défaut: année actuelle
- `completes` : Inclure devoirs terminés - Défaut: false

**Ce que vous obtenez :**

- Une image PNG de calendrier mensuel
- Devoirs colorés par matière
- Max 3 devoirs affichés par jour
- Légende des matières en bas
- Statistiques du mois

---

### Lister les Devoirs

```
/devoir-list
/devoir-list filtre:"À venir"
/devoir-list filtre:"En retard"
/devoir-list filtre:"Terminés"
/devoir-list filtre:"Tous"
```

**Filtres disponibles :**

- **À venir** (défaut) : Devoirs des 7 prochains jours
- **En retard** : Devoirs dont la date est dépassée
- **Terminés** : Devoirs marqués comme complétés
- **Tous** : Tous les devoirs sans filtre

**Format de réponse :**

- Embed Discord coloré
- Groupé par matière
- Dates formatées Discord
- Indicateur de statut (✅/⏳)

---

## 🎨 Matières et Couleurs

Pour que les devoirs apparaissent avec la bonne couleur, utilisez ces noms :

| Nom à utiliser         | Couleur      | Emoji |
| ---------------------- | ------------ | ----- |
| Mathématiques ou Maths | Rouge        | 🔴    |
| Français               | Cyan         | 🔷    |
| Anglais                | Bleu         | 🔵    |
| Physique               | Orange clair | 🟠    |
| Chimie                 | Vert menthe  | 🟢    |
| Histoire               | Jaune        | 🟡    |
| Géographie             | Violet       | 🟣    |
| SVT                    | Vert         | 🌿    |
| Informatique           | Bleu vif     | 💙    |
| Sport                  | Orange       | 🟨    |
| Philosophie            | Marron clair | 🟤    |
| Autre nom              | Gris         | ⚫    |

---

## 💾 Base de Données MongoDB

### Collection: `homeworks`

```javascript
{
  _id: ObjectId,
  title: String,           // Titre du devoir
  subject: String,         // Matière
  dueDate: Date,           // Date d'échéance
  description: String,     // Description (optionnel)
  createdBy: String,       // ID Discord du créateur
  createdByName: String,   // Nom du créateur
  guildId: String,         // ID du serveur Discord
  completed: Boolean,      // État (terminé ou non)
  createdAt: Date,         // Date de création
  updatedAt: Date          // Date de modification
}
```

### Index créés automatiquement :

- `guildId + dueDate` : Recherches par date
- `guildId + completed` : Filtrage par état

---

## 🔧 Développement

### Fichiers Principaux

```
src/
├── commands/public/
│   ├── devoir-add.ts      ← Commande d'ajout avec modal
│   ├── devoir-list.ts     ← Liste des devoirs
│   └── agenda.ts          ← Génération du calendrier
│
├── interactions/modal/
│   └── homework.add.ts    ← Traitement du formulaire
│
├── services/
│   └── homeworkDb.ts      ← CRUD MongoDB
│
├── schema/bot/
│   └── homework.ts        ← Modèle Mongoose
│
└── function/bot/
    └── CalendarGenerator.ts ← Génération d'images
```

### Ajouter une Nouvelle Couleur

Éditez `src/function/bot/CalendarGenerator.ts` :

```typescript
const SUBJECT_COLORS: { [key: string]: string } = {
  mathématiques: "#FF6B6B",
  "votre-matiere": "#COULEUR_HEX", // Ajoutez ici
  // ...
};
```

---

## 🧹 Maintenance

### Nettoyer les Devoirs Terminés

Via MongoDB :

```javascript
db.homeworks.deleteMany({ completed: true });
```

### Supprimer les Devoirs Anciens

Via MongoDB :

```javascript
const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

db.homeworks.deleteMany({
  dueDate: { $lt: threeMonthsAgo },
  completed: true,
});
```

### Voir les Statistiques

Via MongoDB :

```javascript
// Compter les devoirs par matière
db.homeworks.aggregate([
  { $group: { _id: "$subject", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Compter les devoirs par mois
db.homeworks.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$dueDate" },
        month: { $month: "$dueDate" },
      },
      count: { $sum: 1 },
    },
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } },
]);
```

---

## 📊 Exemples d'Utilisation

### Cas 1 : Ajouter Plusieurs Devoirs

```
/devoir-add
→ DM Maths pour le 20/10/2025

/devoir-add
→ Exposé Histoire pour le 22/10/2025

/devoir-add
→ TP Physique pour le 25/10/2025

/agenda
→ Voir tous les devoirs sur le calendrier
```

### Cas 2 : Consulter les Priorités

```
/devoir-list filtre:"À venir"
→ Voir ce qui arrive dans la semaine

/devoir-list filtre:"En retard"
→ Voir ce qui n'a pas été fait
```

### Cas 3 : Préparer le Mois Suivant

```
/agenda mois:11 annee:2025
→ Voir le calendrier de novembre

/devoir-add
→ Ajouter les devoirs déjà connus pour novembre
```

---

## 🔍 Débogage

### Le calendrier ne s'affiche pas

```powershell
# Vérifier que canvas est installé
npm list @napi-rs/canvas

# Retester le générateur
node dist/test-calendar.js
```

### Erreur "Date invalide"

- Format accepté : **JJ/MM/AAAA**
- Exemples valides : `01/12/2025`, `25/12/2025`
- Exemples invalides : `1/12/25`, `2025-12-01`

### Erreur MongoDB

```powershell
# Vérifier que MongoDB est en cours d'exécution
# Vérifier la connexion dans .env

# Tester la connexion
node -e "const mongoose = require('mongoose'); mongoose.connect('VOTRE_URI').then(() => console.log('OK'))"
```

---

## 📚 Documentation

- **`QUICKSTART.md`** : Guide de démarrage rapide
- **`HOMEWORK_SYSTEM.md`** : Documentation technique complète
- **`RECAP_HOMEWORK.md`** : Récapitulatif et guide utilisateur
- **`VISUAL_EXAMPLE.md`** : Exemples visuels et flux

---

## ⚡ Raccourcis PowerShell

Créez un fichier `dev.ps1` :

```powershell
# Compilation rapide
function Build { npm run build }

# Test du calendrier
function TestCal {
    npm run build
    node dist/test-calendar.js
    start dist/test-calendar.png
}

# Démarrage complet
function Start {
    npm run build
    npm start
}

# Alias
Set-Alias b Build
Set-Alias t TestCal
Set-Alias s Start
```

Utilisation :

```powershell
# Charger les commandes
. .\dev.ps1

# Utiliser les raccourcis
b      # Build
t      # Test calendrier
s      # Start bot
```

---

## 🎯 Checklist de Test

Avant de déployer :

- [ ] `npm install` réussi
- [ ] `npm run build` sans erreurs
- [ ] `node dist/test-calendar.js` génère l'image
- [ ] MongoDB connecté
- [ ] Bot Discord en ligne
- [ ] `/devoir-add` fonctionne
- [ ] `/agenda` affiche un calendrier
- [ ] `/devoir-list` liste les devoirs
- [ ] Couleurs correctes par matière
- [ ] Dates formatées correctement

---

## 🚀 Prêt à Utiliser !

Votre système est complet et prêt. Bonne organisation de vos devoirs ! 📚✨
