import { Events, Collection, MessageFlags, type Interaction, type ChatInputCommandInteraction, type Collection as DjsCollection } from 'discord.js';

type Command = {
    data: { name: string; toJSON?: () => unknown };
    cooldown?: number; // seconds
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

type AugmentedClient = Interaction['client'] & {
    commands: Collection<string, Command>;
    cooldowns?: Collection<string, Collection<string, number>>;
};

export default {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const client = interaction.client as AugmentedClient;
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        // Ensure a global cooldowns map exists on the client
        if (!client.cooldowns) {
            client.cooldowns = new Collection<string, Collection<string, number>>();
        }

        const cooldowns = client.cooldowns;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection<string, number>());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name)!;
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = (timestamps.get(interaction.user.id) as number) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1000);
                return interaction.reply({
                    content: `Deux petites secondes, j'ai besoin de me recharger pour refaire : \`${command.data.name}\`. Je suis prêt dans <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
            }
        }
    },
};