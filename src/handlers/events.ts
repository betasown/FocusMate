import { Client } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

const loadEvents = async (client: Client, directory: string) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadEvents(client, filePath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const event = mod.default || mod;
        event.once
          ? client.once(event.name, (...args: any[]) => event.execute(...args))
          : client.on(event.name, (...args: any[]) => event.execute(...args));
      } catch (err) {
        console.error(`Failed to load event at ${filePath}:`, err);
      }
    }
  }
};

module.exports = (client: Client) => {
  client.setMaxListeners(20); 
  const eventsDir = join(__dirname, '../events');
  loadEvents(client, eventsDir).catch(err => console.error('Failed to load events:', err));
};