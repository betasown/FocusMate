# 📅 Vue Hebdomadaire de l'Agenda

## 🎯 Nouvelle Fonctionnalité

Le système d'agenda propose maintenant **deux modes d'affichage** :
- **📅 Vue Semaine** (par défaut) : Affiche 7 jours avec plus de détails
- **📆 Vue Mois** : Affiche le mois complet en format calendrier

---

## 🚀 Utilisation

### Vue Hebdomadaire (Par Défaut)

```
/agenda
```
**Affiche la semaine en cours**

```
/agenda vue:semaine
```
**Spécifie explicitement la vue semaine**

```
/agenda vue:semaine decalage:1
```
**Affiche la semaine prochaine**

```
/agenda vue:semaine decalage:-1
```
**Affiche la semaine précédente**

```
/agenda vue:semaine decalage:2
```
**Affiche dans 2 semaines**

```
/agenda vue:semaine completes:True
```
**Inclut les devoirs terminés**

---

### Vue Mensuelle

```
/agenda vue:mois
```
**Affiche le mois en cours**

```
/agenda vue:mois decalage:1
```
**Affiche le mois prochain**

```
/agenda vue:mois decalage:-1
```
**Affiche le mois précédent**

---

## 🎨 Caractéristiques de la Vue Hebdomadaire

### Design
- **Format horizontal** : 7 colonnes (Lundi → Dimanche)
- **Plus d'espace** : Jusqu'à 12 devoirs visibles par jour
- **Détails enrichis** :
  - 🕒 Heures des devoirs (si spécifiées)
  - 📚 Nom de la matière
  - 📝 Titre du devoir
  - ✓ Indicateur si terminé

