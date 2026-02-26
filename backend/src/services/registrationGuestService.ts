import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';
import { createError } from '../middleware/errorHandler.js';

export interface RegistrationGuest {
  id: number;
  registrationId: string;
  name: string;
  sortOrder: number;
}

interface GuestRow extends RowDataPacket {
  id: number;
  registration_id: string;
  name: string;
  sort_order: number;
}

function rowToGuest(r: GuestRow): RegistrationGuest {
  return {
    id: r.id,
    registrationId: r.registration_id,
    name: r.name ?? '',
    sortOrder: r.sort_order ?? 0,
  };
}

export const getGuestsByRegistrationId = async (
  registrationId: string
): Promise<RegistrationGuest[]> => {
  const [rows] = await pool.execute<GuestRow[]>(
    'SELECT * FROM registration_guests WHERE registration_id = ? ORDER BY sort_order ASC, id ASC',
    [registrationId]
  );
  return rows.map(rowToGuest);
};

export const createGuest = async (
  registrationId: string,
  name: string,
  sortOrder = 0
): Promise<RegistrationGuest> => {
  const [result] = await pool.execute(
    'INSERT INTO registration_guests (registration_id, name, sort_order) VALUES (?, ?, ?)',
    [registrationId, name.trim(), sortOrder]
  );
  const insertId = Number((result as { insertId?: number })?.insertId);
  const [rows] = await pool.execute<GuestRow[]>(
    'SELECT * FROM registration_guests WHERE id = ?',
    [insertId]
  );
  if (!rows.length) throw createError('Failed to create guest', 500);
  return rowToGuest(rows[0]);
};

export const updateGuest = async (
  id: number,
  registrationId: string,
  name: string
): Promise<RegistrationGuest | null> => {
  const [result] = await pool.execute(
    'UPDATE registration_guests SET name = ? WHERE id = ? AND registration_id = ?',
    [name.trim(), id, registrationId]
  );
  if (Number((result as { affectedRows?: number })?.affectedRows) === 0) return null;
  const [rows] = await pool.execute<GuestRow[]>(
    'SELECT * FROM registration_guests WHERE id = ?',
    [id]
  );
  return rows.length ? rowToGuest(rows[0]) : null;
};

export const deleteGuest = async (
  id: number,
  registrationId: string
): Promise<boolean> => {
  const [result] = await pool.execute(
    'DELETE FROM registration_guests WHERE id = ? AND registration_id = ?',
    [id, registrationId]
  );
  return Number((result as { affectedRows?: number })?.affectedRows) > 0;
};

export const updateGuestsBulk = async (
  registrationId: string,
  userId: string,
  guests: { id?: number; name: string }[]
): Promise<RegistrationGuest[]> => {
  const [regRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM registrations WHERE id = ? AND user_id = ?',
    [registrationId, userId]
  );
  if (regRows.length === 0) {
    throw createError('Registration not found or unauthorized', 404);
  }

  const existing = await getGuestsByRegistrationId(registrationId);
  const keepIds = new Set<number>();

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    const name = g.name?.trim();
    if (!name) continue;

    if (g.id != null && existing.some((e) => e.id === g.id)) {
      await updateGuest(g.id, registrationId, name);
      keepIds.add(g.id);
    } else {
      const created = await createGuest(registrationId, name, i);
      keepIds.add(created.id);
    }
  }

  for (const e of existing) {
    if (!keepIds.has(e.id)) {
      await deleteGuest(e.id, registrationId);
    }
  }

  return getGuestsByRegistrationId(registrationId);
};

/** Admin: update guests without user ownership check. */
export const updateGuestsBulkAdmin = async (
  registrationId: string,
  guests: { id?: number; name: string }[]
): Promise<RegistrationGuest[]> => {
  const [regRows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM registrations WHERE id = ?',
    [registrationId]
  );
  if (regRows.length === 0) {
    throw createError('Registration not found', 404);
  }

  const existing = await getGuestsByRegistrationId(registrationId);
  const keepIds = new Set<number>();

  for (let i = 0; i < guests.length; i++) {
    const g = guests[i];
    const name = g.name?.trim();
    if (!name) continue;

    if (g.id != null && existing.some((e) => e.id === g.id)) {
      await updateGuest(g.id, registrationId, name);
      keepIds.add(g.id);
    } else {
      const created = await createGuest(registrationId, name, i);
      keepIds.add(created.id);
    }
  }

  for (const e of existing) {
    if (!keepIds.has(e.id)) {
      await deleteGuest(e.id, registrationId);
    }
  }

  return getGuestsByRegistrationId(registrationId);
};
