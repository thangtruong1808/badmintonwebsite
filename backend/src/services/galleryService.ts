import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface GalleryPhotoRow {
  id: number;
  src: string;
  alt: string;
  type: string;
  display_order: number;
  created_at?: string;
}

export interface GalleryVideoRow {
  id: number;
  title: string;
  embed_id: string;
  thumbnail: string | null;
  category: string;
  display_order: number;
  created_at?: string;
}

interface PhotoDbRow extends RowDataPacket {
  id: number;
  src: string;
  alt: string;
  type: string;
  display_order: number;
  created_at: Date | string | null;
}

interface VideoDbRow extends RowDataPacket {
  id: number;
  title: string;
  embed_id: string;
  thumbnail: string | null;
  category: string;
  display_order: number;
  created_at: Date | string | null;
}

function rowToPhoto(r: PhotoDbRow): GalleryPhotoRow {
  return {
    id: r.id,
    src: r.src,
    alt: r.alt,
    type: r.type,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
}

function rowToVideo(r: VideoDbRow): GalleryVideoRow {
  return {
    id: r.id,
    title: r.title,
    embed_id: r.embed_id,
    thumbnail: r.thumbnail ?? null,
    category: r.category,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
}

// Photos
export const findAllPhotos = async (): Promise<GalleryPhotoRow[]> => {
  const [rows] = await pool.execute<PhotoDbRow[]>(
    'SELECT * FROM gallery_photos ORDER BY type, display_order, id'
  );
  return rows.map(rowToPhoto);
};

export const findPhotoById = async (id: number): Promise<GalleryPhotoRow | null> => {
  const [rows] = await pool.execute<PhotoDbRow[]>(
    'SELECT * FROM gallery_photos WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToPhoto(rows[0]);
};

export const createPhoto = async (data: {
  src: string;
  alt: string;
  type: string;
  display_order?: number;
}): Promise<GalleryPhotoRow> => {
  const [result] = await pool.execute(
    'INSERT INTO gallery_photos (src, alt, type, display_order) VALUES (?, ?, ?, ?)',
    [data.src, data.alt, data.type, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findPhotoById(header.insertId);
  if (!created) throw new Error('Failed to read created photo');
  return created;
};

export const updatePhoto = async (
  id: number,
  data: Partial<{ src: string; alt: string; type: string; display_order: number }>
): Promise<GalleryPhotoRow | null> => {
  const existing = await findPhotoById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: (string | number)[] = [];
  if (data.src !== undefined) {
    updates.push('src = ?');
    values.push(data.src);
  }
  if (data.alt !== undefined) {
    updates.push('alt = ?');
    values.push(data.alt);
  }
  if (data.type !== undefined) {
    updates.push('type = ?');
    values.push(data.type);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE gallery_photos SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findPhotoById(id);
};

export const removePhoto = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM gallery_photos WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}

// Videos (YouTube embed_id only)
export const findAllVideos = async (): Promise<GalleryVideoRow[]> => {
  const [rows] = await pool.execute<VideoDbRow[]>(
    'SELECT * FROM gallery_videos ORDER BY created_at DESC, id DESC'
  );
  return rows.map(rowToVideo);
};

export const findVideoById = async (id: number): Promise<GalleryVideoRow | null> => {
  const [rows] = await pool.execute<VideoDbRow[]>(
    'SELECT * FROM gallery_videos WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToVideo(rows[0]);
};

export const createVideo = async (data: {
  title: string;
  embed_id: string;
  thumbnail?: string | null;
  category: string;
  display_order?: number;
}): Promise<GalleryVideoRow> => {
  const [result] = await pool.execute(
    'INSERT INTO gallery_videos (title, embed_id, thumbnail, category, display_order) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.embed_id, data.thumbnail ?? null, data.category, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findVideoById(header.insertId);
  if (!created) throw new Error('Failed to read created video');
  return created;
};

export const updateVideo = async (
  id: number,
  data: Partial<{ title: string; embed_id: string; thumbnail: string | null; category: string; display_order: number }>
): Promise<GalleryVideoRow | null> => {
  const existing = await findVideoById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: (string | number | null)[] = [];
  if (data.title !== undefined) {
    updates.push('title = ?');
    values.push(data.title);
  }
  if (data.embed_id !== undefined) {
    updates.push('embed_id = ?');
    values.push(data.embed_id);
  }
  if (data.thumbnail !== undefined) {
    updates.push('thumbnail = ?');
    values.push(data.thumbnail);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE gallery_videos SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findVideoById(id);
};

export const removeVideo = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM gallery_videos WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
