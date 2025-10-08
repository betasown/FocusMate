import { Client, REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    commands: any; 
  }
}

const loadCommands = (client: Client, directory: string, body: object[]) => {
  const files = readdirSync(directory, { withFileTypes: true });

  for (const file of files) {
    const path = join(directory, file.name);

    if (file.isDirectory()) {
      loadCommands(client, path, body); 
    } else if (file.name.endsWith('.js')) {
      const command = require(path).command;
      body.push(command.data.toJSON());
      client.commands.set(command.data.name, command);
    }
  }
};

module.exports = async (client: Client) => {
  const body: object[] = [];
  const commandsDir = join(__dirname, '../commands/public');
  const token = process.env.token || ''; 
  const clientid = process.env.client || '';
  const guildid = process.env.guild || '';

  loadCommands(client, commandsDir, body);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (guildid) {
      await rest.put(Routes.applicationGuildCommands(clientid, guildid), { body });
      console.log(`Registered ${body.length} slash command(s) to guild ${guildid}.`);
    } else {
      await rest.put(Routes.applicationCommands(clientid), { body });
      console.log(`Registered ${body.length} global slash command(s). Note: global updates can take up to 1 hour to appear.`);
    }
  } catch (error) {
    console.error(error);
  }
};