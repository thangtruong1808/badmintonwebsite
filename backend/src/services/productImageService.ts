import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ProductImageRow {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  created_at?: string;
}

interface ProductImageDbRow extends RowDataPacket {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  created_at: Date | string | null;
}

function rowToProductImage(r: ProductImageDbRow): ProductImageRow {
  return {
    id: r.id,
    product_id: r.product_id,
    image_url: r.image_url,
    display_order: Number(r.display_order),
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
}

export const findByProductId = async (productId: number): Promise<ProductImageRow[]> => {
  const [rows] = await pool.execute<ProductImageDbRow[]>(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC, id ASC',
    [productId]
  );
  return rows.map(rowToProductImage);
};

export const create = async (productId: number, imageUrl: string, displayOrder: number): Promise<ProductImageRow> => {
  const [result] = await pool.execute(
    'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
    [productId, imageUrl, displayOrder]
  );
  const header = result as { insertId: number };
  const [rows] = await pool.execute<ProductImageDbRow[]>(
    'SELECT * FROM product_images WHERE id = ?',
    [header.insertId]
  );
  if (!rows.length) throw new Error('Failed to read created product image');
  return rowToProductImage(rows[0]);
};

export const createMany = async (
  productId: number,
  imageUrls: string[]
): Promise<ProductImageRow[]> => {
  const created: ProductImageRow[] = [];
  for (let i = 0; i < imageUrls.length; i++) {
    const img = await create(productId, imageUrls[i], i);
    created.push(img);
  }
  return created;
};

export const deleteByProductId = async (productId: number): Promise<number> => {
  const [result] = await pool.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
  const header = result as { affectedRows: number };
  return header.affectedRows;
};

export const replaceForProduct = async (
  productId: number,
  imageUrls: string[]
): Promise<ProductImageRow[]> => {
  await deleteByProductId(productId);
  return createMany(productId, imageUrls);
};
