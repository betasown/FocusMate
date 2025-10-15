import { Client, Message } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    textCommands: Map<string, any>;
  }
}

const loadTextCommands = async (client: Client, directory: string) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadTextCommands(client, filePath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const command = mod.default || mod;
        if (!command || !command.name) continue;
        client.textCommands.set(command.name, command);
        console.log(`Text command ${command.name} loaded!`);
      } catch (err) {
        console.error(`Failed to load text command at ${filePath}:`, err);
      }
    }
  }
};

module.exports = (client: Client) => {
  client.textCommands = new Map();

  const commandsDir = join(__dirname, '../commands/message');
  // kick off loading but don't block the rest (still async internal)
  loadTextCommands(client, commandsDir).catch(err => console.error('Failed to load text commands:', err));

  client.on('messageCreate', async (message: Message) => {
    if (message.author.bot || !message.guild) return;

    const prefix = process.env.PREFIX || '+';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.textCommands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (error) {
      console.error(error);
      await message.reply('There was an error executing that command.');
    }
  });
};