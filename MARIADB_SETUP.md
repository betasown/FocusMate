# 📊 Configuration MariaDB pour le Système de Devoirs

## ✅ Bonne Nouvelle !

Le système utilise **MariaDB** (que vous avez déjà configuré) au lieu de MongoDB.

---

## 🎯 Deux Options pour Créer la Table

### Option 1 : Automatique (Recommandé) ⭐

**Le bot crée automatiquement la table au démarrage !**

Rien à faire ! Quand vous démarrez le bot avec `npm start`, il crée automatiquement la table `homeworks` si elle n'existe pas.

Vous verrez ce message :
```
✅ Homework table initialized
```

**Avantages :**
- ✅ Aucune manipulation manuelle
- ✅ Fonctionne automatiquement
- ✅ Table créée avec les bons index

---

### Option 2 : Manuelle (Si vous préférez)

Si vous préférez créer la table manuellement ou avoir le contrôle total :

#### 1. Connexion à MariaDB

**Avec un client graphique (HeidiSQL, phpMyAdmin, etc.) :**
- Connectez-vous à votre base de données
- Ouvrez l'onglet SQL

**Avec la ligne de commande :**
```bash
mysql -u votre_utilisateur -p votre_base_de_donnees
```

#### 2. Exécuter le Script SQL

Le fichier `sql/create_homeworks_table.sql` contient le script complet :

```sql
CREATE TABLE IF NOT EXISTS homeworks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    due_date DATETIME NOT NULL,
    description TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_by_name VARCHAR(100) NOT NULL,
    guild_id VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_guild_due_date (guild_id, due_date),
    INDEX idx_guild_completed (guild_id, completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Exécution :**
```bash
mysql -u votre_utilisateur -p votre_base < sql/create_homeworks_table.sql
```

Ou copiez-collez le contenu dans votre client SQL.

---

## 🔍 Vérifier que Tout Fonctionne

### 1. Démarrer le Bot

```powershell
npm start
```

### 2. Vérifier les Logs

Vous devriez voir :
```
✅ Connected to MariaDB
✅ Homework table initialized
```

### 3. Vérifier la Table dans MariaDB

```sql
SHOW TABLES LIKE 'homeworks';
DESCRIBE homeworks;
```

Vous devriez voir :
```
+----------------+--------------+------+-----+-------------------+
| Field          | Type         | Null | Key | Default           |
+----------------+--------------+------+-----+-------------------+
| id             | int(11)      | NO   | PRI | NULL              |
| title          | varchar(100) | NO   |     | NULL              |
| subject        | varchar(50)  | NO   |     | NULL              |
| due_date       | datetime     | NO   | MUL | NULL              |
| description    | text         | YES  |     | NULL              |
| created_by     | varchar(50)  | NO   |     | NULL              |
| created_by_name| varchar(100) | NO   |     | NULL              |
| guild_id       | varchar(50)  | NO   | MUL | NULL              |
| completed      | tinyint(1)   | NO   |     | 0                 |
| created_at     | timestamp    | NO   |     | CURRENT_TIMESTAMP |
| updated_at     | timestamp    | NO   |     | CURRENT_TIMESTAMP |
+----------------+--------------+------+-----+-------------------+
```

---

## 🧪 Tester le Système

### 1. Ajouter un Devoir

Dans Discord :
```
/devoir-add
```

Remplissez :
- **Titre** : Test MariaDB
- **Matière** : Mathématiques
- **Date** : 20/10/2025
- **Description** : Test du système

### 2. Vérifier dans la Base

```sql
SELECT * FROM homeworks;
```

Vous devriez voir votre devoir !

### 3. Afficher le Calendrier

```
/agenda
```

Le calendrier devrait afficher votre devoir en rouge (couleur Mathématiques) !

---

## 📋 Structure de la Table

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INT | ID auto-incrémenté |
| `title` | VARCHAR(100) | Titre du devoir |
| `subject` | VARCHAR(50) | Matière |
| `due_date` | DATETIME | Date d'échéance |
| `description` | TEXT | Description (optionnel) |
| `created_by` | VARCHAR(50) | ID Discord du créateur |
| `created_by_name` | VARCHAR(100) | Nom du créateur |
| `guild_id` | VARCHAR(50) | ID du serveur Discord |
| `completed` | BOOLEAN | Statut (terminé ou non) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Date de modification |

**Index :**
- `idx_guild_due_date` : Pour recherches rapides par date
- `idx_guild_completed` : Pour filtrer les devoirs terminés

---

## 🔧 Configuration MariaDB

Assurez-vous que votre `.env` contient la connexion MariaDB :

```env
# Discord
token=VOTRE_TOKEN
client=VOTRE_CLIENT_ID
guild=VOTRE_GUILD_ID

