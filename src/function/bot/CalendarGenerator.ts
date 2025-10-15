import { createCanvas, GlobalFonts, SKRSContext2D } from '@napi-rs/canvas';
import { Homework } from '../../services/homeworkMariaDb';

// Couleurs pour différentes matières (palette harmonieuse)
const SUBJECT_COLORS: { [key: string]: string } = {
    'mathématiques': '#FF6B6B',
    'maths': '#FF6B6B',
    'français': '#4ECDC4',
    'anglais': '#45B7D1',
    'physique': '#FFA07A',
    'chimie': '#98D8C8',
    'histoire': '#F7DC6F',
    'géographie': '#BB8FCE',
    'svt': '#82E0AA',
    'informatique': '#5DADE2',
    'sport': '#F8B739',
    'philosophie': '#E59866',
};

const DEFAULT_COLOR = '#95A5A6';

/**
 * Obtenir une couleur pour une matière donnée
 */
function getSubjectColor(subject: string): string {
    const normalizedSubject = subject.toLowerCase().trim();
    return SUBJECT_COLORS[normalizedSubject] || DEFAULT_COLOR;
}

/**
 * Obtenir le nombre de jours dans un mois
 */
function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Obtenir le premier jour de la semaine du mois (0 = Dimanche, 1 = Lundi, etc.)
 */
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

/**
 * Nom des mois en français
 */
const MONTH_NAMES = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Jours de la semaine en français
 */
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

/**
 * Obtenir le numéro de semaine dans l'année
 */
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Obtenir le lundi de la semaine d'une date donnée
 */
function getMondayOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajuster si dimanche
    return new Date(d.setDate(diff));
}

/**
 * Formater une date en français
 */
function formatDate(date: Date): string {
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    return `${day} ${month}`;
}

// Détecter si une date contient une heure explicite à afficher
function hasExplicitTime(date: Date): boolean {
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    // Considérer comme "pas d'heure" si 00:00:00 ou si 23:59(:59) (convention pour journée entière)
    if (h === 0 && m === 0 && s === 0) return false;
    if (h === 23 && m >= 59) return false;
    return true;
}

/**
 * Générer une image de calendrier hebdomadaire avec les devoirs
 */