### Mise en Évidence
- **Jour actuel** : Bordure dorée (#FFD700) et fond légèrement illuminé
- **Couleurs par matière** : Chaque matière a sa propre couleur distinctive
- **Statut visuel** : Coche verte ✓ pour les devoirs terminés

### Navigation
- **Semaine en cours** : `decalage:0` (par défaut)
- **Semaine suivante** : `decalage:1`
- **Semaine précédente** : `decalage:-1`
- **Dans X semaines** : `decalage:X`

---

## 📊 Comparaison Vue Semaine vs Vue Mois

| Critère | Vue Semaine 📅 | Vue Mois 📆 |
|---------|---------------|-------------|
| **Période** | 7 jours | ~30 jours |
| **Détails** | Très détaillés | Vue d'ensemble |
| **Devoirs par jour** | Jusqu'à 12 | Jusqu'à 3 |
| **Informations** | Heure + Matière + Titre | Titre seulement |
| **Idéal pour** | Planification quotidienne | Vision globale |
| **Lisibilité** | Excellente | Bonne |

---

## 💡 Cas d'Usage

### Vue Semaine - Idéale Pour :
✅ **Planifier sa semaine** de travail  
✅ **Voir les détails** de chaque devoir  
✅ **Organiser son temps** au jour le jour  
✅ **Suivre les heures** de rendu  
✅ **Navigation rapide** (semaine par semaine)  

### Vue Mois - Idéale Pour :
✅ **Vue d'ensemble** de ses obligations  
✅ **Identifier les périodes chargées**  
✅ **Planification à long terme**  
✅ **Vérifier la disponibilité** d'une date  

---

## 🎯 Exemples Concrets

### Scénario 1 : Planifier Mon Lundi
```
/agenda vue:semaine
```
→ Je vois tous mes devoirs de la semaine avec les heures de rendu

### Scénario 2 : Anticiper la Semaine Prochaine
```
/agenda vue:semaine decalage:1
```
→ Je prépare ma semaine à venir

### Scénario 3 : Vision Mensuelle des Contrôles
```
/agenda vue:mois
```
→ Je visualise la répartition des devoirs sur tout le mois

### Scénario 4 : Vérifier les Devoirs Passés
```
/agenda vue:semaine decalage:-1 completes:True
```
→ Je revois la semaine dernière avec les devoirs terminés

---

## 🎨 Palette de Couleurs

Les matières sont automatiquement colorées :

| Matière | Couleur | Code |
|---------|---------|------|
| 📐 Mathématiques | Rouge corail | #FF6B6B |
| 📝 Français | Turquoise | #4ECDC4 |
| 🇬🇧 Anglais | Bleu ciel | #45B7D1 |
| ⚡ Physique | Orange saumon | #FFA07A |
| 🧪 Chimie | Vert d'eau | #98D8C8 |
| 📜 Histoire | Jaune doré | #F7DC6F |
| 🌍 Géographie | Violet pastel | #BB8FCE |
| 🌱 SVT | Vert menthe | #82E0AA |
| 💻 Informatique | Bleu azur | #5DADE2 |
| ⚽ Sport | Orange vif | #F8B739 |
| 🤔 Philosophie | Orange terre | #E59866 |
| ❓ Autres | Gris | #95A5A6 |

---

## 📐 Spécifications Techniques

### Vue Hebdomadaire
- **Résolution** : 1400 × 1000 px
- **Format** : PNG
- **Colonnes** : 7 (une par jour)
- **Hauteur des devoirs** : 60px + 8px d'espacement
- **Polices** :
  - Titre : Arial Bold 42px
  - Jours : Arial Bold 22px
  - Devoirs : Arial Bold 12px / Arial 11px

### Algorithme de Semaine
- **Début de semaine** : Lundi
- **Calcul** : ISO 8601 (numéro de semaine standard)
- **Navigation** : Décalage en multiples de 7 jours

---

## 🔧 Personnalisation

### Ajouter une Nouvelle Matière avec Couleur

Modifiez `src/function/bot/CalendarGenerator.ts` :

```typescript
const SUBJECT_COLORS: { [key: string]: string } = {
    'mathématiques': '#FF6B6B',
    'maths': '#FF6B6B',
    // ... autres matières ...
    'espagnol': '#FF69B4',  // ← Ajoutez ici
    'allemand': '#9370DB',  // ← Et ici
};
```

Recompilez :
```powershell
npm run build
```

---

## 🐛 Dépannage

### Problème : "Pas de devoir" alors que j'ai ajouté des devoirs

**Solution** : Vérifiez que :
1. Les devoirs sont bien dans la semaine affichée
2. La date est correcte (format DD/MM/YYYY)
3. Le serveur Discord correspond (guild_id)

```sql
-- Vérifier dans MariaDB
SELECT title, due_date, subject FROM homeworks 
WHERE guild_id = 'VOTRE_GUILD_ID'
ORDER BY due_date;
```

### Problème : L'image est coupée

**Solution** : Si vous avez trop de devoirs (>12 par jour), l'indicateur "+X autres" apparaît. C'est normal pour éviter la saturation visuelle.

### Problème : La couleur n'apparaît pas

**Solution** : Le nom de la matière doit correspondre exactement (insensible à la casse) :
- ✅ "Mathématiques" → Rouge
- ✅ "mathématiques" → Rouge
- ✅ "MATHÉMATIQUES" → Rouge
- ❌ "Math" → Gris (par défaut)

Ajoutez des alias dans `SUBJECT_COLORS` :
```typescript
'math': '#FF6B6B',
'maths': '#FF6B6B',
'mathématiques': '#FF6B6B',
```

---

## 📈 Statistiques Affichées

Avec chaque vue, vous obtenez :

1. **Période affichée** (Semaine X ou Mois Y)
2. **Nombre total de devoirs**
3. **Répartition par matière** (triée par nombre décroissant)
4. **Conseil de navigation** (commande pour semaine/mois suivant)

Exemple :
```
📅 Semaine 42 (16 octobre - 22 octobre 2025)
📚 8 devoir(s) cette semaine

Répartition par matière:
• Mathématiques: 3 devoir(s)
• Français: 2 devoir(s)
• Anglais: 2 devoir(s)
• Physique: 1 devoir(s)

💡 Utilisez `/agenda vue:semaine decalage:1` pour la semaine suivante
```

---

## 🎓 Bonnes Pratiques

### Pour les Étudiants

1. **Chaque lundi** : `/agenda vue:semaine` pour planifier
2. **Chaque dimanche** : `/agenda vue:semaine decalage:1` pour anticiper
3. **Chaque début de mois** : `/agenda vue:mois` pour la vision globale

### Pour les Délégués de Classe

1. **Partager la vue mensuelle** en début de mois
2. **Alerter sur les périodes chargées** (>5 devoirs/semaine)
3. **Utiliser `completes:True`** pour suivre l'avancement collectif

### Pour les Professeurs (si accès)

1. **Vue mensuelle** pour équilibrer les devoirs
2. **Éviter les surcharges** (vérifier avant d'ajouter un devoir)
3. **Couleurs distinctives** pour faciliter l'identification

---

## 🚀 Améliorations Futures Possibles

- [ ] Filtrer par matière dans la vue semaine
- [ ] Exporter en PDF
- [ ] Notifications automatiques (veille de devoir)
- [ ] Vue journalière ultra-détaillée
- [ ] Synchronisation avec Google Calendar
- [ ] Mode sombre / Mode clair
- [ ] Personnalisation des couleurs par utilisateur

---

## 📚 Commandes Associées

- `/devoir-add` - Ajouter un nouveau devoir
- `/devoir-list` - Lister les devoirs en texte
- `/agenda` - Afficher le calendrier visuel

---

**La vue hebdomadaire est maintenant le mode par défaut pour une meilleure expérience utilisateur ! 🎉**
