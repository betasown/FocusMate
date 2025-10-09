import { getPool } from './db';

export type TaskState = 'A_FAIRE' | 'EN_COURS' | 'REALISE';

export function slugifyProject(name: string): string {
  // Normalize, remove diacritics, keep [a-z0-9_], collapse spaces/punct to '_', trim '_', max 40
  let s = name
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (s.length > 40) s = s.slice(0, 40).replace(/_+$/g, '');
  // Ensure only [a-z0-9_]
  s = s.replace(/[^a-z0-9_]/g, '');
  return s || 'projet';
}

export function projectTable(slug: string) {
  // Strictly ensure slug is safe for identifier use
  const safe = slug.replace(/[^a-z0-9_]/g, '');
  if (!safe) throw new Error('Invalid project slug');
  return `tasks_${safe}`;
}

export async function ensureProjectTable(slug: string) {
  const table = projectTable(slug);
  const pool = getPool();
  const sql = `CREATE TABLE IF NOT EXISTS \`${table}\` (
    \`id\` BIGINT NOT NULL AUTO_INCREMENT,
    \`title\` TEXT NOT NULL,
    \`state\` ENUM('A_FAIRE','EN_COURS','REALISE') NOT NULL DEFAULT 'A_FAIRE',
    \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await pool.query(sql);
  return table;
}

export async function addTask(slug: string, title: string) {
  const table = projectTable(slug);
  const pool = getPool();
  const [res] = await pool.query(`INSERT INTO \`${table}\` (title) VALUES (?)`, [title]);
  // @ts-ignore - mysql2 type for OkPacket
  return res.insertId as number;
}

export async function listTasks(slug: string) {
  const table = projectTable(slug);
  const pool = getPool();
  const [rows] = await pool.query(`SELECT id, title, state, created_at FROM \`${table}\` ORDER BY id DESC`);
  return rows as Array<{ id: number; title: string; state: TaskState; created_at: Date }>;
}

export async function updateTaskState(slug: string, id: number, state: TaskState) {
  const table = projectTable(slug);
  const pool = getPool();
  await pool.query(`UPDATE \`${table}\` SET state = ? WHERE id = ?`, [state, id]);
}

export async function deleteTask(slug: string, id: number) {
  const table = projectTable(slug);
  const pool = getPool();
  await pool.query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
}

/**
 * Format a list of tasks into a human-readable markdown string for an embed description.
 * Groups tasks by state and includes their id.
 */
export function formatTasks(tasks: Array<{ id: number; title: string; state: TaskState }>): string {
  if (!tasks.length) return 'Aucune tâche pour le moment. Utilisez les boutons ci-dessous.';

  const sections: Record<TaskState, string[]> = {
    A_FAIRE: [],
    EN_COURS: [],
    REALISE: [],
  };

  for (const t of tasks) {
    const line = `• #${t.id} — ${t.title}`;
    sections[t.state].push(line);
  }

  const mk = (label: string, arr: string[]) => (arr.length ? `\n${label} (${arr.length})\n${arr.join('\n')}` : '');

  const aFaire = mk('📝 A_FAIRE', sections.A_FAIRE);
  const enCours = mk('⏳ EN_COURS', sections.EN_COURS);
  const realise = mk('✅ REALISE', sections.REALISE);

  const out = `${aFaire}${enCours}${realise}`.trim();
  return out || 'Aucune tâche pour le moment. Utilisez les boutons ci-dessous.';
}
