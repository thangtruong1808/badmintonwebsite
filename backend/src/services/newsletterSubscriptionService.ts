import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface NewsletterSubscription {
  id: number;
  email: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
  created_at?: string;
  updated_at?: string;
}

interface NewsletterRow extends RowDataPacket {
  id: number;
  email: string;
  subscribed_at: Date | string;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToSubscription(row: NewsletterRow): NewsletterSubscription {
  const subscribedAt = row.subscribed_at instanceof Date
    ? row.subscribed_at.toISOString().slice(0, 19).replace('T', ' ')
    : String(row.subscribed_at).slice(0, 19);
  return {
    id: row.id,
    email: row.email,
    subscribed_at: subscribedAt,
    status: row.status as 'active' | 'unsubscribed',
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

/** Subscribe an email. Returns { subscription } on success, { existing: true } if email already in table. */
export async function subscribe(
  email: string
): Promise<{ subscription: NewsletterSubscription } | { existing: true }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findByEmail(normalizedEmail);
  if (existing) return { existing: true };

  try {
    const [result] = await pool.execute(
      `INSERT INTO newsletter_subscriptions (email, subscribed_at, status) VALUES (?, NOW(), 'active')`,
      [normalizedEmail]
    );
    const header = result as { insertId: number };
    const [rows] = await pool.execute<NewsletterRow[]>(
      'SELECT * FROM newsletter_subscriptions WHERE id = ?',
      [header.insertId]
    );
    if (!rows.length) throw new Error('Failed to read created subscription');
    return { subscription: rowToSubscription(rows[0]) };
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === 'ER_DUP_ENTRY') return { existing: true };
    throw err;
  }
}

/** Create subscription with optional subscribed_at and status (for dashboard). Returns existing if email already in table. */
export async function createWithDetails(
  email: string,
  subscribed_at?: string,
  status: 'active' | 'unsubscribed' = 'active'
): Promise<{ subscription: NewsletterSubscription } | { existing: true }> {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await findByEmail(normalizedEmail);
  if (existing) return { existing: true };
  try {
    const subAt = subscribed_at && subscribed_at.trim() ? subscribed_at.trim() : null;
    const [result] = await pool.execute(
      subAt
        ? `INSERT INTO newsletter_subscriptions (email, subscribed_at, status) VALUES (?, ?, ?)`
        : `INSERT INTO newsletter_subscriptions (email, subscribed_at, status) VALUES (?, NOW(), ?)`,
      subAt ? [normalizedEmail, subAt, status] : [normalizedEmail, status]
    );
    const header = result as { insertId: number };
    const sub = await findById(header.insertId);
    if (!sub) throw new Error('Failed to read created subscription');
    return { subscription: sub };
  } catch (err: unknown) {
    const mysqlErr = err as { code?: string };
    if (mysqlErr.code === 'ER_DUP_ENTRY') return { existing: true };
    throw err;
  }
}

export async function findByEmail(email: string): Promise<NewsletterSubscription | null> {
  const [rows] = await pool.execute<NewsletterRow[]>(
    'SELECT * FROM newsletter_subscriptions WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  if (!rows.length) return null;
  return rowToSubscription(rows[0]);
}

export async function findAll(): Promise<NewsletterSubscription[]> {
  const [rows] = await pool.execute<NewsletterRow[]>(
    'SELECT * FROM newsletter_subscriptions ORDER BY subscribed_at DESC'
  );
  return rows.map(rowToSubscription);
}

export async function update(
  id: number,
  data: { email?: string; subscribed_at?: string; status?: 'active' | 'unsubscribed' }
): Promise<NewsletterSubscription | null> {
  const sub = await findById(id);
  if (!sub) return null;

  const updates: string[] = [];
  const values: (string | number)[] = [];
  if (data.email !== undefined) {
    updates.push('email = ?');
    values.push(data.email.trim().toLowerCase());
  }
  if (data.subscribed_at !== undefined) {
    updates.push('subscribed_at = ?');
    values.push(data.subscribed_at);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    values.push(data.status);
  }
  if (updates.length === 0) return sub;
  values.push(id);
  await pool.execute(
    `UPDATE newsletter_subscriptions SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
}

export async function findById(id: number): Promise<NewsletterSubscription | null> {
  const [rows] = await pool.execute<NewsletterRow[]>(
    'SELECT * FROM newsletter_subscriptions WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToSubscription(rows[0]);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM newsletter_subscriptions WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
