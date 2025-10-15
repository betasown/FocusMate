import Homework, { IHomework } from '../schema/bot/homework';

export class HomeworkService {
    /**
     * Créer un nouveau devoir
     */
    static async createHomework(data: {
        title: string;
        subject: string;
        dueDate: Date;
        description?: string;
        createdBy: string;
        createdByName: string;
        guildId: string;
    }): Promise<IHomework> {
        const homework = new Homework(data);
        return await homework.save();
    }

    /**
     * Récupérer tous les devoirs d'un serveur
     */
    static async getHomeworksByGuild(
        guildId: string,
        includeCompleted: boolean = false
    ): Promise<IHomework[]> {
        const query: any = { guildId };
        if (!includeCompleted) {
            query.completed = false;
        }
        return await Homework.find(query).sort({ dueDate: 1 });
    }

    /**
     * Récupérer les devoirs d'un mois spécifique
     */
    static async getHomeworksByMonth(
        guildId: string,
        year: number,
        month: number,
        includeCompleted: boolean = false
    ): Promise<IHomework[]> {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const query: any = {
            guildId,
            dueDate: {
                $gte: startDate,
                $lte: endDate,
            },
        };

        if (!includeCompleted) {
            query.completed = false;
        }

        return await Homework.find(query).sort({ dueDate: 1 });
    }

    /**
     * Récupérer un devoir par son ID
     */
    static async getHomeworkById(homeworkId: string): Promise<IHomework | null> {
        return await Homework.findById(homeworkId);
    }

    /**
     * Mettre à jour un devoir
     */
    static async updateHomework(
        homeworkId: string,
        updates: Partial<IHomework>
    ): Promise<IHomework | null> {
        return await Homework.findByIdAndUpdate(homeworkId, updates, { new: true });
    }

    /**
     * Marquer un devoir comme terminé
     */
    static async markAsCompleted(homeworkId: string): Promise<IHomework | null> {
        return await Homework.findByIdAndUpdate(
            homeworkId,
            { completed: true },
            { new: true }
        );
    }

    /**
     * Supprimer un devoir
     */
    static async deleteHomework(homeworkId: string): Promise<boolean> {
        const result = await Homework.findByIdAndDelete(homeworkId);
        return result !== null;
    }

    /**
     * Récupérer les devoirs à venir (dans les N prochains jours)
     */
    static async getUpcomingHomeworks(
        guildId: string,
        days: number = 7
    ): Promise<IHomework[]> {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);

        return await Homework.find({
            guildId,
            completed: false,
            dueDate: {
                $gte: now,
                $lte: futureDate,
            },
        }).sort({ dueDate: 1 });
    }

    /**
     * Récupérer les devoirs en retard
     */
    static async getOverdueHomeworks(guildId: string): Promise<IHomework[]> {
        const now = new Date();
        return await Homework.find({
            guildId,
            completed: false,
            dueDate: {
                $lt: now,
            },
        }).sort({ dueDate: 1 });
    }
}
