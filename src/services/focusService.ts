import { getPool } from './db';

type FocusRecord = {
  userId: string;
  guildId: string;
  durationMinutes: number;
  startedAt: Date;
 };

// In-memory fallback when DB not configured
const memoryStore: Record<string, { totalMinutes: number; sessions: number }> = {};

export async function recordFocusSession(userId: string, guildId: string, durationMinutes: number) {
  const pool = (() => {
    try {
      return getPool();
    } catch (e) {
      return null;
    }
  })();

  if (!pool) {
    const key = `${guildId}:${userId}`;
    if (!memoryStore[key]) memoryStore[key] = { totalMinutes: 0, sessions: 0 };
    memoryStore[key].totalMinutes += durationMinutes;
    memoryStore[key].sessions += 1;
    return { ok: true, persisted: false };
  }

  try {
    const sql = `
      INSERT INTO focus_sessions (user_id, guild_id, duration_minutes, started_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE duration_minutes = duration_minutes + VALUES(duration_minutes)
    `;
    await pool.query(sql, [userId, guildId, durationMinutes]);
    return { ok: true, persisted: true };
  } catch (err) {
    console.error('Failed to record focus session:', err);
    return { ok: false, error: err };
  }
}

export async function getStatsFor(userId: string, guildId: string) {
  const pool = (() => {
    try {
      return getPool();
    } catch (e) {
      return null;
    }
  })();

  if (!pool) {
    const key = `${guildId}:${userId}`;
    return memoryStore[key] ?? { totalMinutes: 0, sessions: 0 };
  }

  // If DB is configured, try to query summary
  try {
    const [rows] = await pool.query(
      `SELECT SUM(duration_minutes) as totalMinutes, COUNT(*) as sessions FROM focus_sessions WHERE user_id = ? AND guild_id = ?`,
      [userId, guildId]
    );
    // rows typing from mysql2 is broad; cast to any and be defensive
    const arr: any = rows as any;
    const r = Array.isArray(arr) && arr[0] ? arr[0] : { totalMinutes: 0, sessions: 0 };
    return { totalMinutes: Number(r.totalMinutes || 0), sessions: Number(r.sessions || 0) };
  } catch (err) {
    console.error('Failed to get focus stats:', err);
    return { totalMinutes: 0, sessions: 0 };
  }
}

export async function getLeaderboardFor(guildId: string, limit = 10) {
  const pool = (() => {
    try {
      return getPool();
    } catch (e) {
      return null;
    }
  })();

  if (!pool) {
    // Build leaderboard from memoryStore
    const rows = Object.entries(memoryStore)
      .filter(([key]) => key.startsWith(`${guildId}:`))
      .map(([key, val]) => ({ userId: key.split(':')[1], totalMinutes: val.totalMinutes, sessions: val.sessions }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, limit);
    return rows;
  }

  try {
    const [rows] = await pool.query(
      `SELECT user_id as userId, SUM(duration_minutes) as totalMinutes, COUNT(*) as sessions FROM focus_sessions WHERE guild_id = ? GROUP BY user_id ORDER BY totalMinutes DESC LIMIT ?`,
      [guildId, Number(limit)]
    );
    const arr: any = rows as any;
    return (Array.isArray(arr) ? arr : []).map((r: any) => ({ userId: r.userId, totalMinutes: Number(r.totalMinutes || 0), sessions: Number(r.sessions || 0) }));
  } catch (err) {
    console.error('Failed to get leaderboard:', err);
    return [];
  }
}
