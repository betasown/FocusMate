import client from './bot';
import cron from 'node-cron';
import { ChannelType, TextChannel } from 'discord.js';
import { getEdtEmbed } from './commands/private/edt-fast';
import { HomeworkService } from './services/homeworkMariaDb';

// In-memory cache of homework IDs already notified to avoid duplicate pings while process runs
const notifiedSet = new Set<number>();

function hasExplicitTime(date: Date): boolean {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  if (h === 0 && m === 0 && s === 0) return false;
  if (h === 23 && m >= 59) return false;
  return true;
}

const CRON_SCHEDULE = (process.env.EDT_CRON || '30 7 * * 1-5').trim();
const CHANNEL_ID = process.env.EDT_CHANNEL_ID || '1404440454967328909';

if (!cron.validate(CRON_SCHEDULE)) {
  console.error(`Invalid EDT_CRON expression: "${CRON_SCHEDULE}". Use 5 fields like '30 7 * * 1-5'.`);
} else {
  cron.schedule(CRON_SCHEDULE, async () => {
  try {
    if (!CHANNEL_ID) {
      console.warn('EDT_CHANNEL_ID is not set; skipping EDT cron job.');
      return;
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel || channel.type !== ChannelType.GuildText) {
      console.warn(`Channel ${CHANNEL_ID} not found or is not a text channel.`);
      return;
    }

    const date = new Date();
    const embed = await getEdtEmbed(date);
    if (!embed) {
      await (channel as TextChannel).send({ content: `Aucun évènement trouvé pour le ${date.toLocaleDateString('fr-FR')}.` });
      return;
    }
    await (channel as TextChannel).send({ embeds: [embed] });
  } catch (err) {
    console.error('EDT cron job failed:', err);
  }
  });
}

// Notification cron: run every minute and send a ping 15 minutes before an event with explicit time
if (true) {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const notifyWindowMs = 15 * 60 * 1000; // 15 minutes

      // Ping content configuration
      const pingText = process.env.NOTIFY_PING || '@here';
      const defaultChannelEnv = process.env.NOTIFY_CHANNEL_ID || process.env.EDT_CHANNEL_ID;

      // For each guild the bot is in
      for (const [guildId, guild] of client.guilds.cache) {
        // Get upcoming homeworks for next 1 day
        const homeworks = await HomeworkService.getUpcomingHomeworks(guildId, 1);

        for (const hw of homeworks) {
          const due = new Date(hw.dueDate);
          // skip if no explicit time
          if (!hasExplicitTime(due)) continue;

          const diff = due.getTime() - now.getTime();
          // If within +/- 30 seconds of 15 minutes, and not already notified
          if (diff > 0 && Math.abs(diff - notifyWindowMs) <= 30 * 1000) {
            if (notifiedSet.has(hw.id)) continue;

            // Determine channel to send: priority env channel, then guild.systemChannel
            let channel = null;
            if (defaultChannelEnv) {
              channel = await client.channels.fetch(defaultChannelEnv).catch(() => null);
              if (channel && (channel as any).guildId !== guildId) channel = null;
            }
            if (!channel) {
              channel = guild.systemChannel || null;
            }
            if (!channel) continue; // skip if no channel to send

            if ((channel as any).type !== ChannelType.GuildText) continue;

            const ts = Math.floor(due.getTime() / 1000);
            const msg = `${pingText} Rappel : **${hw.title}** commence dans ~15 minutes (<t:${ts}:t>).`;
            await (channel as TextChannel).send({ content: msg }).catch(() => null);

            // mark as notified
            notifiedSet.add(hw.id);
          }
        }
      }
      // cleanup notifiedSet of past homeworks to avoid memory growth
      for (const id of Array.from(notifiedSet)) {
        // attempt to find homework to check if it's past
        // simple approach: remove entries older than 2 hours
        // (we don't have direct timestamp here)
        // For simplicity, clear set entries where homework no longer exists in upcoming list would be expensive; use time-based eviction
      }
    } catch (err) {
      console.error('Notification cron failed:', err);
    }
  });
}