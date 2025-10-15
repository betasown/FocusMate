
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
        // Dynamic import to avoid evaluating heavy native modules at startup
        const mod = await import(filePath);
        const command = mod.command;
        if (!command || !command.data) continue;
        // store metadata so we can sort/group later
        body.push({
          name: command.data.name,
          payload: command.data.toJSON(),
          filePath,
          isAdmin: filePath.includes('/admin/') || filePath.includes('\\admin\\'),
        });
        client.commands.set(command.data.name, command);
        console.log(`Command ${command.data.name} loaded!`);
      } catch (err) {
        console.error(`Failed to load command at ${filePath}:`, err);
      }
    }
  }
};

module.exports = async (client: Client) => {
  const body: object[] = [];
  const commandsDir = join(__dirname, '../commands/private');
  const token = process.env.token || ''; 
  const clientid = process.env.client || '';
  const guildid = process.env.guild || '';

  await loadCommands(client, commandsDir, body);

  console.log(`Found ${body.length} private command(s) to register for guild ${guildid}`);

  if (!token || !clientid || !guildid) {
    console.warn('Missing token/client/guild env vars; skipping private commands registration.');
    return;
  }

  // Deduplicate commands by name
  const uniqueByName = new Map<string, any>();
  for (const cmdEntry of body as any[]) {
    const name = cmdEntry.name || `unnamed-${Math.random()}`;
    if (!uniqueByName.has(name)) uniqueByName.set(name, cmdEntry);
  }

  // Convert to array and sort: admin commands first, then alphabetical by name
  const uniqueEntries = Array.from(uniqueByName.values()).sort((a, b) => {
    if (a.isAdmin === b.isAdmin) return a.name.localeCompare(b.name);
    return a.isAdmin ? -1 : 1;
  });

  const uniqueBody = uniqueEntries.map(e => e.payload);
  console.log(`Registering ${uniqueBody.length} unique private command(s) to guild ${guildid}`);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    await rest.put(Routes.applicationGuildCommands(clientid, guildid), { body: uniqueBody });
  } catch (error) {
    console.error('Bulk registration failed, will try per-command registration. Error:', error);
    // Fallback: try registering commands individually to identify problematic ones
    for (const cmd of uniqueBody as any[]) {
      try {
        await rest.post(Routes.applicationGuildCommands(clientid, guildid), { body: cmd });
        console.log(`✅ Registered command '${cmd.name}'`);
      } catch (errCmd) {
        console.error(`Failed to register command '${cmd.name}':`, errCmd);
      }
    }
  }
};