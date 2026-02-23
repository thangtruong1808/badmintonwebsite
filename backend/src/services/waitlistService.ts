import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import type { RegistrationFormData } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import { getEventById } from './eventService.js';
import { getUserById } from './userService.js';
import { sendFriendsPromotedEmail } from '../utils/email.js';
import pool from '../db/connection.js';

export interface WaitlistEntry {
  id: string;
  eventId: number;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  position: number;
  registrationId: string | null;
  guestCount: number;
  createdAt: string;
}

interface WaitlistRow extends RowDataPacket {
  id: string;
  event_id: number;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  position: number;
  registration_id: string | null;
  guest_count: number;
  created_at: Date | string;
}

function rowToWaitlistEntry(r: WaitlistRow): WaitlistEntry {
  return {
    id: r.id,
    eventId: r.event_id,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? null,
    position: r.position,
    registrationId: r.registration_id ?? null,
    guestCount: r.guest_count ?? 1,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  };
}

/**
 * Join the waitlist for a full event. User must not already be registered or on waitlist.
 */
export const joinWaitlist = async (
  userId: string,
  eventId: number,
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string; waitlistId?: string }> => {
  const user = await getUserById(userId);
  if (!user) throw createError('User not found', 404);

  const event = await getEventById(eventId);
  if (!event) throw createError('Event not found', 404);

  const [pendingRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ? AND status = ?',
    [eventId, 'pending_payment']
  );
  const pendingCount = Number(pendingRows[0]?.cnt ?? 0);
  const effectiveOccupancy = event.currentAttendees + pendingCount;
  if (effectiveOccupancy < event.maxCapacity) {
    throw createError('Event has spots available - register normally', 400);
  }

  const [existingReg] = await pool.execute<RowDataPacket[]>(
    'SELECT id, status FROM registrations WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );
  if (existingReg.length > 0) {
    const s = existingReg[0].status;
    if (s === 'confirmed') throw createError('Already registered for this session', 400);
    if (s === 'pending_payment') throw createError('You have a reserved spot - please complete payment', 400);
  }

  const [existingWl] = await pool.execute<WaitlistRow[]>(
    'SELECT id FROM event_waitlist WHERE user_id = ? AND event_id = ?',
    [userId, eventId]
  );
  if (existingWl.length > 0) {
    throw createError('Already on the waitlist for this session', 400);
  }

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM event_waitlist WHERE event_id = ?',
    [eventId]
  );
  const position = Number(countRows[0]?.cnt ?? 0) + 1;

  const id = uuidv4();
  await pool.execute(
    `INSERT INTO event_waitlist (id, event_id, user_id, name, email, phone, position, registration_id, guest_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 1)`,
    [id, eventId, userId, formData.name, formData.email, formData.phone ?? '', position]
  );

  return {
    success: true,
    message: "You've been added to the waitlist.",
    waitlistId: id,
  };
};

/**
 * Add to waitlist for adding guests (registration_id set). Called when user wants +N but only M spots available.
 * Uses ON DUPLICATE KEY UPDATE if user already has an add-guests waitlist entry.
 */
