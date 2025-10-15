import { getPool } from './db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface Homework {
    id: number;
    title: string;
    subject: string;
    dueDate: Date;
    endDate?: Date;
    description?: string;
    createdBy: string;
    createdByName: string;
    guildId: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class HomeworkService {
    /**
     * Créer la table si elle n'existe pas
     */
    static async initTable(): Promise<void> {
        const pool = getPool();
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS homeworks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                subject VARCHAR(50) NOT NULL,
                due_date DATETIME NOT NULL,
                description TEXT,
                created_by VARCHAR(50) NOT NULL,
                created_by_name VARCHAR(100) NOT NULL,
                guild_id VARCHAR(50) NOT NULL,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_guild_due_date (guild_id, due_date),
                INDEX idx_guild_completed (guild_id, completed)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        try {
            await pool.execute(createTableSQL);
            console.log('✅  Homework table initialized');
        } catch (error) {
            console.error('Error creating homework table:', error);
            throw error;
        }
    }

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
    }): Promise<Homework> {
        const pool = getPool();
        const sql = `
            INSERT INTO homeworks (title, subject, due_date, description, created_by, created_by_name, guild_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.execute<ResultSetHeader>(sql, [
            data.title,
            data.subject,
            data.dueDate,
            data.description || null,
            data.createdBy,
            data.createdByName,
            data.guildId
        ]);

        return await this.getHomeworkById(result.insertId);
    }

    /**
     * Récupérer tous les devoirs d'un serveur
     */
    static async getHomeworksByGuild(
        guildId: string,
        includeCompleted: boolean = false
    ): Promise<Homework[]> {
        const pool = getPool();
        let sql = 'SELECT * FROM homeworks WHERE guild_id = ?';
        const params: any[] = [guildId];

        if (!includeCompleted) {
            sql += ' AND completed = FALSE';
        }

        sql += ' ORDER BY due_date ASC';

        const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
        return rows.map(this.mapRowToHomework);
    }

    /**
     * Récupérer les devoirs d'un mois spécifique
     */
    static async getHomeworksByMonth(
        guildId: string,
        year: number,
        month: number,
        includeCompleted: boolean = false
    ): Promise<Homework[]> {
        const pool = getPool();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

        let sql = `
            SELECT * FROM homeworks 
            WHERE guild_id = ? 
            AND due_date >= ? 
            AND due_date <= ?
        `;
        const params: any[] = [guildId, startDate, endDate];

        if (!includeCompleted) {
            sql += ' AND completed = FALSE';
        }

        sql += ' ORDER BY due_date ASC';

        const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
        return rows.map(this.mapRowToHomework);
    }

    /**
     * Récupérer un devoir par son ID
     */
    static async getHomeworkById(homeworkId: number): Promise<Homework> {
        const pool = getPool();
        const sql = 'SELECT * FROM homeworks WHERE id = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(sql, [homeworkId]);
        
        if (rows.length === 0) {
            throw new Error('Homework not found');
        }

        return this.mapRowToHomework(rows[0]);
    }

    /**
     * Mettre à jour un devoir
     */
    static async updateHomework(
        homeworkId: number,
        updates: Partial<Homework>
    ): Promise<Homework> {
        const pool = getPool();
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.title !== undefined) {
            fields.push('title = ?');
            values.push(updates.title);
        }
        if (updates.subject !== undefined) {
            fields.push('subject = ?');
            values.push(updates.subject);
        }
        if (updates.dueDate !== undefined) {
            fields.push('due_date = ?');
            values.push(updates.dueDate);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            values.push(updates.description);
        }
        if (updates.completed !== undefined) {
            fields.push('completed = ?');
            values.push(updates.completed);
        }

        if (fields.length === 0) {
            return this.getHomeworkById(homeworkId);
        }

        values.push(homeworkId);
        const sql = `UPDATE homeworks SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(sql, values);
        return this.getHomeworkById(homeworkId);
    }

    /**
     * Marquer un devoir comme terminé
     */
    static async markAsCompleted(homeworkId: number): Promise<Homework> {
        return this.updateHomework(homeworkId, { completed: true });
    }

    /**
     * Supprimer un devoir
     */
    static async deleteHomework(homeworkId: number): Promise<boolean> {
        const pool = getPool();
        const sql = 'DELETE FROM homeworks WHERE id = ?';
        const [result] = await pool.execute<ResultSetHeader>(sql, [homeworkId]);
        return result.affectedRows > 0;
    }

    /**
     * Récupérer les devoirs à venir (dans les N prochains jours)
     */
    static async getUpcomingHomeworks(
        guildId: string,
        days: number = 7
    ): Promise<Homework[]> {
        const pool = getPool();
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);

        const sql = `
            SELECT * FROM homeworks 
            WHERE guild_id = ? 
            AND completed = FALSE 
            AND due_date >= ? 
            AND due_date <= ?
            ORDER BY due_date ASC
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(sql, [guildId, now, futureDate]);
        return rows.map(this.mapRowToHomework);
    }

    /**
     * Récupérer les devoirs en retard
     */
    static async getOverdueHomeworks(guildId: string): Promise<Homework[]> {
        const pool = getPool();
        const now = new Date();

        const sql = `
            SELECT * FROM homeworks 
            WHERE guild_id = ? 
            AND completed = FALSE 
            AND due_date < ?
            ORDER BY due_date ASC
        `;

        const [rows] = await pool.execute<RowDataPacket[]>(sql, [guildId, now]);
        return rows.map(this.mapRowToHomework);
    }

    /**
     * Mapper une ligne de base de données vers un objet Homework
     */
    private static mapRowToHomework(row: RowDataPacket): Homework {
        return {
            id: row.id,
            title: row.title,
            subject: row.subject,
            dueDate: new Date(row.due_date),
            description: row.description,
            createdBy: row.created_by,
            createdByName: row.created_by_name,
            guildId: row.guild_id,
            completed: Boolean(row.completed),
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }
}
