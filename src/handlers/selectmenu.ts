import { Client, Interaction, MessageFlags } from 'discord.js';
import { promises as fsPromises } from 'fs';
import { join } from 'path';

declare module 'discord.js' {
  interface Client {
    selectMenus: Map<string, any>;
  }
}

const loadSelectMenus = async (client: Client, directory: string) => {
  const files = await fsPromises.readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const filePath = join(directory, file.name);

    if (file.isDirectory()) {
      await loadSelectMenus(client, filePath);
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      try {
        const mod = await import(filePath);
        const selectMenu = mod.default || mod;

        if (!selectMenu.id || !selectMenu.execute) {
          console.warn(`The file ${file.name} does not have an ID or an execute method.`);
          continue;
        }

        client.selectMenus.set(selectMenu.id, selectMenu);
        console.log(`SelectMenu ${selectMenu.id} loaded!`);
      } catch (err) {
        console.error(`Failed to load selectmenu at ${filePath}:`, err);
      }
    }
  }
};

module.exports = (client: Client) => {
  client.selectMenus = new Map(); 
  const selectMenusDir = join(__dirname, '../interactions/selectmenu');
  loadSelectMenus(client, selectMenusDir).catch(err => console.error('Failed to load select menus:', err));

  client.on('interactionCreate', async (interaction: Interaction) => {
    if (
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu() ||
      interaction.isChannelSelectMenu() ||
      interaction.isRoleSelectMenu() ||
      interaction.isMentionableSelectMenu()
    ) {
      
      const customId = interaction.customId;
      const [menuId, ...params] = customId.split(':'); 

      const selectMenu = client.selectMenus.get(menuId);
      if (!selectMenu) {
  return interaction.reply({ content: 'Select menu not found.', flags: MessageFlags.Ephemeral });
      }

      try {
        await selectMenu.execute(interaction, params);
      } catch (error) {
        console.error(`Error while executing the select menu ${customId}:`, error);
  await interaction.reply({ content: 'An error occurred while executing this select menu.', flags: MessageFlags.Ephemeral });
      }
    }
  });
};