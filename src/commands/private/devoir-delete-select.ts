import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { HomeworkService } from '../../services/homeworkMariaDb';

export const command = {
  data: new SlashCommandBuilder()
    .setName('devoir-delete-select')
    .setDescription('🗑️ Sélectionner un devoir à supprimer'),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guildId) {
      await interaction.editReply('❌ Cette commande doit être utilisée dans un serveur.');
      return;
    }

    const homeworks = await HomeworkService.getHomeworksByGuild(interaction.guildId, true);
    if (!homeworks || homeworks.length === 0) {
      await interaction.editReply('Aucun devoir trouvé pour ce serveur.');
      return;
    }

    // Prendre les 20 derniers devoirs (ou moins)
    const items = homeworks.slice(0, 20).map(hw => ({ label: `${hw.title} (${hw.subject})`, value: String(hw.id), description: `${hw.dueDate.toLocaleString()}` }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`devoir:delete_pick`)
      .setPlaceholder('Choisir un devoir à supprimer')
      .addOptions(items);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle('Sélectionnez le devoir à supprimer')
      .setDescription('Choisissez dans le menu ci-dessous le devoir que vous souhaitez supprimer.');

    await interaction.editReply({ embeds: [embed], components: [row] });
  }
};
