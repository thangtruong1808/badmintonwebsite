import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ServiceRequestRow {
  id: number;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  racket_brand: string;
  racket_model: string;
  string_type: string;
  string_colour: string | null;
  tension: string;
  stencil: boolean;
  grip: boolean;
  grommet_replacement: string | null;
  message: string | null;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface SrDbRow extends RowDataPacket {
  id: number;
  user_id: string | null;
  name: string;
  email: string;
  phone: string;
  racket_brand: string;
  racket_model: string;
  string_type: string;
  string_colour: string | null;
  tension: string;
  stencil: boolean;
  grip: boolean;
  grommet_replacement: string | null;
  message: string | null;
  status: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToSr(r: SrDbRow): ServiceRequestRow {
  return {
    id: r.id,
    user_id: r.user_id ?? null,
    name: r.name,
    email: r.email,
    phone: r.phone,
    racket_brand: r.racket_brand,
    racket_model: r.racket_model,
    string_type: r.string_type,
    string_colour: r.string_colour ?? null,
    tension: r.tension,
    stencil: Boolean(r.stencil),
    grip: Boolean(r.grip),
    grommet_replacement: r.grommet_replacement ?? null,
    message: r.message ?? null,
    status: r.status,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<ServiceRequestRow[]> => {
  const [rows] = await pool.execute<SrDbRow[]>(
    'SELECT * FROM service_requests ORDER BY created_at DESC'
  );
  return rows.map(rowToSr);
};

export const findById = async (id: number): Promise<ServiceRequestRow | null> => {
  const [rows] = await pool.execute<SrDbRow[]>(
    'SELECT * FROM service_requests WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToSr(rows[0]);
};

export const update = async (
  id: number,
  data: Partial<{ status: string }>
): Promise<ServiceRequestRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  if (data.status === undefined) return existing;
  await pool.execute('UPDATE service_requests SET status = ? WHERE id = ?', [data.status, id]);
  return findById(id);
};
