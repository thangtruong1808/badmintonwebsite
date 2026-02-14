import { v4 as uuidv4 } from 'uuid';
import type { RowDataPacket } from 'mysql2';
import type { Registration, RegistrationFormData } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import {
  getEventById,
  incrementEventAttendees,
  decrementEventAttendees,
} from './eventService.js';
import { getUserById } from './userService.js';
import pool from '../db/connection.js';

export interface RegistrationRow {
  id: string;
  event_id: number;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  registration_date: string;
  status: string;
  attendance_status: string | null;
  points_earned: number;
  points_claimed: boolean;
  payment_method: string | null;
  points_used: number;
  created_at?: string;
  updated_at?: string;
}

export interface PublicRegistrationPlayer {
  name: string;
  email?: string;
  avatar?: string | null;
}

interface RegRow extends RowDataPacket {
  id: string;
  event_id: number;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  registration_date: Date | string;
  status: string;
  attendance_status: string | null;
  points_earned: number;
  points_claimed: boolean;
  payment_method: string | null;
  points_used: number;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToRegistration(r: RegRow): Registration {
  const regDate = r.registration_date instanceof Date
    ? r.registration_date.toISOString()
    : String(r.registration_date);
  return {
    id: r.id,
    eventId: r.event_id,
    userId: r.user_id ?? undefined,
    name: r.name,
    email: r.email,
    phone: r.phone,
    registrationDate: regDate,
    status: r.status as Registration['status'],
    attendanceStatus: (r.attendance_status ?? 'upcoming') as Registration['attendanceStatus'],
    pointsEarned: r.points_earned ?? 0,
    pointsClaimed: Boolean(r.points_claimed),
    paymentMethod: (r.payment_method ?? 'stripe') as Registration['paymentMethod'],
    pointsUsed: r.points_used ?? 0,
  };
}

export const getAllRegistrations = async (): Promise<RegistrationRow[]> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations ORDER BY registration_date DESC'
  );
  return rows.map((r) => ({
    id: r.id,
    event_id: r.event_id,
    user_id: r.user_id ?? null,
    name: r.name,
    email: r.email,
    phone: r.phone,
    registration_date: r.registration_date instanceof Date ? r.registration_date.toISOString().slice(0, 19).replace('T', ' ') : String(r.registration_date).slice(0, 19),
    status: r.status,
    attendance_status: r.attendance_status ?? 'upcoming',
    points_earned: r.points_earned ?? 0,
    points_claimed: Boolean(r.points_claimed),
    payment_method: r.payment_method ?? 'stripe',
    points_used: r.points_used ?? 0,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  }));
};

export const getUserRegistrations = async (userId: string): Promise<Registration[]> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE user_id = ? AND status != ? ORDER BY registration_date DESC',
    [userId, 'cancelled']
  );
  return rows.map(rowToRegistration);
};

/** Row shape when joining registrations with events for profile/event list. */
interface RegWithEventRow extends RegRow {
  event_title: string | null;
  event_date: string | null;
  event_time: string | null;
  event_location: string | null;
  event_category: string | null;
}

export interface RegistrationWithEventDetails extends Registration {
  eventTitle?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventCategory?: string | null;
}

/** True if the event date (YYYY-MM-DD or ISO string) is before today (date-only). */
function isEventDateInPast(eventDate: string | Date | null): boolean {
  if (eventDate == null) return false;
  const d = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  if (Number.isNaN(d.getTime())) return false;
  const eventDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return eventDay < todayDay;
}

/**
 * Get user registrations with event details (for profile event list).
 * When includeCancelled is true, returns all registrations including cancelled.
 * For confirmed registrations whose event date is in the past, attendanceStatus is returned as 'attended' so they appear in the Attended tab.
 */
