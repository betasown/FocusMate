import { SlashCommandBuilder, EmbedBuilder, type ChatInputCommandInteraction, type APIEmbedField } from 'discord.js';
import ical, { type ReturnObject } from 'node-ical';

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
        await interaction.deferReply();

        // Date par défaut: aujourd'hui; peut être overridée par l'option
        let date = new Date();
        const dateOption = interaction.options.getString('date');
        if (dateOption) {
            const parsed = Date.parse(dateOption);
            if (!isNaN(parsed)) date = new Date(parsed);
        }

        const embed = await getEdtEmbed(date);
        if (!embed) {
            return interaction.editReply({ content: `Aucun évènement trouvé pour le ${date.toLocaleDateString('fr-FR')} !` });
        }
        return interaction.editReply({ embeds: [embed] });
    },
};

export async function getEdtEmbed(date: Date): Promise<EmbedBuilder | null> {
    // Télécharger le calendrier et le parser
    const calendarUrl = 'https://outlook.office365.com/owa/calendar/29140af7ee51428eac1e181824f9b023@cesi.fr/dc5dc8265ae4484e892dec582582180116350832411436285999/calendar.ics';
    let webEvents: ReturnObject | undefined;
    try {
        webEvents = await ical.async.fromURL(calendarUrl);
    } catch (e) {
        webEvents = undefined;
    }
    if (!webEvents) return null;

    // Récupérer les évènements du jour demandé
    let events = (Object.values(webEvents) as any[]).filter((event: any) => {
        if (!event?.start) return false;
        const eventDate = new Date(event.start);
        return datesAreOnSameDay(eventDate, date);
    }) as EventLike[];

    if (!events.length) return null;

    // Trier les évènements par date de début
    events = events.sort((a, b) => +new Date(a.start) - +new Date(b.start));

    // Générer des parties de l'embed avec chaque évènement
    const fields: APIEmbedField[] = [];
    events.forEach(event => {
        const locationPart = event.location ? ` | Salle ${event.location}` : '';
        fields.push({
            name: event.summary,
            value: `De ${new Date(event.start).toLocaleTimeString('fr-FR', dateOptions)} à ${new Date(event.end).toLocaleTimeString('fr-FR', dateOptions)} ${dateDiff(new Date(event.start), new Date(event.end))}${locationPart}`,
        });
    });

    // Créer l'embed
    const embed = new EmbedBuilder()
        .setTitle(`Évènements du ${date.toLocaleDateString('fr-FR')}`)
        .setColor('#ffffff')
        .setTimestamp()
        .addFields(fields);
    return embed;
}