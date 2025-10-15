# ⏰ Ajout de l'Heure aux Devoirs

## 🎯 Nouvelle Fonctionnalité

Vous pouvez maintenant spécifier **l'heure exacte** d'échéance des devoirs !

---

## 📝 Comment Utiliser

### Avec Heure (Nouveau !)

Lors de l'ajout d'un devoir avec `/devoir-add`, dans le champ **Date d'échéance**, vous pouvez maintenant écrire :

```
15/10/2025 14:30
```

**Format** : `JJ/MM/AAAA HH:MM`

**Exemples valides** :
- `20/10/2025 08:00` → Le 20 octobre à 8h du matin
- `25/12/2025 14:30` → Le 25 décembre à 14h30
- `01/11/2025 23:59` → Le 1er novembre à 23h59
- `15/10/2025 9:15` → Le 15 octobre à 9h15 (l'heure peut être sur 1 ou 2 chiffres)

---

### Sans Heure (Par Défaut : 23:59)

Si vous ne spécifiez pas d'heure, le devoir sera automatiquement défini à **23:59** (fin de journée) :

```
15/10/2025
```

Équivaut à : `15/10/2025 23:59`

---

## 🎨 Affichage dans le Calendrier Hebdomadaire

### Avec Heure Spécifiée

L'heure apparaît en haut de chaque devoir dans la vue semaine :

```
┌─────────────┐
│ LUNDI   14  │
├─────────────┤
│             │
│ 08:00       │ ← Heure affichée
│ Maths       │
│ DM Ch.3     │
│             │
│ 14:30       │ ← Une autre heure
│ Français    │
│ Dissertation│
│             │
└─────────────┘
```

### Sans Heure (23:59 par défaut)

L'heure n'est pas affichée si c'est 00:00 (minuit) :

```
┌─────────────┐
│ MARDI   15  │
├─────────────┤
│             │
│ Histoire    │ ← Pas d'heure = toute la journée
│ Chapitre 5  │
│             │
└─────────────┘
```

---

## 📋 Exemples Complets

### Exemple 1 : Devoir avec Heure Précise

```
/devoir-add

Titre:       Contrôle de Mathématiques
Matière:     Mathématiques
Date:        20/10/2025 08:00
Description: Chapitres 1 à 5
```

**Résultat** : Le devoir apparaîtra le lundi 20 octobre avec l'indication "08:00"

---

### Exemple 2 : Devoir Sans Heure

```
/devoir-add

Titre:       Lire chapitre 3
Matière:     Français
Date:        22/10/2025
Description: Préparer questions
```

**Résultat** : Le devoir apparaîtra le mercredi 22 octobre sans heure (à rendre avant minuit)

---

### Exemple 3 : Plusieurs Devoirs le Même Jour

```
Devoir 1:
Date: 18/10/2025 09:00  → Affiché en premier

Devoir 2:
Date: 18/10/2025 14:00  → Affiché en second

Devoir 3:
Date: 18/10/2025 18:30  → Affiché en troisième
```

Les devoirs sont **automatiquement triés par heure** dans la vue semaine !

---

## ✅ Validation

### Heures Valides

✅ `00:00` à `23:59`  
✅ Format 24h  
✅ Minutes de `00` à `59`

### Heures Invalides

❌ `25:00` → Erreur : heure > 23  
❌ `14:60` → Erreur : minutes > 59  
❌ `8h30` → Erreur : format incorrect (utilisez `08:30`)  
❌ `2:5` → Erreur : minutes doivent avoir 2 chiffres (`02:05`)

---

## 🕐 Cas d'Usage

### Pour les Contrôles

```
Date: 25/10/2025 08:00
```
→ Heure de début du contrôle

### Pour les Rendus de Projet

```
Date: 30/10/2025 23:59
```
→ Deadline précise

### Pour les Exposés

```
Date: 15/10/2025 14:30
```
→ Heure de passage

### Pour les Lectures

```
Date: 20/10/2025
```
→ Pas d'heure spécifique (toute la journée)

---

## 🔧 Détails Techniques

### Base de Données

Les heures sont stockées dans le champ `due_date` (type DATETIME) :

```sql
SELECT 
    title,
    DATE_FORMAT(due_date, '%d/%m/%Y %H:%i') as date_formatee
FROM homeworks;
```

Exemple de résultat :
```
| title                  | date_formatee      |
|------------------------|-------------------|
| Contrôle Maths         | 20/10/2025 08:00 |
| Lire chapitre 3        | 22/10/2025 23:59 |
```

### Tri Automatique

Les devoirs sont triés par date ET heure :

```typescript
const dayHomeworks = homeworksByDay[i].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
);
```

---

## 💡 Conseils

### Utiliser l'Heure Quand...

✅ **Contrôle/Examen** → Heure de début précise  
✅ **Exposé oral** → Heure de passage  
✅ **Rendu de projet** → Deadline stricte  
✅ **TP/Labo** → Heure de séance

### Ne Pas Utiliser l'Heure Quand...

✅ **Lecture de chapitre** → Toute la journée  
✅ **Exercices à faire** → Pas d'heure précise  
✅ **Révisions** → Journée complète

---

## 🐛 Dépannage

### "Heure invalide"

**Problème** : Vous avez entré `14:5` au lieu de `14:05`

**Solution** : Les minutes doivent toujours avoir 2 chiffres
```
❌ 14:5
✅ 14:05
```

### "Format de date invalide"

**Problème** : Vous avez mis un espace en trop ou oublié l'espace

**Solutions** :
```
❌ 15/10/202514:30  (pas d'espace)
❌ 15/10/2025  14:30  (2 espaces)
✅ 15/10/2025 14:30  (1 espace)
```

### L'heure ne s'affiche pas

**Situation normale** : Si l'heure est `00:00`, elle n'est pas affichée (considérée comme "toute la journée")

**Pour forcer l'affichage** : Utilisez `00:01` au lieu de `00:00`

---

## 📊 Comparaison Avant/Après

### ❌ Avant (Sans Heure)

```
Tous les devoirs à 23:59
Impossible de distinguer l'ordre dans la journée
```

### ✅ Après (Avec Heure)

```
08:00 - Contrôle Maths
10:30 - Exposé Histoire  
14:00 - Rendu Projet
18:00 - TP Chimie
23:59 - Exercices Français
```

**Organisation claire de la journée ! 📅**

---

## 🚀 Prochaines Étapes

Maintenant tu peux :

1. **Redémarrer le bot** : `npm start`
2. **Tester** : `/devoir-add` avec une date et heure
3. **Vérifier** : `/agenda vue:semaine` pour voir l'heure affichée

**Exemple de test** :
```
/devoir-add
Titre: Test Heure
Matière: Test
Date: 14/10/2025 15:30
Description: Test du système d'heures
```

Puis :
```
/agenda vue:semaine
```

Tu devrais voir "15:30" affiché au-dessus du devoir ! ⏰
