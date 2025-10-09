import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags, ActionRow } from 'discord.js';
import { listTasks } from '../../../services/todoDb';

export default {
  id: 'todo',
  async execute(interaction: ButtonInteraction) {
  const parts = interaction.customId.split(':');
  const action = parts[1];
  const slug = parts[2];
  const channelId = parts[3] ?? interaction.channelId;
  const messageId = parts[4] ?? interaction.message.id;

    if (!action) return interaction.reply({ content: 'Action manquante.', flags: MessageFlags.Ephemeral });

    if (action === 'add') {
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
      return interaction.showModal(modal);
    }

    if (action === 'edit') {
      if (!slug) return interaction.reply({ content: 'Projet introuvable.', flags: MessageFlags.Ephemeral });
      try {
        const tasks = await listTasks(slug);
        if (!tasks.length) return interaction.reply({ content: 'Aucune tâche à modifier.', flags: MessageFlags.Ephemeral });

        const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = await import('discord.js');
        const options = tasks.slice(0, 25).map(t => new StringSelectMenuOptionBuilder()
          .setLabel(`#${t.id} • ${t.title.substring(0, 80)}`)
          .setValue(String(t.id))
          .setDescription(t.state)
        );

        const taskMenu = new StringSelectMenuBuilder()
          .setCustomId(`todo:edit_pick:${slug}:${channelId}:${messageId}`)
          .setPlaceholder('Choisir une tâche à modifier')
          .addOptions(options);

        const row1 = new ActionRowBuilder<typeof taskMenu>().addComponents(taskMenu);
        return interaction.reply({ content: 'Sélectionnez la tâche à modifier.', components: [row1 as any], flags: MessageFlags.Ephemeral });
      } catch (e: any) {
        return interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, flags: MessageFlags.Ephemeral });
      }
    }

    if (action === 'delete') {
      if (!slug) return interaction.reply({ content: 'Projet introuvable.', flags: MessageFlags.Ephemeral });
      try {
        const tasks = await listTasks(slug);
        if (!tasks.length) return interaction.reply({ content: 'Aucune tâche à supprimer.', flags: MessageFlags.Ephemeral });

        const { StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = await import('discord.js');
        const options = tasks.slice(0, 25).map(t => new StringSelectMenuOptionBuilder()
          .setLabel(`#${t.id} • ${t.title.substring(0, 80)}`)
          .setValue(String(t.id))
          .setDescription(t.state)
        );

        const menu = new StringSelectMenuBuilder()
          .setCustomId(`todo:delete_pick:${slug}:${channelId}:${messageId}`)
          .setPlaceholder('Choisir une tâche à supprimer')
          .addOptions(options);

        const row = new ActionRowBuilder<typeof menu>().addComponents(menu);
        return interaction.reply({ content: 'Choisissez la tâche à supprimer.', components: [row as any], flags: MessageFlags.Ephemeral });
      } catch (e: any) {
        return interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, flags: MessageFlags.Ephemeral });
      }
    }

    return interaction.reply({ content: 'Action inconnue.', flags: MessageFlags.Ephemeral });
  }
}
