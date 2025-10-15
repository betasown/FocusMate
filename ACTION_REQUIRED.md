# ⚠️ ACTION REQUISE : Configurer MongoDB

## 🎯 Situation Actuelle

✅ Le système de devoirs est **installé et fonctionnel**  
✅ Les commandes sont **chargées** (`/devoir-add`, `/agenda`, `/devoir-list`)  
✅ Le modal s'affiche correctement  
❌ **MongoDB n'est pas configuré** - Les devoirs ne peuvent pas être sauvegardés

---

## 🔴 Erreur Actuelle

```
MongooseError: Operation `homeworks.insertOne()` buffering timed out after 10000ms
```

**Cause :** Aucune connexion MongoDB n'est établie.

**Solution :** Configurer MongoDB (5 minutes)

---

## 🚀 Solution Rapide - MongoDB Atlas (Gratuit)

### Étape 1 : Créer un Compte MongoDB Atlas

1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte gratuit
3. Créez un cluster gratuit (Shared - M0)

### Étape 2 : Créer un Utilisateur

1. Dans Atlas : **Database Access** → **Add New Database User**
2. Nom : `botuser`
3. Mot de passe : Notez-le (ex: `SecurePass123`)
4. Role : `Atlas admin` ou `Read and write to any database`
5. **Add User**

### Étape 3 : Autoriser l'Accès Réseau

1. Dans Atlas : **Network Access** → **Add IP Address**
2. Cliquez sur **"Allow Access from Anywhere"** (0.0.0.0/0)
3. **Confirm**

### Étape 4 : Obtenir l'URI de Connexion

1. Dans Atlas : **Clusters** → **Connect**
2. **Connect your application**
3. Copiez l'URI :
   ```
   mongodb+srv://botuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Remplacez `<password>` par votre mot de passe réel

### Étape 5 : Ajouter dans `.env`

Ouvrez le fichier `.env` et ajoutez :

```env
mongo=mongodb+srv://botuser:SecurePass123@cluster0.xxxxx.mongodb.net/discord-bot?retryWrites=true&w=majority
```

**Remplacez :**

- `botuser` par votre nom d'utilisateur
- `SecurePass123` par votre mot de passe
- `cluster0.xxxxx` par votre URL de cluster
- `discord-bot` par le nom de votre base de données

### Étape 6 : Redémarrer le Bot

```powershell
npm start
```

Vous devriez voir :

```
✅ Connected to MongoDB
```

---

## ✅ Vérification

Après configuration, au démarrage du bot vous devriez voir :

```
╔══════════════════════════════════════════════════╗
║            🤖 BOT CONNECTED – BETA 🤖            ║
╚══════════════════════════════════════════════════╝
✅  Connected to MongoDB          ← CETTE LIGNE !
✅  Connected to MariaDB
🕒  Time : 13/10/2025 16:56:30
🤝  Servers : 1
...
```

---

## 🧪 Test Final

1. Dans Discord : `/devoir-add`
2. Remplissez le formulaire :
   - Titre : `Test MongoDB`
   - Matière : `Mathématiques`
   - Date : `20/10/2025`
   - Description : `Test de connexion`
3. Validez

Vous devriez voir :

```
✅ Devoir ajouté avec succès
```

Puis testez :

```
/agenda
```

Vous devriez voir le calendrier avec votre devoir en rouge ! 🎉

---

## 📋 Checklist

- [ ] Compte MongoDB Atlas créé
- [ ] Cluster gratuit créé
- [ ] Utilisateur de base de données créé
- [ ] Accès réseau autorisé (0.0.0.0/0)
- [ ] URI de connexion copiée
- [ ] Variable `mongo=...` ajoutée dans `.env`
- [ ] Bot redémarré (`npm start`)
- [ ] Message `✅ Connected to MongoDB` visible
- [ ] `/devoir-add` testé et fonctionnel
- [ ] `/agenda` affiche le calendrier

---

## 💡 Alternative : MongoDB Local

Si vous préférez installer MongoDB localement :

### Windows

1. Télécharger : https://www.mongodb.com/try/download/community
2. Installer avec les options par défaut
3. Ajouter dans `.env` :
   ```env
   mongo=mongodb://localhost:27017/discord-bot
   ```

### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Ajouter dans `.env` :

```env
mongo=mongodb://localhost:27017/discord-bot
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :

- **`MONGODB_SETUP.md`** - Guide complet de configuration MongoDB
- **`TROUBLESHOOTING.md`** - Résolution de problèmes

---

## 🎯 Résumé

**Ce qui fonctionne déjà :**

- ✅ Bot Discord connecté
- ✅ Commandes slash enregistrées
- ✅ Modal d'ajout fonctionnel
- ✅ Générateur de calendrier prêt
- ✅ Code compilé et sans erreurs

**Ce qu'il faut faire :**

- ⏳ Configurer MongoDB (5 minutes)
- ⏳ Ajouter l'URI dans `.env`
- ⏳ Redémarrer le bot

**Après cela :**

- ✨ Système 100% fonctionnel
- ✨ Devoirs sauvegardés dans MongoDB
- ✨ Calendriers générés automatiquement

---

## 🚀 Prochaines Étapes

1. **MAINTENANT** : Configurez MongoDB (suivez les étapes ci-dessus)
2. Redémarrez le bot : `npm start`
3. Testez `/devoir-add`
4. Profitez de votre agenda automatisé ! 🎉

---

_Tout est prêt, il ne manque que MongoDB ! 💪_
