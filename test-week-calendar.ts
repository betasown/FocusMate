// Test de la vue hebdomadaire du calendrier
import { generateWeekCalendarImage } from './src/function/bot/CalendarGenerator';
import fs from 'fs';

// Créer des devoirs de test pour une semaine
const testHomeworks = [
    {
        id: 1,
        title: 'DM Chapitre 3',
        subject: 'Mathématiques',
        dueDate: new Date(2025, 9, 14, 8, 0), // Lundi 8h
        description: 'Exercices 1-10',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 2,
        title: 'Dissertation',
        subject: 'Français',
        dueDate: new Date(2025, 9, 15, 14, 0), // Mardi 14h
        description: 'Sujet sur le romantisme',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 3,
        title: 'TP Optique',
        subject: 'Physique',
        dueDate: new Date(2025, 9, 15, 16, 30), // Mardi 16h30
        description: 'Compte-rendu du TP',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 4,
        title: 'Unit 5 Exercises',
        subject: 'Anglais',
        dueDate: new Date(2025, 9, 17, 10, 0), // Jeudi 10h
        description: 'Pages 45-50',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 5,
        title: 'Rapport Lab 4',
        subject: 'Chimie',
        dueDate: new Date(2025, 9, 18, 18, 0), // Vendredi 18h
        description: 'Synthèse organique',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 6,
        title: 'Exposé Révolution',
        subject: 'Histoire',
        dueDate: new Date(2025, 9, 16, 0, 0), // Mercredi (toute la journée)
        description: '15 minutes de présentation',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 7,
        title: 'Exercices Cellule',
        subject: 'SVT',
        dueDate: new Date(2025, 9, 19, 12, 0), // Samedi midi
        description: 'Schémas à compléter',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 8,
        title: 'Projet Python',
        subject: 'Informatique',
        dueDate: new Date(2025, 9, 20, 23, 59), // Dimanche soir
        description: 'Algorithme de tri',
        createdBy: 'user1',
        createdByName: 'Test User',
        guildId: 'test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
];

async function testWeekCalendar() {
    console.log('🧪 Test de la vue hebdomadaire...');
    
    // Lundi de la semaine actuelle
    const today = new Date();
    const monday = new Date(today);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    
    console.log(`📅 Génération du calendrier pour la semaine du ${monday.toLocaleDateString('fr-FR')}`);
    
    try {
        const buffer = await generateWeekCalendarImage(monday, testHomeworks);
        
        const filename = 'dist/test-week-calendar.png';
        fs.writeFileSync(filename, buffer);
        
        console.log(`✅ Calendrier hebdomadaire généré : ${filename}`);
        console.log(`📊 ${testHomeworks.length} devoirs de test inclus`);
        console.log('');
        console.log('Devoirs affichés :');
        testHomeworks.forEach((hw, i) => {
            const date = hw.dueDate.toLocaleDateString('fr-FR');
            const time = hw.dueDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const status = hw.completed ? '✓' : '○';
            console.log(`  ${status} ${date} ${time} - ${hw.subject} : ${hw.title}`);
        });
        console.log('');
        console.log('🎨 Vérifiez l\'image générée :');
        console.log(`   ${filename}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
    }
}

testWeekCalendar();
