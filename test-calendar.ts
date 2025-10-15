/**
 * Script de test pour le générateur de calendrier
 * Ce script génère un calendrier avec des devoirs d'exemple
 */

import { generateCalendarImage } from './src/function/bot/CalendarGenerator';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Créer des devoirs d'exemple
const sampleHomeworks = [
    {
        title: 'DM Mathématiques',
        subject: 'Mathématiques',
        dueDate: new Date(2025, 9, 15), // 15 octobre 2025
        description: 'Exercices 1-10',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Exposé Histoire',
        subject: 'Histoire',
        dueDate: new Date(2025, 9, 18), // 18 octobre 2025
        description: 'Révolution Française',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'TP Physique',
        subject: 'Physique',
        dueDate: new Date(2025, 9, 20), // 20 octobre 2025
        description: 'Rapport de labo',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Dissertation Français',
        subject: 'Français',
        dueDate: new Date(2025, 9, 22), // 22 octobre 2025
        description: 'Thème: Le romantisme',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Examen Anglais',
        subject: 'Anglais',
        dueDate: new Date(2025, 9, 25), // 25 octobre 2025
        description: 'Chapitres 1-5',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Exercices SVT',
        subject: 'SVT',
        dueDate: new Date(2025, 9, 27), // 27 octobre 2025
        description: 'Pages 30-35',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Projet Informatique',
        subject: 'Informatique',
        dueDate: new Date(2025, 9, 30), // 30 octobre 2025
        description: 'Application web',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    // Ajouter plusieurs devoirs le même jour pour tester l'affichage
    {
        title: 'Quiz Chimie',
        subject: 'Chimie',
        dueDate: new Date(2025, 9, 20), // 20 octobre 2025
        description: 'Révision',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Lecture Géographie',
        subject: 'Géographie',
        dueDate: new Date(2025, 9, 20), // 20 octobre 2025
        description: 'Chapitre 3',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
    {
        title: 'Devoir Sport',
        subject: 'Sport',
        dueDate: new Date(2025, 9, 20), // 20 octobre 2025
        description: 'Course 3km',
        createdBy: 'test',
        createdByName: 'Test User',
        guildId: 'test-guild',
        completed: false,
    },
] as any;

async function testCalendarGeneration() {
    console.log('🎨 Test de génération du calendrier...\n');

    try {
        // Générer le calendrier pour octobre 2025
        const year = 2025;
        const month = 9; // Octobre (0-indexed)

        console.log(`📅 Génération du calendrier pour Octobre ${year}`);
        console.log(`📚 Nombre de devoirs: ${sampleHomeworks.length}\n`);

        const imageBuffer = await generateCalendarImage(year, month, sampleHomeworks);

        // Sauvegarder l'image
        const outputPath = join(__dirname, 'test-calendar.png');
        writeFileSync(outputPath, imageBuffer);

        console.log('✅ Calendrier généré avec succès !');
        console.log(`📁 Fichier sauvegardé: ${outputPath}`);
        console.log('\n🎉 Vous pouvez maintenant ouvrir test-calendar.png pour voir le résultat !');

    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        process.exit(1);
    }
}

// Exécuter le test
testCalendarGeneration();
