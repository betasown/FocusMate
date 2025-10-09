import { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import { ensureProjectTable, slugifyProject, listTasks, formatTasks } from '../../services/todoDb';

export default {
  id: 'todo:setup',
  async execute(interaction: ModalSubmitInteraction) {
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

      await interaction.reply({
        embeds: [embed],
        components: [row],
        flags: MessageFlags.SuppressNotifications,
      });
      const reply = await interaction.fetchReply();
      // After message is sent, include channel+message IDs in customIds for later updates
      const messageId = reply.id;
      const channelId = reply.channelId;
      const rowWithIds = new ActionRowBuilder<ButtonBuilder>().addComponents(
        addBtn.setCustomId(`todo:add:${slug}:${channelId}:${messageId}`),
        editBtn.setCustomId(`todo:edit:${slug}:${channelId}:${messageId}`),
        delBtn.setCustomId(`todo:delete:${slug}:${channelId}:${messageId}`)
      );

      await reply.edit({ components: [rowWithIds] });
    } catch (err: any) {
      await interaction.reply({ content: `Erreur: ${err?.message ?? String(err)}`, flags: MessageFlags.Ephemeral });
    }
  },
};
