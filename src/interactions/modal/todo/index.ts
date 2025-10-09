import { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { ensureProjectTable, addTask, slugifyProject, listTasks, formatTasks } from '../../../services/todoDb';

export default {
  id: 'todo',
  async execute(interaction: ModalSubmitInteraction) {
    const parts = interaction.customId.split(':');
    const action = parts[1];

    if (action === 'setup') {
      try {
        const name = interaction.fields.getTextInputValue('project_name').trim();
        const slug = slugifyProject(name);
        await ensureProjectTable(slug);
        const tasks = await listTasks(slug);

        const embed = new EmbedBuilder()
          .setColor(0x2f88ff)
          .setTitle(`📁 ${name}`)
          .setDescription(formatTasks(tasks));

        const addBtn = new ButtonBuilder().setCustomId(`todo:add:${slug}`).setLabel('➕ Ajouter tâche').setStyle(ButtonStyle.Success);
        const editBtn = new ButtonBuilder().setCustomId(`todo:edit:${slug}`).setLabel('✏️ Modifier').setStyle(ButtonStyle.Primary);
        const delBtn = new ButtonBuilder().setCustomId(`todo:delete:${slug}`).setLabel('🗑️ Supprimer').setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(addBtn, editBtn, delBtn);

  await interaction.reply({ embeds: [embed], components: [row], flags: MessageFlags.SuppressNotifications });

  const reply = await interaction.fetchReply();

        const messageId = reply.id;
        const channelId = reply.channelId;
        const rowWithIds = new ActionRowBuilder<ButtonBuilder>().addComponents(
          addBtn.setCustomId(`todo:add:${slug}:${channelId}:${messageId}`),
          editBtn.setCustomId(`todo:edit:${slug}:${channelId}:${messageId}`),
          delBtn.setCustomId(`todo:delete:${slug}:${channelId}:${messageId}`)
        );

        await reply.edit({ components: [rowWithIds] });
        return;
      } catch (err: any) {
        return interaction.reply({ content: `Erreur: ${err?.message ?? String(err)}`, flags: MessageFlags.Ephemeral });
      }
    }

    if (action === 'addModal') {
      const slug = parts[2];
      const channelId = parts[3];
      const messageId = parts[4];
      const title = interaction.fields.getTextInputValue('task_title').trim();
      if (!slug || !title) return interaction.reply({ content: 'Données manquantes.', flags: MessageFlags.Ephemeral });
      try {
  // No ephemeral reply needed; we'll update the main message and not send confirmations
        const id = await addTask(slug, title);

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
