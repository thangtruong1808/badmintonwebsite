import 'dotenv/config';
import mysql from 'mysql2/promise';

// Use UTC for token expiry consistency across dev/prod and users in different timezones.
// Supports: +00:00, -05:00 (offset), or Z/utc (UTC). Named zones (e.g. Australia/Melbourne) are not reliable in mysql2.
function getConnectionTimezone(): string {
  const tz = process.env.DB_TIMEZONE?.trim();
  if (!tz) return 'Z';
  if (/^[+-]\d{2}:\d{2}$/.test(tz)) return tz;
  if (/^(Z|utc|UTC)$/i.test(tz)) return 'Z';
  // Named zones may be ignored by mysql2; default to UTC for consistent refresh_tokens expires_at
  return 'Z';
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'chibibadminton_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: getConnectionTimezone(),
});

export async function testConnection(): Promise<{ ok: boolean; message?: string }> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message };
  }
}

export default pool;
