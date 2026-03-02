import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db/connection.js';

// ============ Types ============

export interface VetsEvent {
  id: number;
  title: string;
  location: string;
  eventDate: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VetsInterest {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  playerRating: string | null;
  status: 'interested' | 'contacted' | 'registered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  events?: VetsEvent[];
}

export interface CreateVetsEventData {
  title: string;
  location: string;
  eventDate: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateVetsInterestData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  playerRating?: string;
  eventIds: number[];
}

// ============ Row Types ============

interface VetsEventRow extends RowDataPacket {
  id: number;
  title: string;
  location: string;
  event_date: string;
  description: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface VetsInterestRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  player_rating: string | null;
  status: 'interested' | 'contacted' | 'registered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// ============ Converters ============

function rowToVetsEvent(row: VetsEventRow): VetsEvent {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    eventDate: typeof row.event_date === 'string' ? row.event_date : String(row.event_date),
    description: row.description,
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function rowToVetsInterest(row: VetsInterestRow): VetsInterest {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    playerRating: row.player_rating,
    status: row.status,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

// ============ VETS Events CRUD ============

export async function getAllVetsEvents(activeOnly = false): Promise<VetsEvent[]> {
  const query = activeOnly
    ? 'SELECT * FROM vets_events WHERE is_active = TRUE ORDER BY event_date ASC'
    : 'SELECT * FROM vets_events ORDER BY event_date ASC';
  const [rows] = await pool.execute<VetsEventRow[]>(query);
  return rows.map(rowToVetsEvent);
}

export async function getVetsEventById(id: number): Promise<VetsEvent | null> {
  const [rows] = await pool.execute<VetsEventRow[]>(
    'SELECT * FROM vets_events WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rowToVetsEvent(rows[0]) : null;
}

export async function createVetsEvent(data: CreateVetsEventData): Promise<VetsEvent> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO vets_events (title, location, event_date, description, is_active)
     VALUES (?, ?, ?, ?, ?)`,
    [data.title, data.location, data.eventDate, data.description || null, data.isActive !== false]
  );
  const created = await getVetsEventById(result.insertId);
  if (!created) throw new Error('Failed to create VETS event');
  return created;
}

export async function updateVetsEvent(
  id: number,
  data: Partial<CreateVetsEventData>
): Promise<VetsEvent | null> {
  const updates: string[] = [];
  const values: (string | boolean | null)[] = [];

  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.location !== undefined) {
    updates.push('location = ?');
    values.push(data.location);
  }
  if (data.eventDate !== undefined) {
    updates.push('event_date = ?');
    values.push(data.eventDate);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(data.isActive);
  }

  if (updates.length === 0) return getVetsEventById(id);

  values.push(String(id));
  await pool.execute(
    `UPDATE vets_events SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  return getVetsEventById(id);
}

export async function deleteVetsEvent(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM vets_events WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// ============ VETS Interests CRUD ============

export async function createVetsInterest(data: CreateVetsInterestData): Promise<VetsInterest> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO vets_interests (first_name, last_name, email, phone, player_rating, status)
     VALUES (?, ?, ?, ?, ?, 'interested')`,
    [data.firstName, data.lastName, data.email.toLowerCase().trim(), data.phone || null, data.playerRating || null]
  );

  const interestId = result.insertId;

  if (data.eventIds && data.eventIds.length > 0) {
    for (const eventId of data.eventIds) {
      await pool.execute(
        'INSERT INTO vets_interest_events (interest_id, event_id) VALUES (?, ?)',
        [interestId, eventId]
      );
    }
  }

  const created = await getVetsInterestById(interestId);
  if (!created) throw new Error('Failed to create VETS interest');
  return created;
}

export async function getAllVetsInterests(): Promise<VetsInterest[]> {
  const [rows] = await pool.execute<VetsInterestRow[]>(
    'SELECT * FROM vets_interests ORDER BY created_at DESC'
  );

  const interests = rows.map(rowToVetsInterest);

  for (const interest of interests) {
    interest.events = await getEventsForInterest(interest.id);
  }

  return interests;
}

export async function getVetsInterestById(id: number): Promise<VetsInterest | null> {
  const [rows] = await pool.execute<VetsInterestRow[]>(
    'SELECT * FROM vets_interests WHERE id = ?',
    [id]
  );

  if (rows.length === 0) return null;

  const interest = rowToVetsInterest(rows[0]);
  interest.events = await getEventsForInterest(id);
  return interest;
}

export async function updateVetsInterestStatus(
  id: number,
  status: 'interested' | 'contacted' | 'registered' | 'cancelled'
): Promise<VetsInterest | null> {
  await pool.execute(
    'UPDATE vets_interests SET status = ? WHERE id = ?',
    [status, id]
  );
  return getVetsInterestById(id);
}

export async function deleteVetsInterest(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM vets_interests WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

// ============ Helper Functions ============

async function getEventsForInterest(interestId: number): Promise<VetsEvent[]> {
  const [rows] = await pool.execute<VetsEventRow[]>(
    `SELECT e.* FROM vets_events e
     INNER JOIN vets_interest_events ie ON e.id = ie.event_id
     WHERE ie.interest_id = ?
     ORDER BY e.event_date ASC`,
    [interestId]
  );
  return rows.map(rowToVetsEvent);
}
