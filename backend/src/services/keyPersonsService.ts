import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface KeyPersonRow {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  description: string | null;
  image_url: string | null;
  cloudinary_public_id: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface DbRow extends RowDataPacket {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  description: string | null;
  image_url: string | null;
  cloudinary_public_id: string | null;
  display_order: number;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToKeyPerson(r: DbRow): KeyPersonRow {
  return {
    id: r.id,
    first_name: r.first_name,
    last_name: r.last_name,
    role: r.role,
    description: r.description ?? null,
    image_url: r.image_url ?? null,
    cloudinary_public_id: r.cloudinary_public_id ?? null,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

/** Public: all key persons ordered by display_order, then id */
export const findAll = async (): Promise<KeyPersonRow[]> => {
  const [rows] = await pool.execute<DbRow[]>(
    'SELECT * FROM key_persons ORDER BY display_order ASC, id ASC'
  );
  return rows.map(rowToKeyPerson);
};

export const findById = async (id: number): Promise<KeyPersonRow | null> => {
  const [rows] = await pool.execute<DbRow[]>(
    'SELECT * FROM key_persons WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToKeyPerson(rows[0]);
};

export const create = async (data: {
  first_name: string;
  last_name: string;
  role: string;
  description?: string | null;
  image_url?: string | null;
  cloudinary_public_id?: string | null;
  display_order?: number;
}): Promise<KeyPersonRow> => {
  const [result] = await pool.execute(
    `INSERT INTO key_persons (first_name, last_name, role, description, image_url, cloudinary_public_id, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.first_name,
      data.last_name,
      data.role,
      data.description ?? null,
      data.image_url ?? null,
      data.cloudinary_public_id ?? null,
      data.display_order ?? 0,
    ]
  );
  const header = result as { insertId: number };
  const created = await findById(header.insertId);
  if (!created) throw new Error('Failed to read created key person');
  return created;
};

export const update = async (
  id: number,
  data: Partial<{
    first_name: string;
    last_name: string;
    role: string;
    description: string | null;
    image_url: string | null;
    cloudinary_public_id: string | null;
    display_order: number;
  }>
): Promise<KeyPersonRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.first_name !== undefined) {
    updates.push('first_name = ?');
    values.push(data.first_name);
  }
  if (data.last_name !== undefined) {
    updates.push('last_name = ?');
    values.push(data.last_name);
  }
  if (data.role !== undefined) {
    updates.push('role = ?');
    values.push(data.role);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(data.image_url);
  }
  if (data.cloudinary_public_id !== undefined) {
    updates.push('cloudinary_public_id = ?');
    values.push(data.cloudinary_public_id);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE key_persons SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM key_persons WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};
