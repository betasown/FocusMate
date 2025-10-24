import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags, EmbedBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { updateTaskState, type TaskState, deleteTask, listTasks, formatTasks } from '../../../services/todoDb';

export default {
  id: 'todo',
  async execute(interaction: StringSelectMenuInteraction) {
    const parts = interaction.customId.split(':');
    const action = parts[1];

    if (action === 'edit_pick') {
      const slug = parts[2];
      const channelId = parts[3] ?? interaction.channelId;
      const messageId = parts[4] ?? interaction.message?.id;
      const picked = interaction.values[0];
  if (!slug || !picked) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });
      const stateMenu = new StringSelectMenuBuilder()
        .setCustomId(`todo:edit_state_apply:${slug}:${picked}:${channelId}:${messageId}`)
        .setPlaceholder('Choisir nouvel état')
        .addOptions([
          { label: 'A_FAIRE', value: 'A_FAIRE' },
          { label: 'EN_COURS', value: 'EN_COURS' },
          { label: 'REALISE', value: 'REALISE' },
        ]);
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stateMenu);
    return interaction.update({ components: [row] });
    }

    if (action === 'edit_state_apply') {
      const slug = parts[2];
      const id = Number(parts[3]);
      const channelId = parts[4];
      const messageId = parts[5];
      const state = interaction.values[0] as TaskState;
  if (!slug || !id || !state) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });
      try {
  await updateTaskState(slug, id, state);

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
  return;
      } catch (e: any) {
        return interaction.editReply({ content: `Erreur: ${e?.message ?? String(e)}` }).catch(() => null);
      }
    }

    if (action === 'delete_pick') {
      const slug = parts[2];
      const channelId = parts[3];
      const messageId = parts[4];
      const picked = Number(interaction.values[0]);
  if (!slug || !picked) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });
      try {
  await interaction.deferUpdate().catch(() => null);
        await deleteTask(slug, picked);

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
        return;
      } catch (e: any) {
        return interaction.editReply({ content: `Erreur: ${e?.message ?? String(e)}` }).catch(() => null);
      }
    }

  return interaction.reply({ content: 'Action inconnue.', flags: MessageFlags.Ephemeral });
  }
}
