import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';
import { updateEventsForPlaySlot, deleteEventsForPlaySlot } from './eventSlotSyncService.js';

export interface PlaySlot {
  id: number;
  dayOfWeek: string;
  time: string;
  location: string;
  title: string;
  description: string | null;
  price: number;
  maxCapacity: number;
  imageUrl?: string | null;
  isActive: boolean;
}

interface PlaySlotRow extends RowDataPacket {
  id: number;
  day_of_week: string;
  time: string;
  location: string;
  title: string;
  description: string | null;
  price: number;
  max_capacity: number;
  image_url?: string | null;
  is_active: boolean;
}

function rowToPlaySlot(row: PlaySlotRow): PlaySlot {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    time: row.time,
    location: row.location,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    maxCapacity: row.max_capacity,
    imageUrl: row.image_url ?? null,
    isActive: Boolean(row.is_active),
  };
}

export const getAllPlaySlots = async (activeOnly = false): Promise<PlaySlot[]> => {
  const query = activeOnly
    ? 'SELECT * FROM play_slots WHERE is_active = TRUE ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time'
    : 'SELECT * FROM play_slots ORDER BY FIELD(day_of_week, "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time';
  const [rows] = await pool.execute<PlaySlotRow[]>(query);
  return rows.map(rowToPlaySlot);
};

export const getPlaySlotById = async (id: number): Promise<PlaySlot | null> => {
  const [rows] = await pool.execute<PlaySlotRow[]>(
    'SELECT * FROM play_slots WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToPlaySlot(rows[0]);
};

export const createPlaySlot = async (data: Omit<PlaySlot, 'id'>): Promise<PlaySlot> => {
  const [result] = await pool.execute(
    `INSERT INTO play_slots (day_of_week, time, location, title, description, price, max_capacity, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.dayOfWeek,
      data.time,
      data.location,
      data.title,
      data.description ?? null,
      data.price,
      data.maxCapacity,
      data.imageUrl ?? null,
      data.isActive ? 1 : 0,
    ]
  );
  const inserted = await getPlaySlotById(Number((result as { insertId?: number })?.insertId));
  if (!inserted) throw new Error('Failed to fetch created play slot');
  return inserted;
};

export const updatePlaySlot = async (
  id: number,
  updates: Partial<Omit<PlaySlot, 'id'>>
): Promise<PlaySlot | null> => {
  const slot = await getPlaySlotById(id);
  if (!slot) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.dayOfWeek !== undefined) {
    fields.push('day_of_week = ?');
    values.push(updates.dayOfWeek);
  }
  if (updates.time !== undefined) {
    fields.push('time = ?');
    values.push(updates.time);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }
  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push('description = ?');
    values.push(updates.description);
  }
  if (updates.price !== undefined) {
    fields.push('price = ?');
    values.push(updates.price);
  }
  if (updates.maxCapacity !== undefined) {
    fields.push('max_capacity = ?');
    values.push(updates.maxCapacity);
  }
  if (updates.imageUrl !== undefined) {
    fields.push('image_url = ?');
    values.push(updates.imageUrl);
  }
  if (updates.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(updates.isActive ? 1 : 0);
  }

  if (fields.length === 0) return slot;

  values.push(id);
  await pool.execute(
    `UPDATE play_slots SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  const updatedSlot = await getPlaySlotById(id);
  if (updatedSlot) {
    await updateEventsForPlaySlot(
      { dayOfWeek: slot.dayOfWeek, time: slot.time, location: slot.location, title: slot.title },
      {
        dayOfWeek: updatedSlot.dayOfWeek,
        time: updatedSlot.time,
        location: updatedSlot.location,
        title: updatedSlot.title,
        description: updatedSlot.description,
        maxCapacity: updatedSlot.maxCapacity,
        price: updatedSlot.price,
        imageUrl: updatedSlot.imageUrl,
      }
    );
  }
  return updatedSlot;
};

export const deletePlaySlot = async (id: number): Promise<boolean> => {
  const slot = await getPlaySlotById(id);
  if (slot) {
    await deleteEventsForPlaySlot({
      dayOfWeek: slot.dayOfWeek,
      time: slot.time,
      location: slot.location,
      title: slot.title,
    });
  }
  const [result] = await pool.execute('DELETE FROM play_slots WHERE id = ?', [id]);
  return Number((result as { affectedRows?: number })?.affectedRows) > 0;
};
