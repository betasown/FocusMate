import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';
import { listTasks } from '../../../services/todoDb';

export default {
  id: 'todo:delete',
  async execute(interaction: ButtonInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3] ?? interaction.channelId;
    const messageId = parts[4] ?? interaction.message.id;
    if (!slug) return interaction.reply({ content: 'Projet introuvable.', flags: MessageFlags.Ephemeral });
    try {
      const tasks = await listTasks(slug);
      if (!tasks.length) return interaction.reply({ content: 'Aucune tâche à supprimer.', flags: MessageFlags.Ephemeral });

      const options = tasks.slice(0, 25).map(t => new StringSelectMenuOptionBuilder()
        .setLabel(`#${t.id} • ${t.title.substring(0, 80)}`)
        .setValue(String(t.id))
        .setDescription(t.state)
      );

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`todo:delete_pick:${slug}:${channelId}:${messageId}`)
        .setPlaceholder('Choisir une tâche à supprimer')
        .addOptions(options);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
      await interaction.reply({ content: 'Choisissez la tâche à supprimer.', components: [row], flags: MessageFlags.Ephemeral });
    } catch (e: any) {
      await interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, flags: MessageFlags.Ephemeral });
    }
  }
}
