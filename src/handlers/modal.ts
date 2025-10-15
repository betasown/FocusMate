import { Client, Interaction, MessageFlags } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    modals: Map<string, any>;
  }
}

const loadModals = async (client: Client, directory: string) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadModals(client, filePath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const modal = mod.default || mod;
        if (!modal.id || !modal.execute) {
          console.warn(`The file ${file.name} does not have an ID or an execute method.`);
          continue;
        }
        client.modals.set(modal.id, modal);
      } catch (err) {
        console.error(`Failed to load modal at ${filePath}:`, err);
      }
    }
  }
};

module.exports = (client: Client) => {
  client.modals = new Map(); 
  const modalsDir = join(__dirname, '../interactions/modal');
  loadModals(client, modalsDir).catch(err => console.error('Failed to load modals:', err));

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isModalSubmit()) return;

    const customId = interaction.customId;
    const [modalId, ...params] = customId.split(':'); 

    const modal = client.modals.get(modalId);
    if (!modal) {
      return interaction.reply({ content: 'Modal not found.', flags: MessageFlags.Ephemeral });
    }

    try {
      await modal.execute(interaction, params);
    } catch (error) {
      console.error(`Error while executing the modal ${customId}:`, error);
  await interaction.reply({ content: 'An error occurred while executing this modal.', flags: MessageFlags.Ephemeral });
    }
  });
};