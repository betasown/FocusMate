import { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } from 'discord.js';

export default {
  id: 'todo:edit_pick',
  async execute(interaction: StringSelectMenuInteraction) {
    const parts = interaction.customId.split(':');
    const slug = parts[2];
    const channelId = parts[3] ?? interaction.channelId;
    const messageId = parts[4] ?? interaction.message.id;
    const picked = interaction.values[0];
  if (!slug || !picked) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });

    // Create state menu bound to chosen task id
    const stateMenu = new StringSelectMenuBuilder()
      .setCustomId(`todo:edit_state_apply:${slug}:${picked}:${channelId}:${messageId}`)
      .setPlaceholder('Choisir nouvel état')
      .addOptions([
        { label: 'A_FAIRE', value: 'A_FAIRE' },
        { label: 'EN_COURS', value: 'EN_COURS' },
        { label: 'REALISE', value: 'REALISE' },
      ]);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(stateMenu);
    await interaction.update({ content: `Tâche #${picked} • choisissez le nouvel état:`, components: [row] });
  }
}
