# 🚀 Démarrage Rapide - Système de Devoirs

## Installation

```powershell
# Installer les dépendances (si pas déjà fait)
npm install

# Compiler le projet
npm run build
```

## Test du Générateur de Calendrier

Avant de lancer le bot, testez le générateur de calendrier :

```powershell
# Générer un calendrier d'exemple
node dist/test-calendar.js

# Ouvrir l'image générée
start dist/test-calendar.png
```

Cela créera un calendrier PNG avec 10 devoirs d'exemple en couleur ! 🎨

## Lancer le Bot Discord

```powershell
npm start
```

## Commandes Disponibles

### 📝 Ajouter un devoir

```
/devoir-add
```

Un formulaire s'ouvrira pour saisir :

- Titre du devoir
- Matière
- Date d'échéance (format: JJ/MM/AAAA)
- Description (optionnel)

### 📅 Afficher le calendrier visuel

```
/agenda
```

Options :

- `mois` : 1-12 (défaut: mois actuel)
- `annee` : 2020-2030 (défaut: année actuelle)
- `completes` : true/false (défaut: false)

Exemples :

```
/agenda
/agenda mois:12 annee:2025
/agenda completes:true
```

### 📋 Lister les devoirs

```
/devoir-list
```

Options de filtre :

- **À venir** : Devoirs des 7 prochains jours (défaut)
- **En retard** : Devoirs dont la date est dépassée
- **Terminés** : Devoirs marqués comme terminés
- **Tous** : Tous les devoirs

## 🎨 Exemple de Calendrier

Le système génère automatiquement un calendrier coloré :

- Chaque matière a sa propre couleur
- Maximum 3 devoirs affichés par jour
- Légende des matières en bas
- Format PNG de 1400x1000 pixels

## 📚 Documentation Complète

- **`HOMEWORK_SYSTEM.md`** - Documentation technique complète
- **`RECAP_HOMEWORK.md`** - Récapitulatif et guide d'utilisation

## 🔧 Configuration Requise

- Node.js v16+
- MongoDB (pour la base de données)
- Discord Bot Token (dans `.env`)

## ⚡ Démo Rapide

1. Ajoutez quelques devoirs :

```
/devoir-add
→ Titre: "DM Maths"
→ Matière: "Mathématiques"
→ Date: "25/10/2025"
```

2. Voyez le calendrier :

```
/agenda
```

3. Listez les devoirs :

```
/devoir-list
```

C'est tout ! Profitez de votre agenda automatisé ! 🎉
