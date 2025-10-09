import client from './bot';
import cron from 'node-cron';
import { ChannelType, TextChannel } from 'discord.js';
import { getEdtEmbed } from './commands/public/edt';

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