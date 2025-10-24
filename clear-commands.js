require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.token);
const clientId = process.env.client;
const guildId = process.env.guild;

async function clearCommands() {
  try {
    console.log('🧹 Suppression des commandes globales...');
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('✅ Commandes globales supprimées');

    console.log('🧹 Suppression des commandes guild...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
    console.log('✅ Commandes guild supprimées');

    console.log('✨ Redémarre le bot maintenant avec: npm start');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

clearCommands();