# MariaDB (déjà configuré)
MARIADB_URL=mysql://user:password@localhost:3306/database
```

---

## 💡 Requêtes SQL Utiles

### Voir tous les devoirs
```sql
SELECT 
    id, 
    title, 
    subject, 
    due_date, 
    completed,
    created_by_name
FROM homeworks
ORDER BY due_date ASC;
```

### Compter les devoirs par matière
```sql
SELECT 
    subject, 
    COUNT(*) as total,
    SUM(completed) as completed,
    SUM(NOT completed) as pending
FROM homeworks
GROUP BY subject;
```

### Voir les devoirs à venir
```sql
SELECT 
    title, 
    subject, 
    due_date,
    created_by_name
FROM homeworks
WHERE completed = FALSE 
    AND due_date >= NOW()
ORDER BY due_date ASC;
```

### Voir les devoirs en retard
```sql
SELECT 
    title, 
    subject, 
    due_date,
    DATEDIFF(NOW(), due_date) as days_late
FROM homeworks
WHERE completed = FALSE 
    AND due_date < NOW()
ORDER BY due_date ASC;
```

### Supprimer les vieux devoirs terminés
```sql
DELETE FROM homeworks
WHERE completed = TRUE
    AND due_date < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

---

## 🎯 Avantages de MariaDB

✅ **Déjà configuré** dans votre projet  
✅ **Pas d'installation supplémentaire** (pas besoin de MongoDB)  
✅ **Requêtes SQL simples** et puissantes  
✅ **Backup facile** de votre base  
✅ **Performances excellentes** pour ce type de données  
✅ **Compatible** avec MySQL et d'autres outils  

---

## 🚀 Prochaines Étapes

1. ✅ **MariaDB est déjà configuré** (vous l'utilisez déjà)
2. ✅ **La table sera créée automatiquement** au démarrage du bot
3. ✅ **Démarrez le bot** : `npm start`
4. ✅ **Testez** : `/devoir-add` dans Discord
5. ✅ **Profitez** de votre système d'agenda !

---

## ❓ Questions Fréquentes

### Q: La table est-elle créée automatiquement ?
**R:** Oui ! Le bot la crée au démarrage si elle n'existe pas.

### Q: Dois-je exécuter le script SQL manuellement ?
**R:** Non, c'est optionnel. Le bot s'en charge automatiquement.

### Q: Puis-je voir les devoirs directement dans MariaDB ?
**R:** Oui ! Utilisez les requêtes SQL ci-dessus ou un client graphique.

### Q: Comment sauvegarder mes devoirs ?
**R:** Utilisez `mysqldump` ou l'outil de backup de votre hébergeur :
```bash
mysqldump -u user -p database homeworks > backup_homeworks.sql
```

### Q: Comment supprimer tous les devoirs ?
**R:** 
```sql
TRUNCATE TABLE homeworks;
```
⚠️ Attention : Cette action est irréversible !

---

**Tout est prêt ! Le système utilise votre base MariaDB existante ! 🎉**
