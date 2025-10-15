# 🔧 Guide de Dépannage - Système de Devoirs

## Erreur Résolue : "Cannot read properties of undefined (reading 'data')"

### Symptôme

```
TypeError: Cannot read properties of undefined (reading 'data')
    at loadCommands (dist\handlers\commands.js:24:31)
```

### Cause

Les nouvelles commandes utilisaient `export default` au lieu de `export const command` comme le reste du projet.

### Solution

✅ **Corrigé !** Les exports ont été modifiés pour correspondre au format attendu :

**Avant (incorrect) :**

```typescript
export default {
    data: new SlashCommandBuilder()...
}
```

**Après (correct) :**

```typescript
export const command = {
    data: new SlashCommandBuilder()...
}
```

### Commandes Corrigées

- ✅ `devoir-add.ts`
- ✅ `agenda.ts`
- ✅ `devoir-list.ts`

---

## Autres Erreurs Possibles

### 1. MongoDB Connection Error

**Symptôme :**

```
MongoServerError: Authentication failed
```

**Solutions :**

1. Vérifier que MongoDB est démarré
2. Vérifier les credentials dans `.env`
3. Vérifier la connexion réseau

```powershell
# Tester la connexion MongoDB
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB OK')).catch(err => console.error('❌ Erreur:', err))"
```

---

### 2. Canvas Installation Failed

**Symptôme :**

```
Error: Cannot find module '@napi-rs/canvas'
```

**Solution :**

```powershell
npm install @napi-rs/canvas
```

Si l'installation échoue sur Windows :

- Vérifiez que vous avez les build tools : `npm install --global windows-build-tools`
- Ou utilisez la version précompilée : `npm install @napi-rs/canvas --force`

---

### 3. Modal Handler Not Found

**Symptôme :**

```
Error: Modal handler for 'homework-add-modal' not found
```

**Solution :**
Vérifiez que le handler est dans le bon dossier et correctement nommé :

- Fichier : `src/interactions/modal/homework.add.ts`
- Custom ID : `homework-add-modal`

Le handler doit exporter :

```typescript
export default {
    customId: 'homework-add-modal',
    async execute(interaction) { ... }
}
```

---

### 4. Invalid Date Format

**Symptôme :**

```
❌ Format de date invalide. Utilisez le format JJ/MM/AAAA
```

**Solution :**
Utilisez exactement le format : **JJ/MM/AAAA**

✅ Valides :

- `01/12/2025`
- `25/12/2025`
- `31/01/2026`

❌ Invalides :

- `1/12/25` (jour et année incorrects)
- `2025-12-01` (format incorrect)
- `12/25/2025` (format US, pas FR)

---

### 5. Date in the Past

**Symptôme :**

```
❌ La date d'échéance ne peut pas être dans le passé.
```

**Solution :**
Assurez-vous que la date est dans le futur. Le système compare avec la date actuelle (minuit).

---

### 6. Calendar Generation Error

**Symptôme :**

```
❌ Une erreur est survenue lors de la génération du calendrier.
```

**Causes possibles :**

1. **Pas de devoirs** : Normal, le calendrier sera vide
2. **Erreur Canvas** : Vérifier l'installation de `@napi-rs/canvas`
3. **Erreur MongoDB** : Vérifier la connexion

**Test :**

```powershell
# Tester le générateur directement
node dist/test-calendar.js
```

---

### 7. Commands Not Appearing in Discord

**Symptôme :**
Les commandes ne s'affichent pas quand on tape `/`

**Solutions :**

1. **Vérifier les permissions du bot** :

   - `applications.commands` scope activé
   - Permission "Use Slash Commands" accordée

2. **Attendre la propagation** :

   - Commandes de guild : instantané
   - Commandes globales : jusqu'à 1 heure

3. **Forcer la mise à jour** :

   ```powershell
   # Redémarrer le bot
   npm start
   ```

4. **Vérifier les logs** :
   ```
   Registered X slash command(s) to guild...
   ```

---

### 8. Bot Token Invalid

**Symptôme :**

```
Error: Invalid token provided
```

**Solution :**

1. Vérifier le fichier `.env` :

   ```
   token=VOTRE_TOKEN_ICI
   client=VOTRE_CLIENT_ID
   guild=VOTRE_GUILD_ID (optionnel)
   ```

2. Regénérer le token sur Discord Developer Portal si nécessaire

---

### 9. Slash Command Errors

**Symptôme :**

```
The application did not respond
```

**Causes possibles :**

1. Le bot n'a pas répondu dans les 3 secondes
2. Erreur dans le code de la commande
3. MongoDB non connecté

**Solution :**

1. Utiliser `deferReply()` au début des commandes longues
2. Vérifier les logs du bot
3. Ajouter des try/catch

---

## Commandes de Debug

### Vérifier la Compilation

```powershell
npm run build
# Doit se terminer sans erreurs
```

### Tester le Générateur de Calendrier

```powershell
node dist/test-calendar.js
# Doit créer test-calendar.png
```

### Vérifier les Packages

```powershell
npm list @napi-rs/canvas
npm list discord.js
npm list mongoose
```

### Nettoyer et Recompiler

```powershell
Remove-Item -Recurse -Force dist
npm run build
```

### Voir les Logs en Temps Réel

```powershell
npm start
# Regarder les messages de console
```

---

## Checklist de Diagnostic

Quand quelque chose ne fonctionne pas :

- [ ] Le bot est en ligne sur Discord ?
- [ ] Les commandes sont compilées ? (`npm run build`)
- [ ] MongoDB est connecté ?
- [ ] Les variables d'environnement sont définies ? (`.env`)
- [ ] Les permissions Discord sont correctes ?
- [ ] Les packages sont installés ? (`npm install`)
- [ ] Le test du calendrier fonctionne ? (`node dist/test-calendar.js`)
- [ ] Il n'y a pas d'erreurs dans la console ?

---

## Logs Utiles

### Démarrage Réussi

```
✅ Registered 3 slash command(s) to guild XXXXX
✅ Bot logged in as YourBot#1234
✅ MongoDB connected
```

### Commande Exécutée

```
User#1234 used /devoir-add
✅ Homework added successfully
```

### Calendrier Généré

```
📅 Generating calendar for October 2025
📚 Found 7 homework(s)
✅ Calendar generated successfully
```

---

## Support

Si vous rencontrez un problème non listé ici :

1. **Vérifier les logs** dans la console
2. **Lire la documentation** dans `HOMEWORK_SYSTEM.md`
3. **Tester individuellement** chaque composant
4. **Recompiler** le projet : `npm run build`

---

## Bonnes Pratiques

### Avant de Démarrer le Bot

```powershell
# 1. Nettoyer
Remove-Item -Recurse -Force dist

# 2. Réinstaller si besoin
npm install

# 3. Recompiler
npm run build

# 4. Tester le générateur
node dist/test-calendar.js

# 5. Démarrer
npm start
```

### Après une Modification

```powershell
# Toujours recompiler
npm run build

# Puis redémarrer
npm start
```

---

**Tout est maintenant fonctionnel ! 🎉**

Le bot devrait démarrer sans erreurs. Les commandes suivantes sont disponibles :

- `/devoir-add`
- `/agenda`
- `/devoir-list`
