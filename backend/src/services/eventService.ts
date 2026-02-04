import type { RowDataPacket } from 'mysql2';
import type { SocialEvent } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import pool from '../db/connection.js';
import { getAllPlaySlots } from './playSlotService.js';

interface EventRow extends RowDataPacket {
  id: number;
  title: string;
  date: Date | string;
  time: string;
  day_of_week: string;
  location: string;
  description: string | null;
  max_capacity: number;
  current_attendees: number;
  price: number | null;
  image_url: string | null;
  status: string;
  category: string;
  recurring: boolean;
}

function rowToSocialEvent(row: EventRow): SocialEvent {
  const dateStr = row.date instanceof Date
    ? row.date.toISOString().slice(0, 10)
    : String(row.date).slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    date: dateStr,
    time: row.time,
    dayOfWeek: row.day_of_week,
    location: row.location,
    description: row.description ?? '',
    maxCapacity: row.max_capacity,
    currentAttendees: row.current_attendees,
    price: row.price ?? undefined,
    imageUrl: row.image_url ?? undefined,
    status: row.status as SocialEvent['status'],
    category: row.category as SocialEvent['category'],
    recurring: Boolean(row.recurring),
  };
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getNextDateForDay(dayName: string, fromDate: Date): Date {
  const targetDay = DAY_NAMES.indexOf(dayName);
  if (targetDay === -1) return fromDate;
  const current = new Date(fromDate);
  const currentDay = current.getDay();
  let diff = targetDay - currentDay;
  if (diff <= 0) diff += 7;
  current.setDate(current.getDate() + diff);
  return current;
}

/** Generate events from play_slots for the given date range */
export const generateEventsFromSlots = async (
  fromDateStr: string,
  toDateStr: string
): Promise<SocialEvent[]> => {
  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);
  const slots = await getAllPlaySlots(true);

  const generated: SocialEvent[] = [];

  for (const slot of slots) {
    let cursor = getNextDateForDay(slot.dayOfWeek, fromDate);

    while (cursor <= toDate) {
      const dateStr = cursor.toISOString().slice(0, 10);

      const [existing] = await pool.execute<EventRow[]>(
        'SELECT * FROM events WHERE date = ? AND title = ? AND location = ? LIMIT 1',
        [dateStr, slot.title, slot.location]
      );

      if (existing.length === 0) {
        const status = cursor < new Date() ? 'completed' : 'available';
        const [result] = await pool.execute(
          `INSERT INTO events (title, date, time, day_of_week, location, description, max_capacity, current_attendees, price, status, category, recurring)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'regular', TRUE)`,
          [
            slot.title,
            dateStr,
            slot.time,
            slot.dayOfWeek,
            slot.location,
            slot.description ?? '',
            slot.maxCapacity,
            slot.price,
            status,
          ]
        );
        const insertId = Number((result as { insertId: number }).insertId);
        const [rows] = await pool.execute<EventRow[]>(
          'SELECT * FROM events WHERE id = ?',
          [insertId]
        );
        if (rows.length) generated.push(rowToSocialEvent(rows[0]));
      }

      cursor.setDate(cursor.getDate() + 7);
    }
  }

  return generated;
};

export const getAllEvents = async (
  fromDate?: string,
  toDate?: string
): Promise<SocialEvent[]> => {
  if (fromDate && toDate) {
    await generateEventsFromSlots(fromDate, toDate);
  }

  const [rows] = await pool.execute<EventRow[]>(
    'SELECT * FROM events ORDER BY date ASC, time ASC'
  );
  return rows.map(rowToSocialEvent);
};

export const getEventById = async (eventId: number): Promise<SocialEvent | null> => {
  const [rows] = await pool.execute<EventRow[]>(
    'SELECT * FROM events WHERE id = ?',
    [eventId]
  );
  if (!rows.length) return null;
  return rowToSocialEvent(rows[0]);
};

export const createEvent = async (
  eventData: Omit<SocialEvent, 'id'>
): Promise<SocialEvent> => {
  const [result] = await pool.execute(
    `INSERT INTO events (title, date, time, day_of_week, location, description, max_capacity, current_attendees, price, image_url, status, category, recurring)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      eventData.title,
      eventData.date,
      eventData.time,
      eventData.dayOfWeek,
      eventData.location,
      eventData.description ?? '',
      eventData.maxCapacity,
      eventData.currentAttendees ?? 0,
      eventData.price ?? null,
      eventData.imageUrl ?? null,
      eventData.status ?? 'available',
      eventData.category ?? 'regular',
      eventData.recurring ? 1 : 0,
    ]
  );
  const inserted = await getEventById(Number((result as { insertId: number }).insertId));
  if (!inserted) throw new Error('Failed to fetch created event');
  return inserted;
};

export const updateEvent = async (
  eventId: number,
  updates: Partial<SocialEvent>
): Promise<SocialEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.time !== undefined) { fields.push('time = ?'); values.push(updates.time); }
  if (updates.dayOfWeek !== undefined) { fields.push('day_of_week = ?'); values.push(updates.dayOfWeek); }
  if (updates.location !== undefined) { fields.push('location = ?'); values.push(updates.location); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.maxCapacity !== undefined) { fields.push('max_capacity = ?'); values.push(updates.maxCapacity); }
  if (updates.currentAttendees !== undefined) { fields.push('current_attendees = ?'); values.push(updates.currentAttendees); }
  if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }
  if (updates.imageUrl !== undefined) { fields.push('image_url = ?'); values.push(updates.imageUrl); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.recurring !== undefined) { fields.push('recurring = ?'); values.push(updates.recurring ? 1 : 0); }

  if (fields.length === 0) return event;

  let newStatus = event.status;
  const newAttendees = updates.currentAttendees ?? event.currentAttendees;
  const newCapacity = updates.maxCapacity ?? event.maxCapacity;
  if (newAttendees >= newCapacity) newStatus = 'full';
  else if (newStatus === 'full') newStatus = 'available';

  if (updates.status === undefined && (updates.currentAttendees !== undefined || updates.maxCapacity !== undefined)) {
    fields.push('status = ?');
    values.push(newStatus);
  }

  values.push(eventId);
  await pool.execute(
    `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return getEventById(eventId);
};

export const deleteEvent = async (eventId: number): Promise<boolean> => {
  const [result] = await pool.execute(
    'DELETE FROM events WHERE id = ?',
    [eventId]
  );
  return Number((result as { affectedRows?: number })?.affectedRows) > 0;
};

export const incrementEventAttendees = async (eventId: number): Promise<SocialEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) return null;

  if (event.currentAttendees >= event.maxCapacity) {
    throw createError('Event is full', 400);
  }

  const newCount = event.currentAttendees + 1;
  const newStatus = newCount >= event.maxCapacity ? 'full' : event.status;

  await pool.execute(
    'UPDATE events SET current_attendees = ?, status = ? WHERE id = ?',
    [newCount, newStatus, eventId]
  );
  return getEventById(eventId);
};

export const decrementEventAttendees = async (eventId: number): Promise<SocialEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) return null;

  if (event.currentAttendees <= 0) return event;

  const newCount = event.currentAttendees - 1;
  const newStatus = 'available';

  await pool.execute(
    'UPDATE events SET current_attendees = ?, status = ? WHERE id = ?',
    [newCount, newStatus, eventId]
  );
  return getEventById(eventId);
};
