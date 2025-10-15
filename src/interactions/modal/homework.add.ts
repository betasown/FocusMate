import type { ModalSubmitInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { HomeworkService } from '../../services/homeworkMariaDb';

export default {
    id: 'homework-add-modal',
    
    async execute(interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ flags: 64 }); // 64 = Ephemeral

        try {
            // Récupérer les valeurs du modal
            const title = interaction.fields.getTextInputValue('homework-title');
            const subject = interaction.fields.getTextInputValue('homework-subject');
            const dueDateStr = interaction.fields.getTextInputValue('homework-duedate');
            const description = interaction.fields.getTextInputValue('homework-description') || undefined;

            // Parser la date (format JJ/MM/AAAA ou JJ/MM/AAAA HH:MM)
            let dueDate: Date;
            
            // Essayer d'abord le format avec heure : JJ/MM/AAAA HH:MM
            let dateMatch = dueDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
            
            if (dateMatch) {
                // Format avec heure
                const [, day, month, year, h, m] = dateMatch;
                const hour = parseInt(h);
                const minute = parseInt(m);
                
                if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
                    await interaction.editReply({
                        content: '❌ Heure invalide. L\'heure doit être entre 00:00 et 23:59',
                    });
                    return;
                }
                
                dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), hour, minute, 0);
            } else {
                // Essayer le format sans heure : JJ/MM/AAAA (par défaut 23:59)
                dateMatch = dueDateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (!dateMatch) {
                    await interaction.editReply({
                        content: '❌ Format de date invalide. Utilisez :\n• `JJ/MM/AAAA` (ex: 25/12/2025)\n• `JJ/MM/AAAA HH:MM` (ex: 25/12/2025 14:30)',
                    });
                    return;
                }

                const [, day, month, year] = dateMatch;
                dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59);
            }

            // Vérifier que la date est valide
            if (isNaN(dueDate.getTime())) {
                await interaction.editReply({
                    content: '❌ Date invalide. Vérifiez votre saisie.',
                });
                return;
            }

            // Vérifier que la date n'est pas dans le passé
            const now = new Date();
            if (dueDate < now) {
                await interaction.editReply({
                    content: '❌ La date d\'échéance ne peut pas être dans le passé.',
                });
                return;
            }

            // Créer le devoir dans la base de données
            const homework = await HomeworkService.createHomework({
                title,
                subject,
                dueDate,
                description,
                createdBy: interaction.user.id,
                createdByName: interaction.user.username,
                guildId: interaction.guildId!,
            });

            // Créer un embed de confirmation
            const embed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('✅ Devoir ajouté avec succès')
                .addFields(
                    { name: '📚 Titre', value: homework.title, inline: false },
                    { name: '📖 Matière', value: homework.subject, inline: true },
                    { name: '📅 Échéance', value: `<t:${Math.floor(homework.dueDate.getTime() / 1000)}:D>`, inline: true }
                )
                .setFooter({ text: `Ajouté par ${interaction.user.username}` })
                .setTimestamp();

            if (homework.description) {
                embed.addFields({ name: '📝 Description', value: homework.description, inline: false });
            }

            await interaction.editReply({
                content: null,
                embeds: [embed],
            });

        } catch (error) {
            console.error('Erreur lors de l\'ajout du devoir:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de l\'ajout du devoir.',
            });
        }
    },
};
