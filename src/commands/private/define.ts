import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { defineKeyword } from '../../services/gemini';

export const command = {
  data: new SlashCommandBuilder()
    .setName('define')
    .setDescription('Obtenir la définition d\'un mot-clé via Gemini AI')
    .addStringOption(option =>
      option
        .setName('keyword')
        .setDescription('Le mot-clé à définir')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
  // Defer reply to avoid 3-second timeout (public reply)
  await interaction.deferReply();

  // Allow multi-word keywords; normalize whitespace
  const raw = interaction.options.getString('keyword', true);
  const keyword = raw.trim().replace(/\s+/g, ' ');

    try {
      const definition = await defineKeyword(keyword);
      await interaction.editReply({
        content: `**${keyword}** : ${definition}`
      });
    } catch (error) {
      console.error('Error defining keyword:', error);
      await interaction.editReply({
        content: `❌ Erreur lors de la récupération de la définition pour "${keyword}".`
      });
    }
  }
};
