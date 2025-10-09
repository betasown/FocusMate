import mysql from 'mysql2/promise';

export type DBPool = mysql.Pool;

let pool: DBPool | null = null;

export function initDbFromEnv() {
  const host = process.env.MARIADB_HOST || 'localhost';
  const port = Number(process.env.MARIADB_PORT || '3306');
  const user = process.env.MARIADB_USER || '';
  const password = process.env.MARIADB_PASSWORD || '';
  const database = process.env.MARIADB_DATABASE || '';

  if (!user || !database) {
    console.warn('MARIADB_USER or MARIADB_DATABASE not set; skipping DB initialization.');
    return null;
  }

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

export async function testConnection(): Promise<boolean> {
  if (!pool) return false;
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (err) {
    console.error('DB connection test failed:', err);
    return false;
  }
}

export function getPool() {
  if (!pool) throw new Error('Database pool not initialized');
  return pool;
}
