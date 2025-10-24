
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

// Handler: load AND register commands
export default async (client: Client) => {
  const body: any[] = [];
  const commandsDir = join(__dirname, '../commands/private');
  const token = process.env.token || ''; 
  const clientid = process.env.client || '';
  const guildid = process.env.guild || '';

  // Load all commands into memory
  await loadCommands(client, commandsDir, body);
  console.log(`✅ Loaded ${body.length} private command(s) into memory`);

  // Provide a clearer message about missing env vars (without printing the token)
  const missing: string[] = [];
  if (!token) missing.push('token');
  if (!clientid) missing.push('client');
  if (!guildid) missing.push('guild');

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variable(s): ${missing.join(', ')}. Skipping Discord registration of private commands.`);
    console.warn('   - Ensure you have a `.env` file with: token, client, guild');
    return;
  }

  if (body.length === 0) {
    console.log('No private commands to register.');
    return;
  }

  // Deduplicate commands by name
  const uniqueByName = new Map<string, any>();
  for (const cmdEntry of body) {
    const name = cmdEntry.name || `unnamed-${Math.random()}`;
    if (!uniqueByName.has(name)) uniqueByName.set(name, cmdEntry);
  }

  // Sort: admin commands first, then alphabetical by name
  const uniqueEntries = Array.from(uniqueByName.values()).sort((a, b) => {
    if (a.isAdmin === b.isAdmin) return a.name.localeCompare(b.name);
    return a.isAdmin ? -1 : 1;
  });

  const uniqueBody = uniqueEntries.map(e => e.payload);

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`📤 Registering ${uniqueBody.length} private command(s) to guild ${guildid}...`);
    await rest.put(Routes.applicationGuildCommands(clientid, guildid), { body: uniqueBody });
    console.log(`✅ Successfully registered ${uniqueBody.length} private commands!`);
  } catch (error: any) {
    console.error('❌ Bulk registration failed:', error.message);
    console.log('Trying per-command registration...');
    
    // Fallback: try registering commands individually
    for (const cmd of uniqueBody) {
      try {
        await rest.post(Routes.applicationGuildCommands(clientid, guildid), { body: cmd });
        console.log(`  ✅ ${cmd.name}`);
      } catch (errCmd: any) {
        console.error(`  ❌ ${cmd.name}: ${errCmd.message}`);
      }
    }
  }
};