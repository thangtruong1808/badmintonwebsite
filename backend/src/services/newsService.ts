import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface NewsRow {
  id: number;
  image: string | null;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  badge: string;
  category: string | null;
  link: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface NewsDbRow extends RowDataPacket {
  id: number;
  image: string | null;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  badge: string;
  category: string | null;
  link: string | null;
  display_order: number;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToNews(r: NewsDbRow): NewsRow {
  return {
    id: r.id,
    image: r.image ?? null,
    title: r.title,
    date: r.date ?? null,
    time: r.time ?? null,
    location: r.location ?? null,
    description: r.description ?? null,
    badge: r.badge,
    category: r.category ?? null,
    link: r.link ?? null,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<NewsRow[]> => {
  const [rows] = await pool.execute<NewsDbRow[]>(
    'SELECT * FROM news_articles ORDER BY display_order ASC, created_at DESC'
  );
  return rows.map(rowToNews);
};

export const findById = async (id: number): Promise<NewsRow | null> => {
  const [rows] = await pool.execute<NewsDbRow[]>(
    'SELECT * FROM news_articles WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToNews(rows[0]);
};

export const create = async (data: {
  image?: string | null;
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  description?: string | null;
  badge?: string;
  category?: string | null;
  link?: string | null;
  display_order?: number;
}): Promise<NewsRow> => {
  const [result] = await pool.execute(
    `INSERT INTO news_articles (image, title, date, time, location, description, badge, category, link, display_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.image ?? null,
      data.title,
      data.date ?? null,
      data.time ?? null,
      data.location ?? null,
      data.description ?? null,
      data.badge ?? 'OPEN',
      data.category ?? null,
      data.link ?? null,
      data.display_order ?? 0,
    ]
  );
  const header = result as { insertId: number };
  const created = await findById(header.insertId);
  if (!created) throw new Error('Failed to read created news article');
  return created;
};

export const update = async (
  id: number,
  data: Partial<{
    image: string | null;
    title: string;
    date: string | null;
    time: string | null;
    location: string | null;
    description: string | null;
    badge: string;
    category: string | null;
    link: string | null;
    display_order: number;
  }>
): Promise<NewsRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  const fields = ['image', 'title', 'date', 'time', 'location', 'description', 'badge', 'category', 'link', 'display_order'] as const;
  for (const key of fields) {
    if (data[key] !== undefined) {
      const col = key === 'display_order' ? 'display_order' : key;
      updates.push(`${col} = ?`);
      values.push(data[key]);
    }
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE news_articles SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM news_articles WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
