import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

export interface Court {
  id: number;
  playSlotId: number;
  name: string;
  sortOrder: number;
}

interface CourtRow extends RowDataPacket {
  id: number;
  play_slot_id: number;
  name: string;
  sort_order: number;
}

function rowToCourt(r: CourtRow): Court {
  return {
    id: r.id,
    playSlotId: r.play_slot_id,
    name: r.name ?? '',
    sortOrder: r.sort_order ?? 0,
  };
}

export const getCourtsByPlaySlotId = async (playSlotId: number): Promise<Court[]> => {
  const [rows] = await pool.execute<CourtRow[]>(
    'SELECT * FROM courts WHERE play_slot_id = ? ORDER BY sort_order ASC, id ASC',
    [playSlotId]
  );
  return rows.map(rowToCourt);
};

export const getCourtsByEventId = async (eventId: number): Promise<Court[]> => {
  const { getEventById } = await import('./eventService.js');
  const event = await getEventById(eventId);
  if (!event) return [];

  const [slotRows] = await pool.execute<RowDataPacket[]>(
    `SELECT id FROM play_slots WHERE day_of_week = ? AND time = ? AND location = ? AND title = ? LIMIT 1`,
    [event.dayOfWeek, event.time, event.location, event.title]
  );
  if (!slotRows.length) return [];

  return getCourtsByPlaySlotId(slotRows[0].id);
};

export const createCourt = async (
  playSlotId: number,
  name: string,
  sortOrder = 0
): Promise<Court> => {
  const [result] = await pool.execute(
    'INSERT INTO courts (play_slot_id, name, sort_order) VALUES (?, ?, ?)',
    [playSlotId, name.trim(), sortOrder]
  );
  const insertId = Number((result as { insertId?: number })?.insertId);
  const [rows] = await pool.execute<CourtRow[]>('SELECT * FROM courts WHERE id = ?', [insertId]);
  if (!rows.length) throw createError('Failed to create court', 500);
  return rowToCourt(rows[0]);
};

export const updateCourt = async (
  id: number,
  updates: { name?: string; sortOrder?: number }
): Promise<Court | null> => {
  const [existing] = await pool.execute<CourtRow[]>('SELECT * FROM courts WHERE id = ?', [id]);
  if (!existing.length) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name.trim());
  }
  if (updates.sortOrder !== undefined) {
    fields.push('sort_order = ?');
    values.push(updates.sortOrder);
  }

  if (fields.length === 0) return rowToCourt(existing[0]);

  values.push(id);
  await pool.execute(`UPDATE courts SET ${fields.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.execute<CourtRow[]>('SELECT * FROM courts WHERE id = ?', [id]);
  return rows.length ? rowToCourt(rows[0]) : null;
};

export const deleteCourt = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM courts WHERE id = ?', [id]);
  return Number((result as { affectedRows?: number })?.affectedRows) > 0;
};
