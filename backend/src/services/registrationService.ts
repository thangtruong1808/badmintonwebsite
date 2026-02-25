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
import { promoteFromWaitlist } from './waitlistService.js';
import { sendWaitlistPromotionEmail, sendRegistrationConfirmationEmail, sendRegistrationConfirmationEmailForSessions, sendAddGuestsConfirmationEmail, sendCancellationConfirmationEmail } from '../utils/email.js';
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
  guestCount?: number;
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
  guest_count?: number;
  pending_payment_expires_at?: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToRegistration(r: RegRow): Registration {
  const regDate = r.registration_date instanceof Date
    ? r.registration_date.toISOString()
    : String(r.registration_date);
  const expiresAt = r.pending_payment_expires_at;
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
    guestCount: r.guest_count ?? 0,
    pendingPaymentExpiresAt: expiresAt ? (expiresAt instanceof Date ? expiresAt.toISOString() : String(expiresAt)) : undefined,
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
  event_price?: number | null;
}

export interface RegistrationWithEventDetails extends Registration {
  eventTitle?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventLocation?: string | null;
  eventCategory?: string | null;
  eventPrice?: number | null;
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
            r.guest_count, r.pending_payment_expires_at,
            e.title AS event_title, e.date AS event_date, e.time AS event_time, e.location AS event_location, e.category AS event_category, e.price AS event_price
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
      eventPrice: r.event_price ?? null,
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

/** Public: returns list of registered players (name, avatar, guestCount) for displaying on play page. Only confirmed. */
export const getEventRegistrationsPublic = async (eventId: number): Promise<PublicRegistrationPlayer[]> => {
  const [rows] = await pool.execute<(RegRow & { avatar?: string | null })[]>(
    `SELECT r.name, r.email, r.guest_count, u.avatar
     FROM registrations r
     LEFT JOIN users u ON r.user_id = u.id
     WHERE r.event_id = ? AND r.status = ?
     ORDER BY r.registration_date ASC`,
    [eventId, 'confirmed']
  );
  return rows.map((r) => ({
    name: r.name,
    email: r.email,
    avatar: r.avatar ?? null,
    guestCount: r.guest_count ?? 0,
  }));
};

export const registerForEvents = async (
  userId: string,
  eventIds: number[],
  formData: RegistrationFormData,
  options?: { guestCount?: number }
): Promise<{ success: boolean; message: string; registrations: Registration[] }> => {
  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const guestCount = Math.min(Math.max(0, options?.guestCount ?? 0), 10);
  const spotsPerRegistration = 1 + guestCount;

  const newRegistrations: Registration[] = [];
  const confirmedSessions: { title: string; date: string; time?: string; location?: string }[] = [];

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
      if (existing.status === 'pending_payment') {
        throw createError(`You have a reserved spot for '${event.title}' - please complete payment first`, 400);
      }

      if (existing.status === 'cancelled') {
        if (event.currentAttendees >= event.maxCapacity) {
          throw createError(`Event '${event.title}' is full`, 400);
        }
        const spotsLeft = event.maxCapacity - event.currentAttendees;
        if (spotsLeft < spotsPerRegistration) {
          throw createError(`Event '${event.title}' has only ${spotsLeft} spot(s) left`, 400);
        }
        const registrationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute(
          `UPDATE registrations SET status = 'confirmed', attendance_status = 'upcoming',
            name = ?, email = ?, phone = ?, registration_date = ?, guest_count = ?
           WHERE id = ?`,
          [formData.name, formData.email, formData.phone, registrationDate, guestCount, existing.id]
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
          guestCount,
        });
        await incrementEventAttendees(eventId, spotsPerRegistration);
        confirmedSessions.push({
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
        });
      }
      continue;
    }

    if (event.currentAttendees >= event.maxCapacity) {
      throw createError(`Event '${event.title}' is full`, 400);
    }
    const spotsLeft = event.maxCapacity - event.currentAttendees;
    if (spotsLeft < spotsPerRegistration) {
      throw createError(`Event '${event.title}' has only ${spotsLeft} spot(s) left`, 400);
    }

    const id = uuidv4();
    const registrationDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(
      `INSERT INTO registrations (id, event_id, user_id, name, email, phone, registration_date, status, attendance_status, payment_method, guest_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', 'upcoming', 'stripe', ?)`,
      [id, eventId, userId, formData.name, formData.email, formData.phone, registrationDate, guestCount]
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
      guestCount,
    });

    await incrementEventAttendees(eventId, spotsPerRegistration);
    confirmedSessions.push({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
    });
  }

  if (confirmedSessions.length > 0) {
    const email = (formData.email && String(formData.email).trim()) || user.email;
    if (email) {
      await sendRegistrationConfirmationEmailForSessions(email, confirmedSessions, formData.name);
    }
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
  const guestCount = reg.guest_count ?? 0;
  const delta = 1 + guestCount;

  await pool.execute(
    'UPDATE registrations SET status = ? WHERE id = ?',
    ['cancelled', registrationId]
  );
  await decrementEventAttendees(reg.event_id, delta);

  const event = await getEventById(reg.event_id);
  const recipientEmail = (reg.email && String(reg.email).trim()) || (await getUserById(userId))?.email;
  if (event && recipientEmail) {
    await sendCancellationConfirmationEmail(
      recipientEmail,
      event.title,
      event.date,
      event.time,
      event.location,
      reg.name
    );
    await promoteFromWaitlist(reg.event_id, async (entry, paymentLink) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      await sendWaitlistPromotionEmail(
        entry.email,
        event.title,
        `${event.date} ${event.time}`,
        paymentLink,
        expiresAt,
        entry.name
      );
    });
  }

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

