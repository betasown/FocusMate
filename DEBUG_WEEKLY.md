# 🐛 Debug : Vue Hebdomadaire

## Étapes de Débogage

### 1. Vérifier qu'il y a des devoirs dans la base

Dans Discord, tape :
```
/devoir-list type:tous
```

Si tu vois des devoirs, note leurs dates.

---

### 2. Vérifier les dates dans MariaDB

Exécute cette requête SQL :

```sql
SELECT 
    id,
    title,
    subject,
    due_date,
    DATE_FORMAT(due_date, '%W %d/%m/%Y %H:%i') as formatted_date,
    WEEK(due_date, 1) as week_number,
    YEAR(due_date) as year
FROM homeworks
WHERE guild_id = '1404436613148446721'
ORDER BY due_date;
```

Cela te montre :
- La date exacte de chaque devoir
- Le numéro de semaine
- L'année

---

### 3. Vérifier la semaine actuelle

```sql
SELECT 
    WEEK(NOW(), 1) as current_week,
    YEAR(NOW()) as current_year,
    DATE_FORMAT(NOW(), '%W %d/%m/%Y') as today;
```

---

### 4. Tester avec la commande

```
/agenda vue:semaine
```

Si ça ne marche pas, essaye :

```
/agenda vue:semaine decalage:0
```

Ou teste le mois :
```
/agenda vue:mois
```

---

### 5. Ajouter un devoir pour aujourd'hui

```
/devoir-add
```

Remplis :
- **Titre** : Test Debug
- **Matière** : Test
- **Date** : 14/10/2025 (aujourd'hui)
- **Description** : Test

Puis réessaye :
```
/agenda vue:semaine
```

---

### 6. Vérifier les logs du bot

Dans le terminal où le bot tourne, vérifie s'il y a des erreurs.

---

## Problèmes Possibles

### A. Les devoirs sont dans une autre semaine

**Solution** : Utilise `decalage` pour naviguer

```
/agenda vue:semaine decalage:1  # Semaine prochaine
/agenda vue:semaine decalage:-1 # Semaine dernière
```

### B. Format de date incorrect

Vérifie dans MariaDB :
```sql
SELECT due_date, 
       DAYOFWEEK(due_date) as day_of_week,
       DATE(due_date) as date_only
FROM homeworks;
```

`day_of_week` doit être :
- 1 = Dimanche
- 2 = Lundi
- 3 = Mardi
- etc.

### C. Timezone / Heure

Les dates sont stockées avec l'heure. Vérifie :

```sql
SELECT title, due_date, 
       DATE_FORMAT(due_date, '%Y-%m-%d %H:%i:%s') as full_date
FROM homeworks;
```

---

## Test Rapide

Essaye ces commandes dans l'ordre :

1. Ajouter un devoir pour demain :
```
/devoir-add
Titre: Test Demain
Matière: Test
Date: 15/10/2025
```

2. Voir le mois :
```
/agenda vue:mois
```
→ Le devoir doit apparaître

3. Voir la semaine :
```
/agenda vue:semaine
```
→ Le devoir doit aussi apparaître

---

## Commande SQL de Debug Complète

```sql
-- Voir tous les devoirs avec infos de semaine
SELECT 
    id,
    title,
    subject,
    due_date,
    DATE_FORMAT(due_date, '%W %d/%m/%Y %H:%i') as date_fr,
    WEEK(due_date, 1) as semaine,
    YEAR(due_date) as annee,
    DAYOFWEEK(due_date) as jour_semaine,
    CASE DAYOFWEEK(due_date)
        WHEN 1 THEN 'Dimanche'
        WHEN 2 THEN 'Lundi'
        WHEN 3 THEN 'Mardi'
        WHEN 4 THEN 'Mercredi'
        WHEN 5 THEN 'Jeudi'
        WHEN 6 THEN 'Vendredi'
        WHEN 7 THEN 'Samedi'
    END as jour_nom,
    completed
FROM homeworks
WHERE guild_id = '1404436613148446721'
ORDER BY due_date;
```

---

## Dis-moi :

1. **As-tu des devoirs dans la base ?** (utilise `/devoir-list type:tous`)
2. **Quelle est la date de ces devoirs ?**
3. **Quel message exact reçois-tu quand tu fais `/agenda` ?**
4. **Est-ce que `/agenda vue:mois` fonctionne ?**

Avec ces infos, je pourrai corriger le problème exact ! 🔧
