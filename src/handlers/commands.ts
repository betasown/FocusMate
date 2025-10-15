import { Client, REST, Routes } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    commands: any; 
  }
}

const loadCommands = async (client: Client, directory: string, body: any[]) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadCommands(client, filePath, body);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const command = mod.command;
        if (!command || !command.data) continue;
        body.push({
          name: command.data.name,
          payload: command.data.toJSON(),
          filePath,
          isAdmin: filePath.includes('/admin/') || filePath.includes('\\admin\\'),
        });
        client.commands.set(command.data.name, command);
      } catch (err) {
        console.error(`Failed to load command at ${filePath}:`, err);
      }
    }
  }
};

module.exports = async (client: Client) => {
  const body: object[] = [];
  const commandsDir = join(__dirname, '../commands/public');
  const token = process.env.token || ''; 
  const clientid = process.env.client || '';
  const guildid = process.env.guild || '';

  await loadCommands(client, commandsDir, body);

  // Deduplicate commands by name
  const uniqueByName = new Map<string, any>();
  for (const cmdEntry of body as any[]) {
    const name = cmdEntry.name || `unnamed-${Math.random()}`;
    if (!uniqueByName.has(name)) uniqueByName.set(name, cmdEntry);
  }

  // Sort: admin first, then alphabetical
  const uniqueEntries = Array.from(uniqueByName.values()).sort((a, b) => {
    if (a.isAdmin === b.isAdmin) return a.name.localeCompare(b.name);
    return a.isAdmin ? -1 : 1;
  });

  const uniqueBody = uniqueEntries.map(e => e.payload);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    if (guildid) {
    // registering unique commands to guild
      try {
        await rest.put(Routes.applicationGuildCommands(clientid, guildid), { body: uniqueBody });
        console.log(`Registered ${uniqueBody.length} unique slash command(s) to guild ${guildid}.`);
      } catch (errBulk) {
        console.error('Bulk guild registration failed, falling back to per-command registration:', errBulk);
        for (const cmd of uniqueBody as any[]) {
          try {
            await rest.post(Routes.applicationGuildCommands(clientid, guildid), { body: cmd });
            console.log(`✅ Registered command '${cmd.name}' to guild ${guildid}`);
          } catch (errCmd) {
            console.error(`Failed to register command '${cmd.name}' to guild ${guildid}:`, errCmd);
          }
        }
      }
    } else {
  // registering unique global commands
      try {
        await rest.put(Routes.applicationCommands(clientid), { body: uniqueBody });
        console.log(`Registered ${uniqueBody.length} unique global slash command(s). Note: global updates can take up to 1 hour to appear.`);
      } catch (errBulk) {
        console.error('Bulk global registration failed, falling back to per-command registration:', errBulk);
        for (const cmd of uniqueBody as any[]) {
          try {
            await rest.post(Routes.applicationCommands(clientid), { body: cmd });
            console.log(`✅ Registered global command '${cmd.name}'`);
          } catch (errCmd) {
            console.error(`Failed to register global command '${cmd.name}':`, errCmd);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};