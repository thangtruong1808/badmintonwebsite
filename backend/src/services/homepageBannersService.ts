import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface HomepageBannerRow {
  id: number;
  title: string | null;
  cloudinary_public_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface DbRow extends RowDataPacket {
  id: number;
  title: string | null;
  cloudinary_public_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToBanner(r: DbRow): HomepageBannerRow {
  return {
    id: r.id,
    title: r.title ?? null,
    cloudinary_public_id: r.cloudinary_public_id,
    image_url: r.image_url,
    alt_text: r.alt_text,
    display_order: r.display_order,
    is_active: Boolean(r.is_active),
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

/** Public: active banners only, ordered for carousel */
export const findAllActive = async (): Promise<HomepageBannerRow[]> => {
  const [rows] = await pool.execute<DbRow[]>(
    'SELECT * FROM homepage_banners WHERE is_active = TRUE ORDER BY display_order ASC, id ASC'
  );
  return rows.map(rowToBanner);
};

/** Admin: all banners */
export const findAll = async (): Promise<HomepageBannerRow[]> => {
  const [rows] = await pool.execute<DbRow[]>(
    'SELECT * FROM homepage_banners ORDER BY display_order ASC, id ASC'
  );
  return rows.map(rowToBanner);
};

export const findById = async (id: number): Promise<HomepageBannerRow | null> => {
  const [rows] = await pool.execute<DbRow[]>(
    'SELECT * FROM homepage_banners WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToBanner(rows[0]);
};

export const create = async (data: {
  title?: string | null;
  cloudinary_public_id: string;
  image_url: string;
  alt_text: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<HomepageBannerRow> => {
  const [result] = await pool.execute(
    `INSERT INTO homepage_banners (title, cloudinary_public_id, image_url, alt_text, display_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.title ?? null,
      data.cloudinary_public_id,
      data.image_url,
      data.alt_text,
      data.display_order ?? 0,
      data.is_active !== false ? 1 : 0,
    ]
  );
  const header = result as { insertId: number };
  const created = await findById(header.insertId);
  if (!created) throw new Error('Failed to read created banner');
  return created;
};

export const update = async (
  id: number,
  data: Partial<{
    title: string | null;
    cloudinary_public_id: string;
    image_url: string;
    alt_text: string;
    display_order: number;
    is_active: boolean;
  }>
): Promise<HomepageBannerRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.cloudinary_public_id !== undefined) {
    updates.push('cloudinary_public_id = ?');
    values.push(data.cloudinary_public_id);
  }
  if (data.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(data.image_url);
  }
  if (data.alt_text !== undefined) {
    updates.push('alt_text = ?');
    values.push(data.alt_text);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (data.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(data.is_active ? 1 : 0);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE homepage_banners SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM homepage_banners WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
