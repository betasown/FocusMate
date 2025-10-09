import { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, MessageFlags } from 'discord.js';
import { listTasks } from '../../../services/todoDb';

export default {
  id: 'todo:edit',
  async execute(interaction: ButtonInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3] ?? interaction.channelId;
    const messageId = parts[4] ?? interaction.message.id;
    if (!slug) return interaction.reply({ content: 'Projet introuvable.', flags: MessageFlags.Ephemeral });
    try {
      const tasks = await listTasks(slug);
      if (!tasks.length) return interaction.reply({ content: 'Aucune tâche à modifier.', flags: MessageFlags.Ephemeral });

      const options = tasks.slice(0, 25).map(t => new StringSelectMenuOptionBuilder()
        .setLabel(`#${t.id} • ${t.title.substring(0, 80)}`)
        .setValue(String(t.id))
        .setDescription(t.state)
      );

      const taskMenu = new StringSelectMenuBuilder()
        .setCustomId(`todo:edit_pick:${slug}:${channelId}:${messageId}`)
        .setPlaceholder('Choisir une tâche à modifier')
        .addOptions(options);

      const stateMenu = new StringSelectMenuBuilder()
        .setCustomId(`todo:edit_state:${slug}:${channelId}:${messageId}`)
        .setPlaceholder('Nouveau statut')
        .addOptions([
          { label: 'A_FAIRE', value: 'A_FAIRE' },
          { label: 'EN_COURS', value: 'EN_COURS' },
          { label: 'REALISE', value: 'REALISE' },
        ]);

      const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(taskMenu);
      const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stateMenu);
      await interaction.reply({ content: 'Sélectionnez la tâche puis l’état souhaité.', components: [row1, row2], flags: MessageFlags.Ephemeral });
    } catch (e: any) {
      await interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, flags: MessageFlags.Ephemeral });
    }
  }
}
