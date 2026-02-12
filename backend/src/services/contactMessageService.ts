import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface ContactDbRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToContact(r: ContactDbRow): ContactMessageRow {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? null,
    subject: r.subject,
    message: r.message,
    status: r.status,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const create = async (data: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}): Promise<ContactMessageRow> => {
  const phone = data.phone ?? null;
  const [result] = await pool.execute(
    'INSERT INTO contact_messages (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.email, phone, data.subject, data.message, 'new']
  );
  const id = (result as { insertId: number }).insertId;
  const created = await findById(id);
  if (!created) throw new Error('Contact message create: findById failed');
  return created;
};

export const findAll = async (): Promise<ContactMessageRow[]> => {
  const [rows] = await pool.execute<ContactDbRow[]>(
    'SELECT * FROM contact_messages ORDER BY created_at DESC'
  );
  return rows.map(rowToContact);
};

export const findById = async (id: number): Promise<ContactMessageRow | null> => {
  const [rows] = await pool.execute<ContactDbRow[]>(
    'SELECT * FROM contact_messages WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToContact(rows[0]);
};

export const update = async (
  id: number,
  data: Partial<{ status: string }>
): Promise<ContactMessageRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  if (data.status === undefined) return existing;
  await pool.execute('UPDATE contact_messages SET status = ? WHERE id = ?', [data.status, id]);
  return findById(id);
};
