import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  in_stock: boolean;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ProductDbRow extends RowDataPacket {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  image: string;
  category: string;
  in_stock: boolean;
  description: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToProduct(r: ProductDbRow): ProductRow {
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price),
    original_price: r.original_price != null ? Number(r.original_price) : null,
    image: r.image,
    category: r.category,
    in_stock: Boolean(r.in_stock),
    description: r.description ?? null,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<ProductRow[]> => {
  const [rows] = await pool.execute<ProductDbRow[]>(
    'SELECT * FROM products ORDER BY created_at DESC'
  );
  return rows.map(rowToProduct);
};

export const findById = async (id: number): Promise<ProductRow | null> => {
  const [rows] = await pool.execute<ProductDbRow[]>(
    'SELECT * FROM products WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  return rowToProduct(rows[0]);
};

export const create = async (data: {
  name: string;
  price: number;
  original_price?: number | null;
  image: string;
  category: string;
  in_stock?: boolean;
  description?: string | null;
}): Promise<ProductRow> => {
  const [result] = await pool.execute(
    `INSERT INTO products (name, price, original_price, image, category, in_stock, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.price,
      data.original_price ?? null,
      data.image || '',
      data.category,
      data.in_stock !== false ? 1 : 0,
      data.description ?? null,
    ]
  );
  const header = result as { insertId: number };
  const created = await findById(header.insertId);
  if (!created) throw new Error('Failed to read created product');
  return created;
};

export const update = async (
  id: number,
  data: Partial<{
    name: string;
    price: number;
    original_price: number | null;
    image: string;
    category: string;
    in_stock: boolean;
    description: string | null;
  }>
): Promise<ProductRow | null> => {
  const existing = await findById(id);
  if (!existing) return null;
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.price !== undefined) {
    updates.push('price = ?');
    values.push(data.price);
  }
  if (data.original_price !== undefined) {
    updates.push('original_price = ?');
    values.push(data.original_price);
  }
  if (data.image !== undefined) {
    updates.push('image = ?');
    values.push(data.image);
  }
  if (data.category !== undefined) {
    updates.push('category = ?');
    values.push(data.category);
  }
  if (data.in_stock !== undefined) {
    updates.push('in_stock = ?');
    values.push(data.in_stock ? 1 : 0);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (updates.length === 0) return existing;
  values.push(id);
  await pool.execute(
    `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
};

export const remove = async (id: number): Promise<boolean> => {
  const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  const header = result as { affectedRows: number };
  return header.affectedRows > 0;
}