export const addToGuestsWaitlist = async (
  userId: string,
  eventId: number,
  registrationId: string,
  guestCount: number,
  formData: RegistrationFormData
): Promise<{ success: boolean; waitlistId?: string }> => {
  const [existing] = await pool.execute<WaitlistRow[]>(
    'SELECT id, guest_count FROM event_waitlist WHERE user_id = ? AND event_id = ? AND registration_id = ?',
    [userId, eventId, registrationId]
  );
  if (existing.length > 0) {
    const newCount = (existing[0].guest_count ?? 1) + guestCount;
    await pool.execute(
      'UPDATE event_waitlist SET guest_count = ?, name = ?, email = ?, phone = ? WHERE id = ?',
      [newCount, formData.name, formData.email, formData.phone ?? '', existing[0].id]
    );
    return { success: true, waitlistId: existing[0].id };
  }
  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM event_waitlist WHERE event_id = ?',
    [eventId]
  );
  const position = Number(countRows[0]?.cnt ?? 0) + 1;
  const id = uuidv4();
  await pool.execute(
    `INSERT INTO event_waitlist (id, event_id, user_id, name, email, phone, position, registration_id, guest_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, eventId, userId, formData.name, formData.email, formData.phone ?? '', position, registrationId, guestCount]
  );
  return { success: true, waitlistId: id };
};

/**
 * Get the first waitlist entry for an event.
 * Priority: new spots (registration_id IS NULL) first, then add-guests, ordered by created_at.
 */
export const getFirstWaitlistEntry = async (eventId: number): Promise<WaitlistEntry | null> => {
  const [rows] = await pool.execute<WaitlistRow[]>(
    `SELECT * FROM event_waitlist WHERE event_id = ?
     ORDER BY registration_id IS NULL DESC, created_at ASC LIMIT 1`,
    [eventId]
  );
  if (rows.length === 0) return null;
  return rowToWaitlistEntry(rows[0]);
};

/**
 * Get waitlist entries for an event (public - name, guestCount, type for display).
 * type: 'new_spot' = waiting for a spot (not registered); 'add_guests' = registered, friends waiting.
 */
export const getEventWaitlistPublic = async (
  eventId: number
): Promise<{ name: string; guestCount: number; type: 'new_spot' | 'add_guests' }[]> => {
  const [rows] = await pool.execute<WaitlistRow[]>(
    `SELECT name, guest_count, registration_id FROM event_waitlist WHERE event_id = ?
     ORDER BY position ASC, created_at ASC`,
    [eventId]
  );
  return rows.map((r) => ({
    name: r.name ?? '',
    guestCount: r.guest_count ?? 1,
    type: r.registration_id ? 'add_guests' : 'new_spot',
  }));
};

/**
 * Get current user's add-guests waitlist entry for an event (registration_id set).
 */
export const getMyAddGuestsWaitlistEntry = async (
  userId: string,
  eventId: number,
  registrationId: string
): Promise<{ id: string; count: number } | null> => {
  const [rows] = await pool.execute<WaitlistRow[]>(
    'SELECT id, guest_count FROM event_waitlist WHERE user_id = ? AND event_id = ? AND registration_id = ?',
    [userId, eventId, registrationId]
  );
  if (rows.length === 0) return null;
  const count = rows[0].guest_count ?? 0;
  if (count < 1) return null;
  return { id: rows[0].id, count };
};

/**
 * Reduce friends from add-guests waitlist. User must own the registration.
 */
export const reduceAddGuestsWaitlist = async (
  userId: string,
  registrationId: string,
  eventId: number,
  count: number
): Promise<{ reduced: number }> => {
  const toReduce = Math.min(Math.max(1, count), 10);

  const [rows] = await pool.execute<WaitlistRow[]>(
    'SELECT id, guest_count FROM event_waitlist WHERE user_id = ? AND event_id = ? AND registration_id = ?',
    [userId, eventId, registrationId]
  );
  if (rows.length === 0) throw createError('No friends on the waitlist for this registration', 404);

  const entry = rows[0];
  const current = entry.guest_count ?? 0;
  if (current < 1) throw createError('No friends on the waitlist', 400);

  const actualReduce = Math.min(toReduce, current);
  const newCount = current - actualReduce;

  if (newCount <= 0) {
    await pool.execute('DELETE FROM event_waitlist WHERE id = ?', [entry.id]);
  } else {
    await pool.execute('UPDATE event_waitlist SET guest_count = ? WHERE id = ?', [newCount, entry.id]);
  }

  return { reduced: actualReduce };
};

/**
 * Remove an entry from the waitlist.
 */
export const removeFromWaitlist = async (waitlistId: string): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM event_waitlist WHERE id = ?', [waitlistId]);
  return Number((result as { affectedRows?: number })?.affectedRows) > 0;
};

/**
 * Promote the first waitlist entry after a cancellation.
 * - For new spot (registration_id NULL): create registration with status pending_payment, do NOT increment attendees.
 * - For add-guests (registration_id SET): add guest_count to that registration and increment attendees (no payment).
 */
export const promoteFromWaitlist = async (
  eventId: number,
  onPromotionEmail: (entry: WaitlistEntry, paymentLink: string) => Promise<void>
): Promise<{ promoted: boolean; registrationId?: string }> => {
  const entry = await getFirstWaitlistEntry(eventId);
  if (!entry) return { promoted: false };

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const paymentLink = `${frontendUrl}/play/payment?pending=`;

  if (entry.registrationId) {
    const [regRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, guest_count, email FROM registrations WHERE id = ? AND event_id = ? AND status = ?',
      [entry.registrationId, eventId, 'confirmed']
    );
    if (regRows.length === 0) {
      await removeFromWaitlist(entry.id);
      return { promoted: false };
    }
    const reg = regRows[0];
    const toAdd = Math.min(1, entry.guestCount);
    const newGuestCount = (reg.guest_count ?? 0) + toAdd;
    await pool.execute(
      'UPDATE registrations SET guest_count = ? WHERE id = ?',
      [newGuestCount, entry.registrationId]
    );
    const { incrementEventAttendees } = await import('./eventService.js');
    await incrementEventAttendees(eventId, toAdd);
    if (entry.guestCount <= 1) {
      await removeFromWaitlist(entry.id);
    } else {
      await pool.execute(
        'UPDATE event_waitlist SET guest_count = ? WHERE id = ?',
        [entry.guestCount - 1, entry.id]
      );
    }
    const event = await getEventById(eventId);
    if (event && reg.email) {
      await sendFriendsPromotedEmail(
        reg.email,
        event.title,
        `${event.date} ${event.time}`,
        toAdd
      );
    }
    return { promoted: true, registrationId: entry.registrationId };
  }

  const id = uuidv4();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  const regDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await pool.execute(
    `INSERT INTO registrations (id, event_id, user_id, name, email, phone, registration_date, status, attendance_status, payment_method, guest_count, pending_payment_expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'upcoming', 'stripe', 0, ?)`,
    [id, eventId, entry.userId, entry.name, entry.email, entry.phone ?? '', regDate, expiresAt]
  );

  await removeFromWaitlist(entry.id);
  await onPromotionEmail(entry, paymentLink + id);

  return { promoted: true, registrationId: id };
};
