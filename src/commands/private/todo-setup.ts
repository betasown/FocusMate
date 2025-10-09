import { SlashCommandBuilder, type CommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } from 'discord.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('todo-setup')
    .setDescription('Créer un TODO par projet via un modal')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: CommandInteraction) {
    const modal = new ModalBuilder()
      .setCustomId('todo:setup')
      .setTitle('Configuration TODO - Nom du projet');

    const input = new TextInputBuilder()
      .setCustomId('project_name')
      .setLabel('Nom du projet')
      .setMaxLength(80)
      .setPlaceholder('Ex: Site Vitrine + V2')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
    modal.addComponents(row);
    // @ts-ignore djs v14 requires showModal on Repliable interactions
    await interaction.showModal(modal);
  },
};
