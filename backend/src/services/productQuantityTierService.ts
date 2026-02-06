import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface ProductQuantityTierRow {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  display_order: number;
  created_at?: string;
}

interface ProductQuantityTierDbRow extends RowDataPacket {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  display_order: number;
  created_at: Date | string | null;
}

function rowToTier(r: ProductQuantityTierDbRow): ProductQuantityTierRow {
  return {
    id: r.id,
    product_id: r.product_id,
    quantity: Number(r.quantity),
    unit_price: Number(r.unit_price),
    display_order: Number(r.display_order),
    created_at: r.created_at ? String(r.created_at) : undefined,
  };
}

export const findByProductId = async (productId: number): Promise<ProductQuantityTierRow[]> => {
  const [rows] = await pool.execute<ProductQuantityTierDbRow[]>(
    'SELECT * FROM product_quantity_tiers WHERE product_id = ? ORDER BY display_order ASC, quantity ASC',
    [productId]
  );
  return rows.map(rowToTier);
};

export const replaceForProduct = async (
  productId: number,
  tiers: { quantity: number; unit_price: number }[]
): Promise<ProductQuantityTierRow[]> => {
  await pool.execute('DELETE FROM product_quantity_tiers WHERE product_id = ?', [productId]);
  const created: ProductQuantityTierRow[] = [];
  for (let i = 0; i < tiers.length; i++) {
    const t = tiers[i];
    const [result] = await pool.execute(
      'INSERT INTO product_quantity_tiers (product_id, quantity, unit_price, display_order) VALUES (?, ?, ?, ?)',
      [productId, t.quantity, t.unit_price, i]
    );
    const header = result as { insertId: number };
    const [rows] = await pool.execute<ProductQuantityTierDbRow[]>(
      'SELECT * FROM product_quantity_tiers WHERE id = ?',
      [header.insertId]
    );
    if (rows.length) created.push(rowToTier(rows[0]));
  }
  return created;
};