export const getRegistrationsWithEventDetails = async (
  userId: string,
  includeCancelled: boolean
): Promise<RegistrationWithEventDetails[]> => {
  const statusFilter = includeCancelled ? '' : "AND r.status != 'cancelled'";
  const [rows] = await pool.execute<RegWithEventRow[]>(
    `SELECT r.id, r.event_id, r.user_id, r.name, r.email, r.phone, r.registration_date,
            r.status, r.attendance_status, r.points_earned, r.points_claimed, r.payment_method, r.points_used,
            e.title AS event_title, e.date AS event_date, e.time AS event_time, e.location AS event_location, e.category AS event_category
     FROM registrations r
     LEFT JOIN events e ON r.event_id = e.id
     WHERE r.user_id = ?
     ${statusFilter}
     ORDER BY e.date DESC, r.registration_date DESC`,
    includeCancelled ? [userId] : [userId]
  );
  return rows.map((r) => {
    const reg = rowToRegistration(r);
    const eventDate = r.event_date ?? null;
    const pastEvent = isEventDateInPast(eventDate);
    const attendanceStatus =
      reg.status === 'confirmed' && pastEvent ? ('attended' as const) : reg.attendanceStatus;
    return {
      ...reg,
      attendanceStatus,
      eventTitle: r.event_title ?? null,
      eventDate: r.event_date ?? null,
      eventTime: r.event_time ?? null,
      eventLocation: r.event_location ?? null,
      eventCategory: r.event_category ?? null,
    };
  });
};

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE event_id = ? AND status != ? ORDER BY registration_date ASC',
    [eventId, 'cancelled']
  );
  return rows.map(rowToRegistration);
};

/** Public: returns list of registered players (name, avatar) for displaying on play page. No auth required. */
export const getEventRegistrationsPublic = async (eventId: number): Promise<PublicRegistrationPlayer[]> => {
  const [rows] = await pool.execute<(RegRow & { avatar?: string | null })[]>(
    `SELECT r.name, r.email, u.avatar
     FROM registrations r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.event_id = ? AND r.status != ?
     ORDER BY r.registration_date ASC`,
    [eventId, 'cancelled']
  );
  return rows.map((r) => ({ name: r.name, email: r.email, avatar: r.avatar ?? null }));
};

export const registerForEvents = async (
  userId: string,
  eventIds: number[],
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string; registrations: Registration[] }> => {
  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const newRegistrations: Registration[] = [];

  for (const eventId of eventIds) {
    const event = await getEventById(eventId);
    if (!event) {
      throw createError(`Event with ID ${eventId} not found`, 404);
    }

    const [existingAny] = await pool.execute<RegRow[]>(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
      [userId, eventId]
    );

    if (existingAny.length > 0) {
      const existing = existingAny[0];
      if (existing.status === 'confirmed') continue;

      if (existing.status === 'cancelled') {
        if (event.currentAttendees >= event.maxCapacity) {
          throw createError(`Event '${event.title}' is full`, 400);
        }
        const registrationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute(
          `UPDATE registrations SET status = 'confirmed', attendance_status = 'upcoming',
            name = ?, email = ?, phone = ?, registration_date = ?
           WHERE id = ?`,
          [formData.name, formData.email, formData.phone, registrationDate, existing.id]
        );
        newRegistrations.push({
          id: existing.id,
          eventId,
          userId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          registrationDate: new Date().toISOString(),
          status: 'confirmed',
          attendanceStatus: 'upcoming',
        });
        await incrementEventAttendees(eventId);
      }
      continue; // other statuses (e.g. pending): skip to avoid duplicate row
    }

    if (event.currentAttendees >= event.maxCapacity) {
      throw createError(`Event '${event.title}' is full`, 400);
    }

    const id = uuidv4();
    const registrationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      `INSERT INTO registrations (id, event_id, user_id, name, email, phone, registration_date, status, attendance_status, payment_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'upcoming', 'stripe')`,
      [id, eventId, userId, formData.name, formData.email, formData.phone, registrationDate]
    );

    newRegistrations.push({
      id,
      eventId,
      userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      attendanceStatus: 'upcoming',
    });

    await incrementEventAttendees(eventId);
  }

  return {
    success: true,
    message: 'Registration successful!',
    registrations: newRegistrations,
  };
};

export const cancelRegistration = async (
  userId: string,
  registrationId: string
): Promise<boolean> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE id = ? AND user_id = ?',
    [registrationId, userId]
  );

  if (rows.length === 0) return false;

  const reg = rows[0];
  await pool.execute(
    'UPDATE registrations SET status = ? WHERE id = ?',
    ['cancelled', registrationId]
  );
  await decrementEventAttendees(reg.event_id);
  return true;
};

export const getRegistrationById = async (registrationId: string): Promise<Registration | null> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE id = ?',
    [registrationId]
  );
  if (!rows.length) return null;
  return rowToRegistration(rows[0]);
};

export const getRegistrationByEventAndUser = async (
  eventId: number,
  userId: string
): Promise<Registration | null> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE event_id = ? AND user_id = ? AND status = ?',
    [eventId, userId, 'confirmed']
  );
  if (!rows.length) return null;
  return rowToRegistration(rows[0]);
};

export const getRegistrationsCount = async (): Promise<number> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM registrations WHERE status != ?',
    ['cancelled']
  );
  return Number(rows[0]?.count ?? 0);
};
