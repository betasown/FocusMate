import { ModalSubmitInteraction, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { addTask, listTasks, formatTasks } from '../../services/todoDb';

export default {
  id: 'todo:addModal',
  async execute(interaction: ModalSubmitInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3];
    const messageId = parts[4];
    const title = interaction.fields.getTextInputValue('task_title').trim();
    if (!slug || !title) return interaction.reply({ content: 'Données manquantes.', flags: MessageFlags.Ephemeral });
    try {
      await interaction.deferReply({ ephemeral: true }).catch(() => null);
      const id = await addTask(slug, title);
      // Update the original embed message if we have context
      if (channelId && messageId) {
        const tasks = await listTasks(slug);
        const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
        if (channel && channel.isTextBased()) {
          const msg = await channel.messages.fetch(messageId).catch(() => null);
          if (msg) {
            const embed = EmbedBuilder.from(msg.embeds[0] ?? {});
            embed.setDescription(formatTasks(tasks));

            // Rebuild row to keep customIds with ids
            const addBtn = new ButtonBuilder().setCustomId(`todo:add:${slug}:${channelId}:${messageId}`).setLabel('➕ Ajouter tâche').setStyle(ButtonStyle.Success);
            const editBtn = new ButtonBuilder().setCustomId(`todo:edit:${slug}:${channelId}:${messageId}`).setLabel('✏️ Modifier').setStyle(ButtonStyle.Primary);
            const delBtn = new ButtonBuilder().setCustomId(`todo:delete:${slug}:${channelId}:${messageId}`).setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(addBtn, editBtn, delBtn);

            await msg.edit({ embeds: [embed], components: [row] });
          }
        }
      }
      // Remove any ephemeral placeholder to avoid confirmations
      await interaction.deleteReply().catch(() => null);
    } catch (e: any) {
      await interaction.editReply({ content: `Erreur: ${e?.message ?? String(e)}` }).catch(() => null);
    }
  }
}
