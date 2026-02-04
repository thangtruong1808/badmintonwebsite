import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

/**
 * Seed play_slots table with Wednesday and Friday sessions if empty.
 * Events are generated from play_slots via GET /api/events?from= &to= or GET /api/events/generate
 */
export async function seedPlaySlotsIfEmpty(): Promise<void> {
  try {
    const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM play_slots');
    const row = (rows as RowDataPacket[])[0];
    const count = Number(row?.count ?? 0);
    if (count > 0) return;

    await pool.execute(
      `INSERT INTO play_slots (day_of_week, time, location, title, description, price, max_capacity, is_active)
       VALUES
         ('Wednesday', '7:00 PM - 10:00 PM', 'Altona SportsPoint Badminton Club', 'Wednesday Playtime', 'Weekly Wednesday social play session. All skill levels welcome!', 20, 45, TRUE),
         ('Friday', '7:00 PM - 10:00 PM', 'Stomers Badminton Club', 'Friday Playtime', 'Weekly Friday social play session. Fun games and friendly matches!', 20, 45, TRUE)`
    );
    console.log('Seeded play_slots with Wednesday and Friday sessions');
  } catch (err) {
    console.warn('Could not seed play_slots (table may not exist yet):', err);
  }
}
