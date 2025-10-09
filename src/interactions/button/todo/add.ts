import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } from 'discord.js';

export default {
  id: 'todo:add',
  async execute(interaction: ButtonInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3] ?? interaction.channelId;
    const messageId = parts[4] ?? interaction.message.id;
    if (!slug) return interaction.reply({ content: 'Projet introuvable.', flags: MessageFlags.Ephemeral });

    const modal = new ModalBuilder()
      .setCustomId(`todo:addModal:${slug}:${channelId}:${messageId}`)
      .setTitle('Ajouter une tâche');

    const input = new TextInputBuilder()
      .setCustomId('task_title')
      .setLabel('Titre de la tâche')
      .setMaxLength(500)
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
    modal.addComponents(row);
    // @ts-ignore
    await interaction.showModal(modal);
  }
}
