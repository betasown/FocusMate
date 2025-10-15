import {
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { recordFocusSession } from '../../services/focusService';

export const command = {
  data: new SlashCommandBuilder()
    .setName('focus')
    .setDescription("Démarre une session Pomodoro / Focus ou affiche des stats")
    .addSubcommand(sc => sc
      .setName('start')
      .setDescription('Démarre une session')
      .addIntegerOption(opt =>
        opt.setName('minutes').setDescription('Durée en minutes (ex: 25). Défaut 25').setRequired(false)
      )
    )
    .addSubcommand(sc => sc
      .setName('stats')
      .setDescription("Affiche les statistiques d'un utilisateur (durée totale et nombre de sessions)")
      .addUserOption(opt => opt.setName('user').setDescription('Utilisateur (par défaut : vous)').setRequired(false))
    )
    .addSubcommand(sc => sc
      .setName('leaderboard')
      .setDescription('Affiche le classement des meilleurs focusers du serveur')
      .addIntegerOption(opt => opt.setName('limit').setDescription('Nombre à afficher (défaut 10)').setRequired(false))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

  async execute(interaction: CommandInteraction) {
    const sub = (interaction.options as any).getSubcommand?.();

    if (sub === 'stats') {
      const targetUser = (interaction.options as any).getUser?.('user') ?? interaction.user;
      const stats = await (await import('../../services/focusService')).getStatsFor(String(targetUser.id), String(interaction.guildId));
      const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques Focus — ${targetUser.username}`)
        .setDescription(`Sessions : **${stats.sessions}**\nTotal : **${stats.totalMinutes} minutes**`)
        .setColor(0x3498db);

  return interaction.reply({ embeds: [embed] });
    }

    const minutes = (interaction.options as any).getInteger?.('minutes') ?? 25;

    if (sub === 'leaderboard') {
      const limit = (interaction.options as any).getInteger?.('limit') ?? 10;
      const leaderboard = await (await import('../../services/focusService')).getLeaderboardFor(String(interaction.guildId), limit);

      // Resolve usernames where possible
      const resolved = await Promise.all(leaderboard.map(async (row: any, idx: number) => {
        let display = row.userId;
        try {
          const member = await interaction.guild?.members.fetch(row.userId);
          if (member) display = `${member.displayName}`;
        } catch (e) {
          // ignore
        }
        return `${idx + 1}. **${display}** — ${row.totalMinutes} minutes (${row.sessions} sessions)`;
      }));

      const embed = new EmbedBuilder()
        .setTitle('🏆 Focus Leaderboard')
        .setDescription(resolved.length ? resolved.join('\n') : 'Aucune donnée pour le moment')
        .setColor(0xF1C40F);

  return interaction.reply({ embeds: [embed] });
    }

  await interaction.deferReply();

    const member = interaction.member as GuildMember | null;
    if (!member || !member.guild) {
      return interaction.editReply({ content: "Commande utilisable uniquement dans un serveur." });
    }

    // Build an embed to show session started
    const embed = new EmbedBuilder()
      .setTitle('🎯 Session Focus démarrée')
      .setDescription(`Durée : **${minutes} minutes**\nJe t'enverrai une notification à la fin.`)
      .setColor(0x2ecc71);

    // Attempt to move user to a 'Focus' voice channel and mute/deafen
    let moved = false;
    try {
      const voiceState = member.voice;
      if (voiceState && voiceState.channel) {
        const guild = member.guild;
        // Find or create a channel named 'Focus'
        let focusChannel = guild.channels.cache.find(c => c.type === ChannelType.GuildVoice && c.name.toLowerCase() === 'focus');
        if (!focusChannel) {
          if (guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels)) {
            focusChannel = await guild.channels.create({ name: 'Focus', type: ChannelType.GuildVoice });
          }
        }

        if (focusChannel && guild.members.me?.permissions.has(PermissionFlagsBits.MoveMembers)) {
          await member.voice.setChannel(focusChannel as any);
          // Try to mute and deafen the member if allowed
          try {
            await member.voice.setMute(true);
            await member.voice.setDeaf(true);
          } catch (err) {
            // ignore if bot lacks permission
          }
          moved = true;
        }
      }
    } catch (err) {
      console.error('Error moving/muting member for focus:', err);
    }

    await interaction.editReply({ embeds: [embed] });

    // Start timer (non-blocking). We'll notify via DM and channel at the end.
    setTimeout(async () => {
      // Unmute/un-deafen and optionally move back not attempted (we don't know previous channel)
      try {
        if (member && member.voice) {
          try { await member.voice.setMute(false); } catch {}
          try { await member.voice.setDeaf(false); } catch {}
        }
      } catch (err) {
        // ignore
      }

      // Send notification in the channel where the command was invoked if possible
      try {
        const channel = interaction.channel;
        if (channel) {
          try { await (channel as any).send({ content: `${member.displayName}, ta session de **${minutes} minutes** est terminée ! 🎉` }); } catch (e) {}
        }
      } catch (err) {
        // ignore
      }

      // Record stats
      try {
        await recordFocusSession(String(member.id), String(member.guild.id), minutes);
      } catch (err) {
        console.error('Failed to record focus session:', err);
      }

      // Also attempt to DM the user
      try {
        await member.send(`Ta session de ${minutes} minutes est terminée ! Bon break 🙂`);
      } catch (err) {
        // ignore
      }
    }, minutes * 60 * 1000);
  },
};
