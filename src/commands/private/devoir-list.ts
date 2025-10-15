import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { HomeworkService, Homework } from '../../services/homeworkMariaDb';

export const command = {
    data: new SlashCommandBuilder()
        .setName('devoir-list')
        .setDescription('📋 Lister tous les devoirs')
        .addStringOption(option =>
            option
                .setName('filtre')
                .setDescription('Filtrer les devoirs')
                .setRequired(false)
                .addChoices(
                    { name: '📅 À venir (7 jours)', value: 'upcoming' },
                    { name: '⏰ En retard', value: 'overdue' },
                    { name: '✅ Terminés', value: 'completed' },
                    { name: '📚 Tous', value: 'all' }
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        try {
            if (!interaction.guildId) {
                await interaction.editReply('❌ Cette commande ne peut être utilisée que dans un serveur.');
                return;
            }

            const filter = interaction.options.getString('filtre') || 'upcoming';

            let homeworks;
            let title;

            switch (filter) {
                case 'upcoming':
                    homeworks = await HomeworkService.getUpcomingHomeworks(interaction.guildId, 7);
                    title = '📅 Devoirs à venir (7 prochains jours)';
                    break;
                case 'overdue':
                    homeworks = await HomeworkService.getOverdueHomeworks(interaction.guildId);
                    title = '⏰ Devoirs en retard';
                    break;
                case 'completed':
                    homeworks = await HomeworkService.getHomeworksByGuild(interaction.guildId, true);
                    homeworks = homeworks.filter(hw => hw.completed);
                    title = '✅ Devoirs terminés';
                    break;
                case 'all':
                default:
                    homeworks = await HomeworkService.getHomeworksByGuild(interaction.guildId, true);
                    title = '📚 Tous les devoirs';
                    break;
            }

            if (homeworks.length === 0) {
                await interaction.editReply(`${title}\n\n✨ Aucun devoir trouvé !`);
                return;
            }

            // Créer l'embed
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(title)
                .setDescription(`Total: ${homeworks.length} devoir(s)`)
                .setTimestamp();

            // Grouper par matière
            const homeworksBySubject: { [key: string]: typeof homeworks } = {};
            homeworks.forEach(hw => {
                if (!homeworksBySubject[hw.subject]) {
                    homeworksBySubject[hw.subject] = [];
                }
                homeworksBySubject[hw.subject].push(hw);
            });

            // Ajouter les champs par matière (limité à 25 champs max)
            let fieldCount = 0;
            for (const [subject, subjectHomeworks] of Object.entries(homeworksBySubject)) {
                if (fieldCount >= 25) break; // Limite Discord

                const hwList = subjectHomeworks.slice(0, 5).map(hw => {
                    const status = hw.completed ? '✅' : '⏳';
                    const date = `<t:${Math.floor(hw.dueDate.getTime() / 1000)}:d>`;
                    return `${status} **${hw.title}**\n└ Échéance: ${date}`;
                }).join('\n\n');

                const remaining = subjectHomeworks.length > 5 ? `\n\n_... et ${subjectHomeworks.length - 5} autre(s)_` : '';

                embed.addFields({
                    name: `📖 ${subject}`,
                    value: hwList + remaining,
                    inline: false,
                });

                fieldCount++;
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Erreur lors de la récupération des devoirs:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la récupération des devoirs.',
            });
        }
    },
};
