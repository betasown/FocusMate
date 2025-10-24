import { ShardingManager } from 'discord.js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.token;

if (!token) {
    console.error('The Discord token is missing. Make sure the .env file contains DISCORD_TOKEN.');
    process.exit(1);
}

// In production we keep 'auto' so Discord can recommend shard count.
// For local/dev runs, default to 1 to avoid network calls to Discord (which can timeout behind firewalls).
const totalShards = process.env.TOTAL_SHARDS
    ? Number(process.env.TOTAL_SHARDS)
    : (process.env.NODE_ENV === 'production' ? 'auto' : 1);

const manager = new ShardingManager(path.join(__dirname, 'bot.js'), {
    token: token,
    totalShards: totalShards,
});

manager.on('shardCreate', (shard) => {
    console.log(`Shard ${shard.id} launched.`);
});

manager.spawn().catch((error) => {
    console.error('Error while launching shards:', error);
});