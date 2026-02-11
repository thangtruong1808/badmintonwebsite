import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ServiceStringRow {
  id: number;
  name: string;
  image_url: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceStringColourRow {
  id: number;
  string_id: number;
  colour: string;
  display_order: number;
  created_at?: string;
}

export interface ServiceTensionRow {
  id: number;
  label: string;
  display_order: number;
  created_at?: string;
}

export interface ServiceStencilRow {
  id: number;
  value: string;
  label: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceGripRow {
  id: number;
  value: string;
  label: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceStringWithColours extends ServiceStringRow {
  colours: ServiceStringColourRow[];
}

// ---- Strings ----
export const findAllStrings = async (): Promise<ServiceStringWithColours[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_strings ORDER BY display_order, id'
  );
  const strings = rows.map((r) => ({
    id: r.id,
    name: r.name,
    image_url: r.image_url ?? null,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
    colours: [] as ServiceStringColourRow[],
  }));

  for (const s of strings) {
    const [colourRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM service_string_colours WHERE string_id = ? ORDER BY display_order, id',
      [s.id]
    );
    s.colours = colourRows.map((c) => ({
      id: c.id,
      string_id: c.string_id,
      colour: c.colour,
      display_order: c.display_order,
      created_at: c.created_at ? String(c.created_at) : undefined,
    }));
  }
  return strings;
};

export const findStringById = async (id: number): Promise<ServiceStringRow | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_strings WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    image_url: r.image_url ?? null,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
};

export const createString = async (data: {
  name: string;
  image_url?: string | null;
  display_order?: number;
}): Promise<ServiceStringRow> => {
  const [result] = await pool.execute(
    'INSERT INTO service_strings (name, image_url, display_order) VALUES (?, ?, ?)',
    [data.name, data.image_url ?? null, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findStringById(header.insertId);
  if (!created) throw new Error('Failed to read created string');
  return created;
};

export const updateString = async (
  id: number,
  data: Partial<{ name: string; image_url: string | null; display_order: number }>
): Promise<ServiceStringRow | null> => {
  const existing = await findStringById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.image_url !== undefined) {
    updates.push('image_url = ?');
    values.push(data.image_url);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE service_strings SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findStringById(id);
};

export const removeString = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM service_strings WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};

// ---- String Colours ----
export const findColoursByStringId = async (
  stringId: number
): Promise<ServiceStringColourRow[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_string_colours WHERE string_id = ? ORDER BY display_order, id',
    [stringId]
  );
  return rows.map((c) => ({
    id: c.id,
    string_id: c.string_id,
    colour: c.colour,
    display_order: c.display_order,
    created_at: c.created_at ? String(c.created_at) : undefined,
  }));
};

export const createColour = async (data: {
  string_id: number;
  colour: string;
  display_order?: number;
}): Promise<ServiceStringColourRow> => {
  const [result] = await pool.execute(
    'INSERT INTO service_string_colours (string_id, colour, display_order) VALUES (?, ?, ?)',
    [data.string_id, data.colour, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_string_colours WHERE id = ?',
    [header.insertId]
  );
  const r = rows[0];
  return {
    id: r.id,
    string_id: r.string_id,
    colour: r.colour,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
};

export const updateColour = async (
  id: number,
  data: Partial<{ colour: string; display_order: number }>
): Promise<ServiceStringColourRow | null> => {
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.colour !== undefined) {
    updates.push('colour = ?');
    values.push(data.colour);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return null;
  values.push(id);
  await pool.execute(
    `UPDATE service_string_colours SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_string_colours WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    string_id: r.string_id,
    colour: r.colour,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
};

export const removeColour = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM service_string_colours WHERE id = ?', [
    id,
  ]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};

// ---- Tensions ----
export const findAllTensions = async (): Promise<ServiceTensionRow[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_tensions ORDER BY display_order, id'
  );
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  }));
};

export const findTensionById = async (id: number): Promise<ServiceTensionRow | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_tensions WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
};

export const createTension = async (data: {
  label: string;
  display_order?: number;
}): Promise<ServiceTensionRow> => {
  const [result] = await pool.execute(
    'INSERT INTO service_tensions (label, display_order) VALUES (?, ?)',
    [data.label, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findTensionById(header.insertId);
  if (!created) throw new Error('Failed to read created tension');
  return created;
};

export const updateTension = async (
  id: number,
  data: Partial<{ label: string; display_order: number }>
): Promise<ServiceTensionRow | null> => {
  const existing = await findTensionById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.label !== undefined) {
    updates.push('label = ?');
    values.push(data.label);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE service_tensions SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findTensionById(id);
};

export const removeTension = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM service_tensions WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};

// ---- Stencils ----
export const findAllStencils = async (): Promise<ServiceStencilRow[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_stencils ORDER BY display_order, id'
  );
  return rows.map((r) => ({
    id: r.id,
    value: r.value ?? '',
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  }));
};

export const findStencilById = async (id: number): Promise<ServiceStencilRow | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_stencils WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    value: r.value ?? '',
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
};

export const createStencil = async (data: {
  value?: string;
  label: string;
  display_order?: number;
}): Promise<ServiceStencilRow> => {
  const [result] = await pool.execute(
    'INSERT INTO service_stencils (value, label, display_order) VALUES (?, ?, ?)',
    [data.value ?? '', data.label, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findStencilById(header.insertId);
  if (!created) throw new Error('Failed to read created stencil');
  return created;
};

export const updateStencil = async (
  id: number,
  data: Partial<{ value: string; label: string; display_order: number }>
): Promise<ServiceStencilRow | null> => {
  const existing = await findStencilById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.value !== undefined) {
    updates.push('value = ?');
    values.push(data.value);
  }
  if (data.label !== undefined) {
    updates.push('label = ?');
    values.push(data.label);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE service_stencils SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findStencilById(id);
};

export const removeStencil = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM service_stencils WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};

// ---- Grips ----
export const findAllGrips = async (): Promise<ServiceGripRow[]> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_grips ORDER BY display_order, id'
  );
  return rows.map((r) => ({
    id: r.id,
    value: r.value ?? '',
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  }));
};

export const findGripById = async (id: number): Promise<ServiceGripRow | null> => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM service_grips WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    value: r.value ?? '',
    label: r.label,
    display_order: r.display_order,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
};

export const createGrip = async (data: {
  value?: string;
  label: string;
  display_order?: number;
}): Promise<ServiceGripRow> => {
  const [result] = await pool.execute(
    'INSERT INTO service_grips (value, label, display_order) VALUES (?, ?, ?)',
    [data.value ?? '', data.label, data.display_order ?? 0]
  );
  const header = result as { insertId: number };
  const created = await findGripById(header.insertId);
  if (!created) throw new Error('Failed to read created grip');
  return created;
};

export const updateGrip = async (
  id: number,
  data: Partial<{ value: string; label: string; display_order: number }>
): Promise<ServiceGripRow | null> => {
  const existing = await findGripById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.value !== undefined) {
    updates.push('value = ?');
    values.push(data.value);
  }
  if (data.label !== undefined) {
    updates.push('label = ?');
    values.push(data.label);
  }
  if (data.display_order !== undefined) {
    updates.push('display_order = ?');
    values.push(data.display_order);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE service_grips SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findGripById(id);
};

export const removeGrip = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM service_grips WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
};