/**
 * Get user's registrations with status pending_payment (reserved spots awaiting payment).
 */
export const getMyPendingPaymentRegistrations = async (userId: string): Promise<RegistrationWithEventDetails[]> => {
  const [rows] = await pool.execute<RegWithEventRow[]>(
    `SELECT r.id, r.event_id, r.user_id, r.name, r.email, r.phone, r.registration_date,
            r.status, r.attendance_status, r.points_earned, r.points_claimed, r.payment_method, r.points_used,
            r.guest_count, r.pending_payment_expires_at,
            e.title AS event_title, e.date AS event_date, e.time AS event_time, e.location AS event_location, e.category AS event_category, e.price AS event_price
     FROM registrations r
     LEFT JOIN events e ON r.event_id = e.id
     WHERE r.user_id = ? AND r.status = ?
     ORDER BY r.pending_payment_expires_at ASC`,
    [userId, 'pending_payment']
  );
  return rows.map((r) => {
    const reg = rowToRegistration(r);
    return {
      ...reg,
      eventTitle: r.event_title ?? null,
      eventDate: r.event_date ?? null,
      eventTime: r.event_time ?? null,
      eventLocation: r.event_location ?? null,
      eventCategory: r.event_category ?? null,
      eventPrice: r.event_price ?? null,
    };
  });
};

/**
 * Confirm payment for a pending_payment registration (called after Stripe webhook or success).
 */
export const confirmPaymentForPendingRegistration = async (registrationId: string): Promise<boolean> => {
  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE id = ? AND status = ?',
    [registrationId, 'pending_payment']
  );
  if (rows.length === 0) return false;

  const reg = rows[0];
  const event = await getEventById(reg.event_id);
  if (!event) return false;

  await pool.execute(
    `UPDATE registrations SET status = 'confirmed', pending_payment_expires_at = NULL WHERE id = ?`,
    [registrationId]
  );
  await incrementEventAttendees(reg.event_id, 1);
  await sendRegistrationConfirmationEmail(
    reg.email,
    event.title,
    event.date,
    event.time,
    event.location,
    reg.name
  );
  return true;
};

/**
 * Add guests to an existing confirmed registration.
 */
export const addGuestsToRegistration = async (
  userId: string,
  registrationId: string,
  requestedCount: number
): Promise<{ added: number; waitlisted: number }> => {
  const count = Math.min(Math.max(1, requestedCount), 10);

  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE id = ? AND user_id = ? AND status = ?',
    [registrationId, userId, 'confirmed']
  );
  if (rows.length === 0) throw createError('Registration not found or unauthorized', 404);

  const reg = rows[0];
  const event = await getEventById(reg.event_id);
  if (!event) throw createError('Event not found', 404);

  const spotsLeft = event.maxCapacity - event.currentAttendees;
  const toAdd = Math.min(count, spotsLeft);
  const toWaitlist = count - toAdd;

  if (toAdd > 0) {
    const newGuestCount = (reg.guest_count ?? 0) + toAdd;
    await pool.execute(
      'UPDATE registrations SET guest_count = ? WHERE id = ?',
      [newGuestCount, registrationId]
    );
    await incrementEventAttendees(reg.event_id, toAdd);
  }

  if (toWaitlist > 0) {
    const { addToGuestsWaitlist } = await import('./waitlistService.js');
    const user = await getUserById(userId);
    if (!user) throw createError('User not found', 404);
    const formData = {
      name: `${user.firstName} ${user.lastName}`.trim() || reg.name,
      email: user.email || reg.email,
      phone: user.phone ?? reg.phone ?? '',
    };
    await addToGuestsWaitlist(userId, reg.event_id, registrationId, toWaitlist, formData);
  }

  if (toAdd > 0 || toWaitlist > 0) {
    const recipientEmail = reg.email;
    if (recipientEmail && event) {
      await sendAddGuestsConfirmationEmail(
        recipientEmail,
        event.title,
        `${event.date} ${event.time}`,
        toAdd,
        toWaitlist,
        reg.name
      );
    }
  }

  return { added: toAdd, waitlisted: toWaitlist };
}

