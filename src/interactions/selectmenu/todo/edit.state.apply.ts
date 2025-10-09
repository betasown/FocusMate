import { StringSelectMenuInteraction, MessageFlags, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { updateTaskState, type TaskState, listTasks, formatTasks } from '../../../services/todoDb';

export default {
  id: 'todo:edit_state_apply',
  async execute(interaction: StringSelectMenuInteraction) {
    const parts = interaction.customId.split(':');
  const slug = parts[2];
  const id = Number(parts[3]);
  const channelId = parts[4];
  const messageId = parts[5];
  const state = interaction.values[0] as TaskState;
    if (!slug || !id || !state) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });
    try {
      await updateTaskState(slug, id, state);

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

  // Acknowledge and delete the ephemeral message entirely
  await interaction.deferUpdate().catch(() => null);
  await interaction.deleteReply().catch(() => null);
    } catch (e: any) {
      // Fallback error shown privately
      await interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, flags: MessageFlags.Ephemeral }).catch(() => null);
    }
  }
}
