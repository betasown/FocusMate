import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';

export const command = {
    data: new SlashCommandBuilder()
        .setName('devoir-add')
        .setDescription('📝 Ajouter un nouveau devoir'),
    
    async execute(interaction: ChatInputCommandInteraction) {
        // Créer le modal pour saisir les informations du devoir
        const modal = new ModalBuilder()
            .setCustomId('homework-add-modal')
            .setTitle('📝 Ajouter un devoir');

        // Champ: Titre du devoir
        const titleInput = new TextInputBuilder()
            .setCustomId('homework-title')
            .setLabel('Titre du devoir')
            .setPlaceholder('Ex: Exercice de mathématiques chapitre 5')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(100);

        // Champ: Matière
        const subjectInput = new TextInputBuilder()
            .setCustomId('homework-subject')
            .setLabel('Matière')
            .setPlaceholder('Ex: Mathématiques')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(50);

        // Champ: Date d'échéance
        const dueDateInput = new TextInputBuilder()
            .setCustomId('homework-duedate')
            .setLabel('Date d\'échéance')
            .setPlaceholder('25/12/2025 ou 25/12/2025 14:30')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(16);

        // Champ: Description (optionnel)
        const descriptionInput = new TextInputBuilder()
            .setCustomId('homework-description')
            .setLabel('Description (optionnel)')
            .setPlaceholder('Ex: Pages 42-45, exercices 1 à 10')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
            .setMaxLength(500);

        // Créer les lignes d'action pour chaque champ
        const firstRow = new ActionRowBuilder<TextInputBuilder>().addComponents(titleInput);
        const secondRow = new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput);
        const thirdRow = new ActionRowBuilder<TextInputBuilder>().addComponents(dueDateInput);
        const fourthRow = new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput);

        // Ajouter les composants au modal
        modal.addComponents(firstRow, secondRow, thirdRow, fourthRow);

        // Afficher le modal
        await interaction.showModal(modal);
    },
};
