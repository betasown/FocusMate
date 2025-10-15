import { StringSelectMenuInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, EmbedBuilder } from 'discord.js';
import { HomeworkService } from '../../../services/homeworkMariaDb';

export default {
  id: 'devoir',
  async execute(interaction: StringSelectMenuInteraction) {
    const parts = interaction.customId.split(':');
    const action = parts[1];

    if (action === 'delete_pick') {
      const picked = Number(interaction.values[0]);
      if (!picked) return interaction.reply({ content: 'Sélection invalide.', flags: MessageFlags.Ephemeral });

      try {
        await interaction.deferUpdate().catch(() => null);
        // Supprimer le devoir
        const hw = await HomeworkService.getHomeworkById(picked).catch(() => null);
        if (!hw) {
          await interaction.followUp({ content: '❌ Devoir introuvable.', flags: MessageFlags.Ephemeral });
          return;
        }

        const deleted = await HomeworkService.deleteHomework(picked);
        if (deleted) {
          // Envoi d'un message éphémère de confirmation puis suppression après délai
          await interaction.reply({ content: `✅ Devoir "${hw.title}" (ID: ${picked}) supprimé.`, ephemeral: true });
          const msg = await interaction.fetchReply().catch(() => null) as any;
          // supprimer l'éphémère après 3s
          setTimeout(() => { try { msg?.delete?.().catch(() => null); } catch (e) {} }, 3000);
        } else {
          await interaction.reply({ content: '❌ Impossible de supprimer le devoir.', ephemeral: true });
          const msg = await interaction.fetchReply().catch(() => null) as any;
          setTimeout(() => { try { msg?.delete?.().catch(() => null); } catch (e) {} }, 3000);
        }

        // Optionnel: si le message original contenait un embed listant devoirs, on pourrait le mettre à jour ici
      } catch (e: any) {
        console.error('Erreur delete pick:', e);
  await interaction.reply({ content: `Erreur: ${e?.message ?? String(e)}`, ephemeral: true }).catch(() => null);
  const msg = await interaction.fetchReply().catch(() => null) as any;
  setTimeout(() => { try { msg?.delete?.().catch(() => null); } catch (e) {} }, 3000);
      }

      return;
    }

    return interaction.reply({ content: 'Action inconnue.', flags: MessageFlags.Ephemeral });
  }
};
