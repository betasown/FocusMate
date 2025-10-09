import mysql from 'mysql2/promise';

export type DBPool = mysql.Pool;

let pool: DBPool | null = null;

function parseMysqlUrl(url: string) {
  try {
    const u = new URL(url);
    const [user, password] = (u.username || u.password)
      ? [decodeURIComponent(u.username), decodeURIComponent(u.password)]
      : ['', ''];
    return {
      host: u.hostname || 'localhost',
      port: Number(u.port || '3306'),
      user,
      password,
      database: (u.pathname || '/').replace(/^\//, ''),
    };
  } catch (e) {
    console.warn('Invalid MYSQL_URL, falling back to individual env vars');
    return null;
  }
}

export function initDbFromEnv() {
  // Prefer URL if provided (support MARIADB_URL and MYSQL_URL)
  const url = process.env.MARIADB_URL || process.env.MYSQL_URL;
  const cfgFromUrl = url ? parseMysqlUrl(url) : null;

  // Support MARIADB_* first, fall back to MYSQL_*
  const host =
    cfgFromUrl?.host ?? process.env.MARIADB_HOST ?? process.env.MYSQL_HOST ?? 'localhost';
  const port =
    cfgFromUrl?.port ?? Number(process.env.MARIADB_PORT || process.env.MYSQL_PORT || '3306');
  const user =
    cfgFromUrl?.user ?? process.env.MARIADB_USER ?? process.env.MYSQL_USER ?? '';
  const password =
    cfgFromUrl?.password ?? process.env.MARIADB_PASSWORD ?? process.env.MYSQL_PASSWORD ?? '';
  const database =
    cfgFromUrl?.database ?? process.env.MARIADB_DATABASE ?? process.env.MYSQL_DATABASE ?? '';

  if (!user || !database) {
    console.warn(
      'MariaDB/MySQL not configured. Set MARIADB_URL or MARIADB_HOST/PORT/USER/PASSWORD/DATABASE (or MYSQL_*)'
    );
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
