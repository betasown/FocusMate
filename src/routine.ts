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

/**
 * Initialize cron jobs for EDT publishing and homework notifications.
 * MUST be called AFTER database pool is initialized.
 */
export function initRoutines(): void {
  const CRON_SCHEDULE = (process.env.EDT_CRON || '30 7 * * 1-5').trim();
  const CHANNEL_ID = process.env.EDT_CHANNEL_ID || '1404440454967328909';

  // Schedule EDT publishing cron
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
    console.log(`✅ EDT cron scheduled: ${CRON_SCHEDULE}`);
  }

  // Notification cron removed: disabled because it caused heavy periodic load.
  // If you want to re-enable notifications later, reintroduce a schedule here
  // or implement a toggled/efficient notification scheduler (e.g. push-based or db-queue).
}