/**
 * Remove guests from an existing confirmed registration.
 * Frees spots and promotes from waitlist (FIFO) for each freed spot.
 */
export const removeGuestsFromRegistration = async (
  userId: string,
  registrationId: string,
  count: number
): Promise<{ removed: number; promoted: number }> => {
  const toRemove = Math.min(Math.max(1, count), 10);

  const [rows] = await pool.execute<RegRow[]>(
    'SELECT * FROM registrations WHERE id = ? AND user_id = ? AND status = ?',
    [registrationId, userId, 'confirmed']
  );
  if (rows.length === 0) throw createError('Registration not found or unauthorized', 404);

  const reg = rows[0];
  const currentGuests = reg.guest_count ?? 0;
  if (currentGuests < 1) throw createError('No friends to remove', 400);

  const actualRemove = Math.min(toRemove, currentGuests);
  const newGuestCount = currentGuests - actualRemove;

  await pool.execute(
    'UPDATE registrations SET guest_count = ? WHERE id = ?',
    [newGuestCount, registrationId]
  );
  await decrementEventAttendees(reg.event_id, actualRemove);

  let promoted = 0;
  const { promoteFromWaitlist } = await import('./waitlistService.js');
  const event = await getEventById(reg.event_id);
  if (event) {
    for (let i = 0; i < actualRemove; i++) {
      const result = await promoteFromWaitlist(reg.event_id, async (entry, link) => {
        await sendWaitlistPromotionEmail(
          entry.email,
          event.title,
          event.date,
          link,
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          entry.name
        );
      });
      if (result.promoted) promoted += 1;
      else break;
    }
  }

  return { removed: actualRemove, promoted };
};

/**
 * Expire pending_payment registrations past their deadline, cancel them, and promote next from waitlist.
 * Called by cron. For pending_payment we never incremented attendees, so no decrement needed.
 */
export const expirePendingPromotions = async (): Promise<{ expired: number; promoted: number }> => {
  const [rows] = await pool.execute<RegRow[]>(
    `SELECT id, event_id FROM registrations
     WHERE status = 'pending_payment' AND pending_payment_expires_at IS NOT NULL AND pending_payment_expires_at < NOW()`
  );

  let expired = 0;
  let promoted = 0;

  for (const r of rows) {
    await pool.execute('UPDATE registrations SET status = ? WHERE id = ?', ['cancelled', r.id]);
    expired += 1;

    const { promoteFromWaitlist } = await import('./waitlistService.js');
    const result = await promoteFromWaitlist(r.event_id, async (entry, link) => {
      const event = await getEventById(r.event_id);
      if (event) {
        await sendWaitlistPromotionEmail(
          entry.email,
          event.title,
          event.date,
          link,
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          entry.name
        );
      }
    });
    if (result.promoted) promoted += 1;
  }

  return { expired, promoted };
}

/**
 * Process waitlists for events with available spots (first-in-first-out).
 * Called when capacity increases or via cron. Promotes from waitlist until no spots or no waitlist.
 */
export const processWaitlistsForAvailableSpots = async (
  eventId?: number
): Promise<{ processed: number; promoted: number }> => {
  const { promoteFromWaitlist, getFirstWaitlistEntry } = await import('./waitlistService.js');

  let eventIds: number[];
  if (eventId != null) {
    eventIds = [eventId];
  } else {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT e.id FROM events e
       WHERE e.current_attendees < e.max_capacity
         AND e.date >= CURDATE()
         AND EXISTS (SELECT 1 FROM event_waitlist w WHERE w.event_id = e.id)`
    );
    eventIds = rows.map((r) => r.id);
  }

  let processed = 0;
  let promoted = 0;

  for (const eid of eventIds) {
    const event = await getEventById(eid);
    if (!event) continue;

    const [pendingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) AS cnt FROM registrations WHERE event_id = ? AND status = ?',
      [eid, 'pending_payment']
    );
    const pendingCount = Number(pendingRows[0]?.cnt ?? 0);
    let spotsAvailable = event.maxCapacity - event.currentAttendees - pendingCount;

    while (spotsAvailable > 0) {
      const entry = await getFirstWaitlistEntry(eid);
      if (!entry) break;

      const result = await promoteFromWaitlist(eid, async (entry, link) => {
        await sendWaitlistPromotionEmail(
          entry.email,
          event.title,
          event.date,
          link,
          new Date(Date.now() + 24 * 60 * 60 * 1000),
          entry.name
        );
      });

      if (result.promoted) {
        promoted += 1;
        processed += 1;
        spotsAvailable -= 1;
      } else {
        break;
      }
    }
  }

  return { processed: eventIds.length, promoted };
}
