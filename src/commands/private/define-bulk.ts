import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { defineBulkKeywords } from '../../services/gemini';

export const command = {
  data: new SlashCommandBuilder()
    .setName('define-bulk')
    .setDescription('Obtenir les définitions de plusieurs mots-clés via Gemini AI')
    .addStringOption(option =>
      option
        .setName('keywords')
        .setDescription('Liste de mots-clés séparés par des virgules ou retours à la ligne')
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
  // Defer reply to avoid 3-second timeout (public reply)
  await interaction.deferReply();

    const input = interaction.options.getString('keywords', true);

    // Robust parsing:
    // - Accept separators: comma, newline, semicolon, pipe
    // - Allow quoted phrases to include separators inside ("statistiques descriptives, avancées")
    // Regex explanation: match either a quoted phrase or a sequence of non-separator chars
    const tokenRegex = /"([^"]+)"|'([^']+)'|([^,;\n|]+)/g;
    const keywords: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = tokenRegex.exec(input)) !== null) {
      const kw = (m[1] || m[2] || m[3] || '').trim();
      if (kw.length > 0) keywords.push(kw);
    }

    if (keywords.length === 0) {
      await interaction.editReply({
        content: '❌ Aucun mot-clé valide trouvé.'
      });
      return;
    }

    if (keywords.length > 20) {
      await interaction.editReply({
        content: `❌ Trop de mots-clés (${keywords.length}). Maximum : 20.`
      });
      return;
    }

    try {
      const definitions = await defineBulkKeywords(keywords);
      
      // Split response into chunks if too long (Discord limit: 2000 chars)
      if (definitions.length <= 2000) {
        await interaction.editReply({
          content: definitions
        });
      } else {
        // Send first chunk as reply, rest as follow-ups
        const chunkSize = 1900;
        const chunks: string[] = [];
        for (let i = 0; i < definitions.length; i += chunkSize) {
          chunks.push(definitions.substring(i, i + chunkSize));
        }
        
        await interaction.editReply({ content: chunks[0] });
        
        for (let i = 1; i < chunks.length && i < 3; i++) {
          await interaction.followUp({
            content: chunks[i]
          });
        }

        if (chunks.length > 3) {
          await interaction.followUp({
            content: '... (réponse tronquée, trop longue)'
          });
        }
      }
    } catch (error) {
      console.error('Error defining keywords:', error);
      await interaction.editReply({
        content: `❌ Erreur lors de la récupération des définitions.`
      });
    }
  }
};
