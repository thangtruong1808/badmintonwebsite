import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'chibibadminton_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  // MySQL timezone: use offset only (e.g. +10:00). Named zones like Australia/Melbourne may be ignored.
  ...(process.env.DB_TIMEZONE?.match(/^[+-]\d{2}:\d{2}$/) && { timezone: process.env.DB_TIMEZONE }),
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
