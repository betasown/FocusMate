import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { HomeworkService } from '../../services/homeworkMariaDb';

export const command = {
    data: new SlashCommandBuilder()
        .setName('devoir-delete')
        .setDescription('🗑️ Supprimer un devoir par son ID')
        .addIntegerOption(option =>
            option
                .setName('id')
                .setDescription('ID du devoir à supprimer')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            if (!interaction.guildId) {
                await interaction.editReply('❌ Cette commande doit être utilisée dans un serveur.');
                return;
            }

            const id = interaction.options.getInteger('id', true);

            // Vérifier que le devoir existe (getHomeworkById lancera une erreur si non trouvé)
            try {
                const hw = await HomeworkService.getHomeworkById(id);
                if (hw.guildId !== interaction.guildId) {
                    await interaction.editReply('❌ Ce devoir n\'appartient pas à ce serveur.');
                    return;
                }
            } catch (err) {
                await interaction.editReply('❌ Devoir introuvable avec cet ID.');
                return;
            }

            const deleted = await HomeworkService.deleteHomework(id);
            if (deleted) {
                const embed = new EmbedBuilder()
                    .setColor(0x2ECC71)
                    .setTitle('✅ Devoir supprimé')
                    .setDescription(`Le devoir avec l'ID **${id}** a bien été supprimé.`)
                    .setTimestamp();

                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply('❌ Impossible de supprimer le devoir (erreur inconnue).');
            }

        } catch (error) {
            console.error('Erreur lors de la suppression d\'un devoir :', error);
            await interaction.editReply('❌ Une erreur est survenue lors de la suppression du devoir.');
        }
    },
};
