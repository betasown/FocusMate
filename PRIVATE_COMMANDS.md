# ⚠️ Important : Commandes Privées

## 🔒 Les commandes de devoirs sont maintenant **PRIVÉES**

Les commandes suivantes ont été déplacées dans le dossier `private` :

- `/devoir-add`
- `/agenda`
- `/devoir-list`

### Qu'est-ce que cela signifie ?

✅ **Avantages des commandes privées :**

- Enregistrées **uniquement sur votre serveur Discord** (guild)
- **Instantanément disponibles** (pas de délai de propagation)
- **Pas de pollution** de l'espace de commandes global
- **Contrôle total** sur qui peut y accéder

### Configuration Requise

Pour que les commandes privées fonctionnent, vous **devez** avoir :

1. **Un Guild ID défini dans `.env`** :

   ```env
   guild=VOTRE_GUILD_ID_ICI
   ```

2. **Le bot doit être sur ce serveur**

### Comment Obtenir le Guild ID

1. Activez le mode développeur dans Discord :

   - Paramètres utilisateur → Avancé → Mode développeur

2. Clic droit sur votre serveur → Copier l'ID

3. Ajoutez-le dans `.env` :
   ```env
   guild=1404436613148446721
   ```

### Vérification

Après le démarrage du bot, vous devriez voir dans la console :

```
Registered 3 slash command(s) to guild 1404436613148446721.
```

Si vous voyez :

```
Registered X global slash command(s)...
```

C'est que le `guild` n'est pas défini dans `.env` !

### Structure des Dossiers

```
src/commands/
├── public/          ← Commandes globales (tous les serveurs)
│   ├── ping.ts
│   └── edt.ts
│
├── private/         ← Commandes privées (votre serveur uniquement)
│   ├── devoir-add.ts
│   ├── devoir-list.ts
│   ├── agenda.ts
│   ├── dbping.ts
│   ├── edt.ts
│   └── ping.ts
│
└── message/         ← Commandes par message (préfixe)
    └── ping.ts
```

### Différences

| Type         | Dossier    | Délai      | Visibilité         |
| ------------ | ---------- | ---------- | ------------------ |
| **Privée**   | `private/` | Instantané | Serveur uniquement |
| **Publique** | `public/`  | Jusqu'à 1h | Tous les serveurs  |

### Tester

1. Redémarrez le bot :

   ```powershell
   npm start
   ```

2. Dans Discord, tapez `/` :

   - ✅ Vous devez voir `/devoir-add`, `/agenda`, `/devoir-list`
   - ✅ Elles n'apparaissent QUE sur votre serveur de test

3. Si vous ne les voyez pas :
   - Vérifiez que `guild=...` est dans `.env`
   - Vérifiez que le bot est sur ce serveur
   - Redémarrez le bot

### Pour Rendre Publiques (si besoin plus tard)

Si vous voulez que les commandes soient disponibles partout :

1. Déplacez les fichiers de `private/` vers `public/` :

   ```powershell
   Move-Item "src/commands/private/devoir-add.ts" "src/commands/public/"
   Move-Item "src/commands/private/devoir-list.ts" "src/commands/public/"
   Move-Item "src/commands/private/agenda.ts" "src/commands/public/"
   ```

2. Recompilez :

   ```powershell
   npm run build
   ```

3. Redémarrez :

   ```powershell
   npm start
   ```

4. Attendez jusqu'à 1 heure pour la propagation globale

---

**Configuration actuelle : Commandes PRIVÉES ✅**

Les commandes de devoirs sont maintenant accessibles uniquement sur votre serveur Discord configuré dans `.env` !
