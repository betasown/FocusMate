import { SlashCommandBuilder, type CommandInteraction, EmbedBuilder, MessageFlags } from 'discord.js';
import { getPool } from '../../services/db';

export const command = {
  data: new SlashCommandBuilder()
    .setName('dbping')
    .setDescription('Teste la connexion à la base MariaDB'),

  async execute(interaction: CommandInteraction) {
    try {
      const pool = getPool();
      const conn = await pool.getConnection();
      const t0 = Date.now();
      await conn.ping();
      const dt = Date.now() - t0;
      conn.release();

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x00aa00)
            .setTitle('MariaDB')
            .setDescription(`✅ Connexion OK (ping ${dt}ms)`) 
        ],
        flags: MessageFlags.Ephemeral
      });
    } catch (err: any) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xaa0000)
            .setTitle('MariaDB')
            .setDescription(`❌ Connexion échouée\n\n${err?.message ?? String(err)}`)
        ],
        flags: MessageFlags.Ephemeral
      });
    }
  },
};
