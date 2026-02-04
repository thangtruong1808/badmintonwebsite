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

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE event_id = ? AND status != ? ORDER BY registration_date ASC',
    [eventId, 'cancelled']
  );
  return rows.map(rowToRegistration);
};

/** Public: returns list of registered players (name, email) for displaying on play page. No auth required. */
export const getEventRegistrationsPublic = async (eventId: number): Promise<PublicRegistrationPlayer[]> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT name, email FROM registrations WHERE event_id = ? AND status != ? ORDER BY registration_date ASC',
    [eventId, 'cancelled']
  );
  return rows.map((r) => ({ name: r.name, email: r.email }));
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

    const [existing] = await pool.execute<RegRow[]>(
      'SELECT * FROM registrations WHERE user_id = ? AND event_id = ? AND status = ?',
      [userId, eventId, 'confirmed']
    );

    if (existing.length > 0) continue;

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
