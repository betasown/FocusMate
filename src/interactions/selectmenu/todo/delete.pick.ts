import { StringSelectMenuInteraction, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { deleteTask, listTasks, formatTasks } from '../../../services/todoDb';

export default {
  id: 'todo:delete_pick',
  async execute(interaction: StringSelectMenuInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3];
    const messageId = parts[4];
    const picked = Number(interaction.values[0]);
    if (!slug || !picked) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });
    try {
  // Acknowledge the component without creating a new ephemeral reply
  await interaction.deferUpdate().catch(() => null);
      await deleteTask(slug, picked);
      // Update embed
      if (channelId && messageId) {
        const tasks = await listTasks(slug);
        const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
        if (channel && channel.isTextBased()) {
          const msg = await channel.messages.fetch(messageId).catch(() => null);
          if (msg) {
            const embed = EmbedBuilder.from(msg.embeds[0] ?? {});
            embed.setDescription(formatTasks(tasks));

            const addBtn = new ButtonBuilder().setCustomId(`todo:add:${slug}:${channelId}:${messageId}`).setLabel('➕ Ajouter tâche').setStyle(ButtonStyle.Success);
            const editBtn = new ButtonBuilder().setCustomId(`todo:edit:${slug}:${channelId}:${messageId}`).setLabel('✏️ Modifier').setStyle(ButtonStyle.Primary);
            const delBtn = new ButtonBuilder().setCustomId(`todo:delete:${slug}:${channelId}:${messageId}`).setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(addBtn, editBtn, delBtn);

            await msg.edit({ embeds: [embed], components: [row] });
          }
        }
      }
      await interaction.deleteReply().catch(() => null);
    } catch (e: any) {
      await interaction.editReply({ content: `Erreur: ${e?.message ?? String(e)}` }).catch(() => null);
    }
  }
}