export async function generateWeekCalendarImage(
    weekStartDate: Date,
    homeworks: Homework[],
    options?: { weekdaysOnly?: boolean }
): Promise<Buffer> {
    // Dimensions du canvas
    const width = 1400;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fond
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, width, height);

    const weekNum = getWeekNumber(weekStartDate);
    const monday = getMondayOfWeek(weekStartDate);
    // Normaliser l'heure du lundi à minuit pour comparaison fiable
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // En-tête avec titre (adapter la borne de fin si on affiche seulement les jours ouvrés)
    const displayEnd = new Date(monday);
    displayEnd.setDate(monday.getDate() + (options?.weekdaysOnly ? 4 : 6));

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Semaine ${weekNum} - Du ${formatDate(monday)} au ${formatDate(displayEnd)}`, width / 2, 50);

    // Grille du calendrier
    const padding = 40;
    const headerHeight = 80;
    const calendarWidth = width - padding * 2;
    const calendarHeight = height - headerHeight - 100;

    const weekdaysOnly = options?.weekdaysOnly === true;
    // Organiser les devoirs par jour de la semaine
    const daysCount = weekdaysOnly ? 5 : 7;
    const cellWidth = calendarWidth / daysCount;
    const cellHeight = calendarHeight;

    const startX = padding;
    const startY = headerHeight;
    const homeworksByDay: { [day: number]: Homework[] } = {};
    for (let i = 0; i < daysCount; i++) {
        homeworksByDay[i] = [];
    }

    homeworks.forEach(hw => {
        const hwDate = new Date(hw.dueDate);
        const dayOfWeek = hwDate.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lun=0, Dim=6

    // Vérifier que le devoir est dans cette semaine
        const hwMonday = getMondayOfWeek(hwDate);
        // Normaliser aussi le lundi du devoir à minuit
        hwMonday.setHours(0, 0, 0, 0);
        const included = hwMonday.getTime() === monday.getTime();

        // debug logs removed

        if (included) {
            // si on affiche seulement les jours ouvrés, ignorer samedi/dimanche
            if (weekdaysOnly && adjustedDay >= 5) {
                // skip
            } else {
                // si weekdaysOnly=false, adjustedDay est 0..6 et homeworksByDay a des clés 0..6
                // si weekdaysOnly=true, homeworksByDay keys sont 0..4 (Mon-Fri)
                const targetIndex = weekdaysOnly ? adjustedDay : adjustedDay;
                // Only push if targetIndex exists in homeworksByDay
                if (homeworksByDay[targetIndex]) {
                    homeworksByDay[targetIndex].push(hw);
                }
            }
        }
    });

    // Dessiner chaque jour de la semaine
    const dayNamesFullAll = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const dayNamesFull = weekdaysOnly ? dayNamesFullAll.slice(0,5) : dayNamesFullAll;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysCount; i++) {
        const x = startX + i * cellWidth;
        const y = startY;

        const currentDate = new Date(monday);
        currentDate.setDate(monday.getDate() + i);
        const isToday = currentDate.getTime() === today.getTime();

        // Bordure de la cellule (plus épaisse si aujourd'hui)
        ctx.strokeStyle = isToday ? '#FFD700' : '#333333';
        ctx.lineWidth = isToday ? 4 : 1;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // Fond légèrement différent pour aujourd'hui
        if (isToday) {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
            ctx.fillRect(x, y, cellWidth, cellHeight);
        }

        // Nom du jour
        ctx.fillStyle = isToday ? '#FFD700' : '#FFFFFF';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(dayNamesFull[i], x + cellWidth / 2, y + 30);

        // Date
        ctx.fillStyle = '#AAAAAA';
        ctx.font = '18px Arial';
        ctx.fillText(currentDate.getDate().toString(), x + cellWidth / 2, y + 55);

        // Afficher les devoirs de ce jour
        // Trier pour afficher d'abord les devoirs sans heure définie (y compris 23:59), puis ceux avec heure.
    const dayHomeworks = (homeworksByDay[i] || []).slice().sort((a, b) => {
            const aDate = new Date(a.dueDate);
            const bDate = new Date(b.dueDate);
            const aHasTime = hasExplicitTime(aDate);
            const bHasTime = hasExplicitTime(bDate);

            if (aHasTime !== bHasTime) {
                // si a n'a pas d'heure, on veut qu'il soit avant => aHasTime false => return -1
                return aHasTime ? 1 : -1;
            }

            // si les deux ont (ou n'ont pas) d'heure, trier par date croissante
            return aDate.getTime() - bDate.getTime();
        });
        
        let hwY = y + 80;
        const maxHomeworksToShow = 12; // Plus de devoirs visibles en vue semaine

        for (let j = 0; j < Math.min(dayHomeworks.length, maxHomeworksToShow); j++) {
            const hw = dayHomeworks[j];
            const color = getSubjectColor(hw.subject);

            // Rectangle coloré pour le devoir
            ctx.fillStyle = color;
            const rectHeight = 60;
            ctx.fillRect(x + 8, hwY, cellWidth - 16, rectHeight);

            // Contour noir
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 8, hwY, cellWidth - 16, rectHeight);

            // Heures (si présentes) — supporte start et end
            const hwStart = new Date(hw.dueDate);
            const hwEnd = hw.endDate ? new Date((hw as any).endDate) : null;
            const showStart = hasExplicitTime(hwStart);
            const showEnd = hwEnd ? hasExplicitTime(hwEnd) : false;

            let timeStr = '';
            if (showStart && showEnd) {
                timeStr = `${hwStart.getHours().toString().padStart(2, '0')}:${hwStart.getMinutes().toString().padStart(2, '0')} - ${hwEnd!.getHours().toString().padStart(2, '0')}:${hwEnd!.getMinutes().toString().padStart(2, '0')}`;
            } else if (showStart) {
                timeStr = `${hwStart.getHours().toString().padStart(2, '0')}:${hwStart.getMinutes().toString().padStart(2, '0')}`;
            } else if (showEnd) {
                timeStr = `${hwEnd!.getHours().toString().padStart(2, '0')}:${hwEnd!.getMinutes().toString().padStart(2, '0')}`;
            }

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'left';
            if (timeStr) {
                ctx.fillText(timeStr, x + 12, hwY + 14);
            }

            // Matière
            ctx.font = 'bold 12px Arial';
            const maxTextWidth = cellWidth - 24;
            let subjectText = hw.subject;
            let textWidth = ctx.measureText(subjectText).width;
            
            while (textWidth > maxTextWidth && subjectText.length > 3) {
                subjectText = subjectText.slice(0, -1);
                textWidth = ctx.measureText(subjectText + '...').width;
            }
            if (subjectText !== hw.subject) {
                subjectText += '...';
            }

            // Déplacer le sujet légèrement plus bas si on a une ligne de temps
            ctx.fillText(subjectText, x + 12, hwY + (timeStr ? 28 : 18));

            // Titre du devoir
            ctx.font = '11px Arial';
            let titleText = hw.title;
            textWidth = ctx.measureText(titleText).width;
            
            while (textWidth > maxTextWidth && titleText.length > 3) {
                titleText = titleText.slice(0, -1);
                textWidth = ctx.measureText(titleText + '...').width;
            }
            if (titleText !== hw.title) {
                titleText += '...';
            }

            ctx.fillText(titleText, x + 12, hwY + (timeStr ? 43 : 36));

            // Icône si terminé
            if (hw.completed) {
                ctx.fillStyle = '#00FF00';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'right';
                ctx.fillText('✓', x + cellWidth - 12, hwY + 18);
            }

            hwY += rectHeight + 8;
        }

        // Indicateur s'il y a plus de devoirs
        if (dayHomeworks.length > maxHomeworksToShow) {
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`+${dayHomeworks.length - maxHomeworksToShow}`, x + cellWidth / 2, hwY + 10);
        }

        // Message si aucun devoir
        if (dayHomeworks.length === 0) {
            ctx.fillStyle = '#666666';
            ctx.font = 'italic 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Pas de devoir', x + cellWidth / 2, y + calendarHeight / 2);
        }
    }

    // Légende en bas
    const legendY = height - 40;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Légende:', padding, legendY);

    // Récupérer toutes les matières uniques
    const uniqueSubjects = [...new Set(homeworks.map(hw => hw.subject))];
    let legendX = padding + 80;

    uniqueSubjects.slice(0, 10).forEach(subject => {
        const color = getSubjectColor(subject);
        
        // Rectangle de couleur
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY - 12, 15, 15);
        
        // Nom de la matière
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(subject, legendX + 20, legendY);
        
        legendX += ctx.measureText(subject).width + 50;
    });

    return canvas.toBuffer('image/png');
}

/**
 * Générer une image de calendrier mensuel avec les devoirs
 */
export async function generateCalendarImage(
    year: number,
    month: number,
    homeworks: Homework[]
): Promise<Buffer> {
    // Dimensions du canvas
    const width = 1400;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fond
    ctx.fillStyle = '#1E1E1E';
    ctx.fillRect(0, 0, width, height);

    // En-tête avec titre
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${MONTH_NAMES[month]} ${year}`, width / 2, 60);

    // Grille du calendrier
    const padding = 40;
    const calendarWidth = width - padding * 2;
    const calendarHeight = height - 150;
    const cellWidth = calendarWidth / 7;
    const cellHeight = calendarHeight / 6;

    const startX = padding;
    const startY = 100;

    // Dessiner les noms des jours
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#AAAAAA';
    for (let i = 0; i < 7; i++) {
        const x = startX + i * cellWidth + cellWidth / 2;
        const y = startY + 30;
        ctx.fillText(DAY_NAMES[i], x, y);
    }

    // Organiser les devoirs par jour
    const homeworksByDay: { [day: number]: Homework[] } = {};
    homeworks.forEach(hw => {
        const day = hw.dueDate.getDate();
        if (!homeworksByDay[day]) {
            homeworksByDay[day] = [];
        }
        homeworksByDay[day].push(hw);
    });

    // Dessiner la grille
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    let currentDay = 1;

    for (let week = 0; week < 6; week++) {
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            const x = startX + dayOfWeek * cellWidth;
            const y = startY + 50 + week * cellHeight;

            // Bordure de la cellule
            ctx.strokeStyle = '#333333';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, cellWidth, cellHeight);

            // Vérifier si on doit afficher un jour
            if ((week === 0 && dayOfWeek >= firstDay) || (week > 0 && currentDay <= daysInMonth)) {
                // Date du jour
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(currentDay.toString(), x + 10, y + 30);

                // Afficher les devoirs de ce jour
                const dayHomeworks = homeworksByDay[currentDay] || [];
                let hwY = y + 55;
                const maxHomeworksToShow = 3; // Limiter le nombre de devoirs affichés

                for (let i = 0; i < Math.min(dayHomeworks.length, maxHomeworksToShow); i++) {
                    const hw = dayHomeworks[i];
                    const color = getSubjectColor(hw.subject);

                    // Rectangle coloré pour le devoir
                    ctx.fillStyle = color;
                    ctx.fillRect(x + 5, hwY, cellWidth - 10, 25);

                    // Texte du devoir (tronqué si trop long)
                    ctx.fillStyle = '#000000';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'left';
                    const maxTextWidth = cellWidth - 20;
                    let text = hw.title;
                    let textWidth = ctx.measureText(text).width;
                    
                    while (textWidth > maxTextWidth && text.length > 3) {
                        text = text.slice(0, -1);
                        textWidth = ctx.measureText(text + '...').width;
                    }
                    if (text !== hw.title) {
                        text += '...';
                    }

                    ctx.fillText(text, x + 10, hwY + 17);
                    hwY += 30;
                }

                // Indicateur s'il y a plus de devoirs
                if (dayHomeworks.length > maxHomeworksToShow) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '12px Arial';
                    ctx.fillText(`+${dayHomeworks.length - maxHomeworksToShow} autre(s)`, x + 10, hwY);
                }

                currentDay++;
            }
        }

        if (currentDay > daysInMonth) break;
    }

    // Légende des matières en bas
    const legendY = height - 50;
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('Légende:', padding, legendY);

    // Récupérer toutes les matières uniques
    const uniqueSubjects = [...new Set(homeworks.map(hw => hw.subject))];
    let legendX = padding + 80;

    uniqueSubjects.slice(0, 8).forEach(subject => { // Limiter à 8 matières
        const color = getSubjectColor(subject);
        
        // Rectangle de couleur
        ctx.fillStyle = color;
        ctx.fillRect(legendX, legendY - 12, 15, 15);
        
        // Nom de la matière
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(subject, legendX + 20, legendY);
        
        legendX += ctx.measureText(subject).width + 50;
    });

    // Retourner le buffer de l'image
    return canvas.toBuffer('image/png');
}
