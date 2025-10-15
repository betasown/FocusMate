import { CommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('ping-guild')
    .setDescription('Calcule la latence du bot'),

  async execute(interaction: CommandInteraction) {

    const latency = Date.now() - interaction.createdTimestamp;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`🏓 Pong ! ${latency}ms `)
      ]
    });
  },
};