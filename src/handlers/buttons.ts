import { Client, Interaction, MessageFlags } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    buttons: Map<string, any>;
  }
}

const loadButtons = async (client: Client, directory: string) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadButtons(client, filePath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const button = mod.default || mod;

        if (!button.id || !button.execute) {
          console.warn(`The file ${file.name} does not have an ID or an execute method.`);
          continue;
        }

        client.buttons.set(button.id, button);
        console.log(`Button ${button.id} loaded!`);
      } catch (err) {
        console.error(`Failed to load button at ${filePath}:`, err);
      }
    }
  }
};

module.exports = (client: Client) => {
  client.buttons = new Map();
  const buttonsDir = join(__dirname, '../interactions/button');
  loadButtons(client, buttonsDir).catch(err => console.error('Failed to load buttons:', err));

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const buttonId = customId.split(':')[0];

    const button = client.buttons.get(buttonId);
    if (!button) return interaction.reply({ content: 'Button not found.', flags: MessageFlags.Ephemeral });

    try {
      await button.execute(interaction);
    } catch (error) {
      console.error(`Error while executing the button ${customId}:`, error);
      await interaction.reply({ content: 'An error occurred while executing this button.', flags: MessageFlags.Ephemeral });
    }
  });
};