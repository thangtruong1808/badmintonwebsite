import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ReviewRow {
  id: number;
  user_id: string | null;
  name: string;
  rating: number;
  review_date: string;
  review_text: string;
  is_verified: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface ReviewDbRow extends RowDataPacket {
  id: number;
  user_id: string | null;
  name: string;
  rating: number;
  review_date: string;
  review_text: string;
  is_verified: boolean;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToReview(r: ReviewDbRow): ReviewRow {
  return {
    id: r.id,
    user_id: r.user_id ?? null,
    name: r.name,
    rating: r.rating,
    review_date: r.review_date,
    review_text: r.review_text,
    is_verified: Boolean(r.is_verified),
    status: r.status,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<ReviewRow[]> => {
  const [rows] = await pool.execute<ReviewDbRow[]>(
    'SELECT * FROM reviews ORDER BY created_at DESC'
  );
  return rows.map(rowToReview);
};

export const findById = async (id: number): Promise<ReviewRow | null> => {
  const [rows] = await pool.execute<ReviewDbRow[]>(
    'SELECT * FROM reviews WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToReview(rows[0]);
};

export const create = async (data: {
  user_id?: string | null;
  name: string;
  rating: number;
  review_date: string;
  review_text: string;
  is_verified?: boolean;
  status?: string;
}): Promise<ReviewRow> => {
  const [result] = await pool.execute(
    `INSERT INTO reviews (user_id, name, rating, review_date, review_text, is_verified, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.user_id ?? null,
      data.name,
      data.rating,
      data.review_date,
      data.review_text,
      data.is_verified ? 1 : 0,
      data.status ?? 'active',
    ]
  );
  const header = result as { insertId: number };
  const created = await findById(header.insertId);
  if (!created) throw new Error('Failed to read created review');
  return created;
};

export const update = async (
  id: number,
  data: Partial<{
    user_id: string | null;
    name: string;
    rating: number;
    review_date: string;
    review_text: string;
    is_verified: boolean;
    status: string;
  }>
): Promise<ReviewRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.user_id !== undefined) {
    updates.push('user_id = ?');
    values.push(data.user_id);
  }
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.rating !== undefined) {
    updates.push('rating = ?');
    values.push(data.rating);
  }
  if (data.review_date !== undefined) {
    updates.push('review_date = ?');
    values.push(data.review_date);
  }
  if (data.review_text !== undefined) {
    updates.push('review_text = ?');
    values.push(data.review_text);
  }
  if (data.is_verified !== undefined) {
    updates.push('is_verified = ?');
    values.push(data.is_verified ? 1 : 0);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE reviews SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
