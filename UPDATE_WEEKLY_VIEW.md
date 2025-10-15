# 🎉 MISE À JOUR : Vue Hebdomadaire Ajoutée !

## ✨ Nouveautés

Le système d'agenda a été amélioré avec une **vue hebdomadaire par défaut** !

---

## 🚀 Démarrage Rapide

### 1. Recompiler le Bot

```powershell
npm run build
```

### 2. Démarrer le Bot

```powershell
npm start
```

### 3. Utiliser la Nouvelle Vue

Dans Discord :

```
/agenda
```

**Par défaut, vous obtenez maintenant la vue semaine ! 📅**

---

## 📊 Deux Modes d'Affichage

| Commande | Vue | Détails |
|----------|-----|---------|
| `/agenda` | 📅 **Semaine** (défaut) | 7 jours, jusqu'à 12 devoirs/jour, heures visibles |
| `/agenda vue:semaine` | 📅 **Semaine** | Même chose (explicite) |
| `/agenda vue:mois` | 📆 **Mois** | ~30 jours, jusqu'à 3 devoirs/jour, vue d'ensemble |

---

## 🎯 Exemples d'Utilisation

### Planifier Ma Semaine
```
/agenda
```
→ Semaine actuelle avec tous les détails

### Voir la Semaine Prochaine
```
/agenda vue:semaine decalage:1
```
→ Anticiper les devoirs à venir

### Voir la Semaine Dernière
```
/agenda vue:semaine decalage:-1
```
→ Vérifier ce qui a été fait

### Vision Mensuelle
```
/agenda vue:mois
```
→ Vue d'ensemble sur 30 jours

### Inclure les Devoirs Terminés
```
/agenda vue:semaine completes:True
```
→ Voir tous les devoirs (y compris ✓ terminés)

---

## 🎨 Caractéristiques Visuelles

### Vue Hebdomadaire (1400×1000px)

```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ LUNDI   │ MARDI   │ MERCREDI│ JEUDI   │ VENDREDI│ SAMEDI  │DIMANCHE │
│   14    │   15    │   16    │   17    │   18    │   19    │   20    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│         │         │         │         │         │         │         │
│ 08:00   │ 14:00   │         │ 10:00   │         │         │         │
│ Maths   │ Français│         │ Anglais │         │         │         │
│ DM Ch.3 │ Dissert.│         │ Unit 5  │         │         │         │
│   ✓     │         │         │         │         │         │         │
│         │         │         │         │         │         │         │
│         │ 16:00   │         │         │ 18:00   │         │         │
│         │ Physique│         │         │ Chimie  │         │         │
│         │ TP Opt. │         │         │ Lab 4   │         │         │
│         │         │         │         │         │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

**Légende :** 
- 🟥 Mathématiques
- 🟦 Français  
- 🟨 Anglais
- 🟧 Physique
- 🟩 Chimie

---

## 🔥 Avantages

### Vue Semaine
✅ **Détails complets** : Heures, matières, titres  
✅ **Jusqu'à 12 devoirs par jour** affichés  
✅ **Jour actuel** mis en évidence (bordure dorée)  
✅ **Navigation rapide** : `decalage:1` pour semaine suivante  
✅ **Indicateur visuel** : ✓ vert pour devoirs terminés  
✅ **Idéal pour** : Planification quotidienne

### Vue Mois
✅ **Vision d'ensemble** sur 30 jours  
✅ **Identifier les périodes chargées**  
✅ **Planification à long terme**  
✅ **Idéal pour** : Vision globale du mois

---

## 📚 Documentation Complète

- **WEEKLY_VIEW.md** : Guide complet de la vue hebdomadaire
- **COMMANDS_REFERENCE.md** : Référence de toutes les commandes
- **HOMEWORK_SYSTEM.md** : Architecture du système
- **MARIADB_SETUP.md** : Configuration de la base de données

---

## 🎓 Workflow Recommandé

### Lundi Matin
```
/agenda vue:semaine
```
→ Planifier la semaine

### Dimanche Soir
```
/agenda vue:semaine decalage:1
```
→ Anticiper la semaine prochaine

### Début de Mois
```
/agenda vue:mois
```
→ Vision globale du mois

---

## 🐛 En Cas de Problème

### "Aucun devoir" alors que j'en ai ajouté ?

Vérifiez que :
1. La date est correcte (format DD/MM/YYYY)
2. Le devoir est bien dans la semaine affichée
3. Vous êtes sur le bon serveur Discord

### L'image ne se génère pas ?

```powershell
# Vérifier que @napi-rs/canvas est installé
npm list @napi-rs/canvas

# Réinstaller si nécessaire
npm install @napi-rs/canvas

# Recompiler
npm run build
```

### Les couleurs ne correspondent pas ?

Le nom de la matière doit correspondre aux alias définis :
- "Mathématiques", "Maths", "maths" → Rouge
- "Français", "français" → Turquoise
- Etc.

Ajoutez vos propres alias dans `src/function/bot/CalendarGenerator.ts`

---

## 🎨 Palette de Couleurs

| Matière | Couleur |
|---------|---------|
| Mathématiques | 🟥 Rouge corail |
| Français | 🟦 Turquoise |
| Anglais | 🟦 Bleu ciel |
| Physique | 🟧 Orange saumon |
| Chimie | 🟩 Vert d'eau |
| Histoire | 🟨 Jaune doré |
| Géographie | 🟪 Violet pastel |
| SVT | 🟢 Vert menthe |
| Informatique | 🟦 Bleu azur |
| Sport | 🟧 Orange vif |
| Philosophie | 🟫 Orange terre |
| Autres | ⬜ Gris |

---

## 🔧 Commandes Système

```powershell
# Compiler
npm run build

# Démarrer
npm start

# Tester le calendrier
node dist/test-calendar.js
start dist/test-calendar.png
```

---

## 🎉 C'est Prêt !

La vue hebdomadaire est maintenant **active par défaut**.

Testez dès maintenant :
```
/agenda
```

**Profitez de votre nouveau système d'agenda amélioré ! 🚀**
