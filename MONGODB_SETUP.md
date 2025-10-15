# 🔧 Configuration MongoDB pour le Système de Devoirs

## ⚠️ Important

Le système de devoirs **nécessite MongoDB** pour fonctionner. Sans MongoDB, vous verrez l'erreur :

```
MongooseError: Operation `homeworks.insertOne()` buffering timed out after 10000ms
```

---

## 📝 Options de Configuration

### Option 1 : MongoDB Atlas (Cloud - Gratuit) ⭐ RECOMMANDÉ

C'est la solution la plus simple et gratuite jusqu'à 512 MB.

#### Étapes :

1. **Créer un compte gratuit** sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

2. **Créer un cluster gratuit** :

   - Choisir le plan "Shared" (gratuit)
   - Sélectionner une région proche de vous
   - Cliquer sur "Create"

3. **Créer un utilisateur de base de données** :

   - Database Access → Add New Database User
   - Nom d'utilisateur : `botuser` (ou autre)
   - Mot de passe : Générez-en un fort
   - Role : `Read and write to any database`

4. **Autoriser l'accès réseau** :

   - Network Access → Add IP Address
   - Cliquer sur "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirmer

5. **Obtenir l'URI de connexion** :

   - Clusters → Connect
   - "Connect your application"
   - Copier l'URI (format : `mongodb+srv://...`)
   - Remplacer `<password>` par votre mot de passe

6. **Ajouter dans `.env`** :
   ```env
   mongo=mongodb+srv://botuser:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/botdb?retryWrites=true&w=majority
   ```

---

### Option 2 : MongoDB Local (sur votre PC)

#### Installation

**Windows :**

1. Télécharger [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Installer avec les options par défaut
3. MongoDB démarrera automatiquement comme service

**macOS (avec Homebrew) :**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian) :**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Configuration

Ajouter dans `.env` :

```env
mongo=mongodb://localhost:27017/discord-bot
```

---

### Option 3 : MongoDB avec Docker 🐳

Si vous avez Docker installé :

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=discord-bot \
  -v mongodb_data:/data/db \
  mongo:latest
```

Ajouter dans `.env` :

```env
mongo=mongodb://localhost:27017/discord-bot
```

---

## ✅ Vérifier la Configuration

### 1. Vérifier que `.env` contient la variable

Votre fichier `.env` doit contenir :

```env
token=VOTRE_TOKEN_DISCORD
client=VOTRE_CLIENT_ID
guild=VOTRE_GUILD_ID
mongo=mongodb+srv://... ou mongodb://localhost:27017/...
```

### 2. Tester la connexion

```powershell
node -e "const mongoose = require('mongoose'); mongoose.connect('VOTRE_URI_MONGO').then(() => { console.log('✅ MongoDB OK'); process.exit(0); }).catch(err => { console.error('❌ Erreur:', err.message); process.exit(1); })"
```

Remplacez `VOTRE_URI_MONGO` par votre URI complète.

### 3. Recompiler et redémarrer

```powershell
npm run build
npm start
```

Vous devriez voir :

```
✅ Connected to MongoDB
```

---

## 🐛 Dépannage

### Erreur : "buffering timed out"

**Cause :** MongoDB n'est pas connecté.

**Solutions :**

1. Vérifiez que `mongo=...` est dans `.env`
2. Vérifiez que l'URI est correcte
3. Testez la connexion avec la commande ci-dessus

### Erreur : "Authentication failed"

**Cause :** Mauvais nom d'utilisateur ou mot de passe.

**Solutions :**

1. Vérifiez le mot de passe dans l'URI
2. Le mot de passe doit être encodé (% au lieu de caractères spéciaux)
3. Recréez un utilisateur sur MongoDB Atlas

### Erreur : "connection timeout"

**Cause :** Firewall ou IP non autorisée.

**Solutions :**

1. Sur MongoDB Atlas : Network Access → Allow from Anywhere
2. Vérifiez votre connexion internet
3. Désactivez temporairement votre VPN

### MongoDB local ne démarre pas

**Windows :**

```powershell
# Vérifier le service
Get-Service MongoDB

# Démarrer le service
Start-Service MongoDB
```

**macOS :**

```bash
brew services restart mongodb-community
```

**Linux :**

```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

---

## 📊 Exemple de Configuration Complète

### Fichier `.env`

```env
# Discord Bot
token=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.GaBcDe.FgHiJkLmNoPqRsTuVwXyZ
client=1234567890123456789
guild=1404436613148446721

# MongoDB Atlas (Recommandé)
mongo=mongodb+srv://botuser:SecurePassword123@cluster0.abcde.mongodb.net/discord-bot?retryWrites=true&w=majority

# OU MongoDB Local
# mongo=mongodb://localhost:27017/discord-bot

# MariaDB (existant)
MARIADB_URL=mysql://user:password@localhost:3306/database
```

---

## 🎯 URI MongoDB Expliquée

### Format MongoDB Atlas

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?options
```

- `username` : Votre nom d'utilisateur DB
- `password` : Votre mot de passe (attention aux caractères spéciaux !)
- `cluster0.xxxxx.mongodb.net` : Votre cluster
- `database` : Nom de la base (ex: `discord-bot`, `botdb`)
- `options` : Options de connexion

### Format MongoDB Local

```
mongodb://localhost:27017/database
```

- `localhost` : Serveur local
- `27017` : Port par défaut
- `database` : Nom de la base

---

## 🚀 Après Configuration

Une fois MongoDB configuré :

1. ✅ Recompilez : `npm run build`
2. ✅ Redémarrez : `npm start`
3. ✅ Vérifiez les logs : `✅ Connected to MongoDB`
4. ✅ Testez `/devoir-add` dans Discord

Le système devrait maintenant fonctionner parfaitement ! 🎉

---

## 📚 Ressources

- [MongoDB Atlas (Gratuit)](https://www.mongodb.com/cloud/atlas/register)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

---

**Configuration MongoDB terminée ! Votre système de devoirs est prêt ! 📚✨**
