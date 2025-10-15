import { SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { HomeworkService, Homework } from '../../services/homeworkMariaDb';

export const command = {
    data: new SlashCommandBuilder()
        .setName('agenda')
        .setDescription('📅 Afficher l\'agenda des devoirs sous forme de calendrier')
        .addStringOption(option =>
            option
                .setName('vue')
                .setDescription('Type de vue (semaine ou mois)')
                .setRequired(false)
                .addChoices(
                    { name: '📅 Semaine', value: 'semaine' },
                    { name: '📆 Mois', value: 'mois' }
                )
        )
        .addIntegerOption(option =>
            option
                .setName('decalage')
                .setDescription('Décalage (0=actuel, 1=prochain, -1=précédent)')
                .setRequired(false)
                .setMinValue(-10)
                .setMaxValue(10)
        )
        .addBooleanOption(option =>
            option
                .setName('completes')
                .setDescription('Inclure les devoirs terminés (par défaut: non)')
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        try {
            // Récupérer les options
            const viewType = interaction.options.getString('vue') || 'semaine';
            const offset = interaction.options.getInteger('decalage') || 0;
            const includeCompleted = interaction.options.getBoolean('completes') || false;

            // Vérifier que le serveur existe
            if (!interaction.guildId) {
                await interaction.editReply('❌ Cette commande ne peut être utilisée que dans un serveur.');
                return;
            }

            const now = new Date();
            let imageBuffer: Buffer;
            let message: string;
            let filename: string;
            let homeworks: Homework[];

            if (viewType === 'semaine') {
                // Vue hebdomadaire
                const targetDate = new Date(now);
                targetDate.setDate(targetDate.getDate() + (offset * 7));

                // Obtenir le lundi de la semaine
                const monday = new Date(targetDate);
                const day = monday.getDay();
                const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
                monday.setDate(diff);
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                // Récupérer tous les devoirs de la période
                const allHomeworks = await HomeworkService.getHomeworksByGuild(
                    interaction.guildId,
                    includeCompleted
                );

                console.log(`📊 [DEBUG] Total devoirs dans la base : ${allHomeworks.length}`);
                console.log(`📅 [DEBUG] Période recherchée : ${monday.toLocaleDateString('fr-FR')} au ${sunday.toLocaleDateString('fr-FR')}`);

                // Filtrer les devoirs de cette semaine
                homeworks = allHomeworks.filter(hw => {
                    const hwDate = new Date(hw.dueDate);
                    const isInWeek = hwDate >= monday && hwDate <= sunday;
                    
                    if (allHomeworks.length > 0) {
                        console.log(`🔍 [DEBUG] Devoir "${hw.title}" le ${hwDate.toLocaleDateString('fr-FR')} ${hwDate.toLocaleTimeString('fr-FR')} -> ${isInWeek ? '✓ INCLUS' : '✗ EXCLU'}`);
                    }
                    
                    return isInWeek;
                });

                console.log(`✅ [DEBUG] Devoirs filtrés pour cette semaine : ${homeworks.length}`);

                // Générer l'image
                // G\u00e9n\u00e9rer l'image (import dynamique pour retarder le chargement du module natif)
                const { generateWeekCalendarImage } = await import('../../function/bot/CalendarGenerator');
                imageBuffer = await generateWeekCalendarImage(monday, homeworks);

                // Obtenir le numéro de semaine
                const weekNum = getWeekNumber(monday);
                const monthNames = [
                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                ];

                message = `📅 **Semaine ${weekNum}** (${monday.getDate()} ${monthNames[monday.getMonth()]} - ${sunday.getDate()} ${monthNames[sunday.getMonth()]} ${sunday.getFullYear()})\n`;
                message += `📚 ${homeworks.length} devoir(s) cette semaine\n`;

                filename = `agenda-semaine-${weekNum}-${sunday.getFullYear()}.png`;

            } else {
                // Vue mensuelle
                const targetDate = new Date(now);
                targetDate.setMonth(targetDate.getMonth() + offset);

                const month = targetDate.getMonth();
                const year = targetDate.getFullYear();

                // Récupérer les devoirs du mois
                homeworks = await HomeworkService.getHomeworksByMonth(
                    interaction.guildId,
                    year,
                    month,
                    includeCompleted
                );

                // Générer l'image
                // G\u00e9n\u00e9rer l'image (import dynamique pour retarder le chargement du module natif)
                const { generateCalendarImage } = await import('../../function/bot/CalendarGenerator');
                imageBuffer = await generateCalendarImage(year, month, homeworks);

                const monthNames = [
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                ];

                message = `� **Agenda ${monthNames[month]} ${year}**\n`;
                message += `📚 ${homeworks.length} devoir(s) ce mois-ci\n`;

                filename = `agenda-${year}-${month + 1}.png`;
            }

            // Ajouter les statistiques
            if (homeworks.length === 0) {
                message += `\n✨ Aucun devoir prévu ! Profitez-en bien ! 🎉`;
            } else {
                // Compter les devoirs par matière
                const subjectCounts: { [key: string]: number } = {};
                homeworks.forEach(hw => {
                    subjectCounts[hw.subject] = (subjectCounts[hw.subject] || 0) + 1;
                });

                message += `\n**Répartition par matière:**\n`;
                Object.entries(subjectCounts)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([subject, count]) => {
                        message += `• ${subject}: ${count} devoir(s)\n`;
                    });
            }

            // Ajouter un conseil de navigation
            if (viewType === 'semaine') {
                message += `\n💡 *Utilisez \`/agenda vue:semaine decalage:1\` pour la semaine suivante*`;
            } else {
                message += `\n💡 *Utilisez \`/agenda vue:mois decalage:1\` pour le mois suivant*`;
            }

            // Créer l'attachment
            const attachment = new AttachmentBuilder(imageBuffer, { name: filename });

            await interaction.editReply({
                content: message,
                files: [attachment],
            });

        } catch (error) {
            console.error('Erreur lors de la génération de l\'agenda:', error);
            await interaction.editReply({
                content: '❌ Une erreur est survenue lors de la génération du calendrier.',
            });
        }
    },
};

// Fonction utilitaire pour obtenir le numéro de semaine
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
