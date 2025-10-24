import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { promises as fsPromises } from 'fs';
// DB init and routines are handled in ClientReady to avoid blocking login/sharding

dotenv.config()

// Database initialization and routines are performed in ClientReady to avoid blocking login

const client = new Client({
  intents: [
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildExpressions,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessagePolls,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.SoundboardSound,
    Partials.ThreadMember,
    Partials.User,
  ]
});

(client as any).commands = new Collection();
(client as any).textCommands = new Collection();
(client as any).cooldowns = new Collection();

const handler = join(__dirname, './handlers');

// Handlers that perform heavy work (registering slash commands via REST)
// are deferred until the client is ready to avoid blocking the shard startup.
// Store base names (without extension) so runtime can work with dist (.js) or src (.ts).
const deferredHandlerBases = new Set([
  'commands',
  'private.commands',
]);

const getBaseName = (filename: string) => filename.replace(/\.(t|j)s$/i, '');

// Charger les handlers de façon asynchrone pour permettre aux handlers async de s'exécuter correctement
(async () => {
  try {
    console.log('📦 Loading handlers...');
    const files = await fsPromises.readdir(handler);
    console.log(`Found ${files.length} handler files:`, files);
    for (const file of files) {
      const handlerPath = join(handler, file);
      try {
        if (deferredHandlerBases.has(getBaseName(file))) {
          console.log(`⏭ Skipping heavy handler for now: ${file}`);
          continue;
        }

        console.log(`⏳ Loading handler: ${file}...`);
        const mod = await import(handlerPath);
        const handlerFunction = mod.default || mod;
        if (typeof handlerFunction === 'function') {
          // Si la fonction retourne une promesse, on l'attend
          const res = handlerFunction(client);
          if (res && typeof res.then === 'function') {
            await res;
          }
          console.log(`✅ Handler loaded: ${file}`);
        } else {
          console.log(`⚠️ Handler ${file} did not export a function`);
        }
      } catch (err) {
        console.error(`Failed to load handler ${handlerPath}:`, err);
      }
    }
    console.log('✅ All handlers loaded!');
  } catch (err) {
    console.error('Failed to read handlers directory:', err);
  }
  
  // Login AFTER all lightweight handlers are loaded
  console.clear();
  await client.login(process.env.token);

  // Once the client is ready, load deferred heavy handlers (commands registration)
  client.once('ready', async () => {
    console.log('🔁 Client ready — loading deferred handlers (commands)...');

    for (const base of Array.from(deferredHandlerBases)) {
      // Try .js first (dist), then .ts (src)
      const tryPaths = [join(handler, `${base}.js`), join(handler, `${base}.ts`)];
      let loaded = false;
      for (const p of tryPaths) {
        try {
          console.log(`⏳ Loading deferred handler: ${p}...`);
          const mod = await import(p);
          const handlerFunction = mod.default || mod;
          if (typeof handlerFunction === 'function') {
            const res = handlerFunction(client);
            if (res && typeof res.then === 'function') await res;
            console.log(`✅ Deferred handler loaded: ${p}`);
          } else {
            console.log(`⚠️ Deferred handler ${p} did not export a function`);
          }
          loaded = true;
          break;
        } catch (err) {
          // ignore and try next extension
        }
      }
      if (!loaded) {
        console.error(`Failed to load deferred handler for base '${base}': tried .js and .ts`);
      }
    }

    console.log('✅ All deferred handlers attempted.');
  });
})();

export default client;