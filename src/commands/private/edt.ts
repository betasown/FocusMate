import { SlashCommandBuilder, AttachmentBuilder, type ChatInputCommandInteraction } from 'discord.js';
import ical, { type ReturnObject } from 'node-ical';
import type { Homework } from '../../services/homeworkMariaDb';

type EventLike = {
    start: Date;
    end: Date;
    summary: string;
    location?: string;
};

const datesAreOnSameDay = (first: Date, second: Date): boolean =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const dateOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric' };

const dateDiff = (before: Date, after: Date): string => {
    const diff = +after - +before;
    const diffH = Math.floor(diff / 3600000);
    const diffM = Math.floor((diff % 3600000) / 60000);

    const strH = diffH > 1 ? 'heures' : 'heure';
    const strM = diffM > 1 ? 'minutes' : 'minute';

    if (diffH && diffM) return `(${diffH} ${strH}, ${diffM} ${strM})`;
    else if (diffH) return `(${diffH} ${strH})`;
    else if (diffM) return `(${diffM} ${strM})`;
    else return '';
};

export const command = {
    data: new SlashCommandBuilder()
        .setName('edt')
        .setDescription('Affiche les évènements du jour depuis le calendrier sur Teams')
        .addStringOption(option => option.setName('date').setDescription('format requis : aaaa-mm-jj')),

    async execute(interaction: ChatInputCommandInteraction) {
        // Defer la réponse pour éviter l'expiration
        await interaction.deferReply();

        // Créer une date à aujourd'hui et prendre celle demandée si c'est le cas
        let date = new Date();
        const dateOption = interaction.options.getString('date');
        if (dateOption) {
            const parsed = Date.parse(dateOption);
            if (!isNaN(parsed)) {
                date = new Date(parsed);
            }
        }

        // Télécharger le calendrier et le parser
        const calendarUrl = 'https://outlook.office365.com/owa/calendar/29140af7ee51428eac1e181824f9b023@cesi.fr/dc5dc8265ae4484e892dec582582180116350832411436285999/calendar.ics';
    let webEvents: ReturnObject | undefined;
        try {
            webEvents = await ical.async.fromURL(calendarUrl);
        } catch (e) {
            webEvents = undefined;
        }

        if (!webEvents) {
            return interaction.editReply({ content: 'Impossible de récupérer les évènements !' });
        }

        // Récupérer les évènements de la semaine contenant la date demandée (lundi..dimanche)
        const getMonday = (d: Date) => {
            const dd = new Date(d);
            const day = dd.getDay();
            const diff = dd.getDate() - day + (day === 0 ? -6 : 1);
            dd.setDate(diff);
            dd.setHours(0,0,0,0);
            return dd;
        };

        const monday = getMonday(date);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23,59,59,999);

        let events = (Object.values(webEvents) as any[]).filter((event: any) => {
            if (!event?.start) return false;
            const evStart = new Date(event.start);
            const evEnd = event.end ? new Date(event.end) : evStart;
            // inclure si l'événement intersecte la période [monday, sunday]
            return evEnd >= monday && evStart <= sunday;
        }) as EventLike[];

        if (!events.length) {
            return interaction.editReply({ content: `Aucun évènement trouvé pour la semaine du ${monday.toLocaleDateString('fr-FR')} !` });
        }

        // Trier les évènements par date de début
        events = events.sort((a, b) => +new Date(a.start) - +new Date(b.start));

        // Mapper les évènements iCal vers un format compatible pour le générateur d'image
        const mapped: Homework[] = events.map((ev, idx) => ({
            id: idx,
            title: ev.summary || 'Évènement',
            subject: ev.location || 'Évènement',
            dueDate: new Date(ev.start),
            endDate: ev.end ? new Date(ev.end) : undefined,
            description: ev.location || undefined,
            createdBy: 'calendar',
            createdByName: 'calendar',
            guildId: interaction.guildId || '',
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        try {
            // Import dynamique du générateur d'images
            const { generateWeekCalendarImage } = await import('../../function/bot/CalendarGenerator');

            // On génère l'image de la semaine (on passe le lundi pour être explicite)
            const imageBuffer = await generateWeekCalendarImage(monday, mapped, { weekdaysOnly: true });
            const attachment = new AttachmentBuilder(imageBuffer, { name: `edt-${date.toISOString().slice(0,10)}.png` });

            return interaction.editReply({ files: [attachment] });
        } catch (err) {
            console.error('Erreur lors de la génération de l\'image EDT:', err);
            return interaction.editReply({ content: '❌ Impossible de générer l\'image de l\'emploi du temps.' });
        }
    },
};