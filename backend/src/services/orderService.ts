/**
 * Order service for shop purchases.
 * Handles order creation and management.
 */
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  payment_id: string | null;
  status: OrderStatus;
  total: number;
  shipping_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  stripe_payment_intent_id: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

interface OrderDbRow extends RowDataPacket {
  id: string;
  user_id: string;
  payment_id: string | null;
  status: string;
  total: number;
  shipping_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  stripe_payment_intent_id: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

interface OrderItemDbRow extends RowDataPacket {
  id: string;
  order_id: string;
  product_id: number;
  quantity: number;
  unit_price: number;
}

function rowToOrder(r: OrderDbRow): OrderRow {
  return {
    id: r.id,
    user_id: r.user_id,
    payment_id: r.payment_id,
    status: r.status as OrderStatus,
    total: Number(r.total),
    shipping_name: r.shipping_name,
    shipping_email: r.shipping_email,
    shipping_phone: r.shipping_phone,
    shipping_address: r.shipping_address,
    stripe_payment_intent_id: r.stripe_payment_intent_id,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export interface CreateOrderData {
  userId: string;
  paymentId?: string;
  items: Array<{
    productId: number | string;
    quantity: number;
    price: number;
  }>;
  shippingName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  stripePaymentIntentId?: string | null;
}

export const findAll = async (): Promise<OrderRow[]> => {
  const [rows] = await pool.execute<OrderDbRow[]>(
    'SELECT * FROM orders ORDER BY created_at DESC'
  );
  return rows.map(rowToOrder);
};

export const findById = async (id: string): Promise<OrderRow | null> => {
  const [rows] = await pool.execute<OrderDbRow[]>(
    'SELECT * FROM orders WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;

  const order = rowToOrder(rows[0]);

  const [itemRows] = await pool.execute<OrderItemDbRow[]>(
    `SELECT oi.*, p.name as product_name 
     FROM order_items oi 
     LEFT JOIN products p ON oi.product_id = p.id 
     WHERE oi.order_id = ?`,
    [id]
  );

  order.items = itemRows.map((item) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: Number(item.product_id),
    product_name: (item as unknown as { product_name?: string }).product_name,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
  }));

  return order;
};

export const findByUserId = async (userId: string): Promise<OrderRow[]> => {
  const [rows] = await pool.execute<OrderDbRow[]>(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(rowToOrder);
};

export const create = async (data: CreateOrderData): Promise<OrderRow> => {
  const id = uuidv4();
  const {
    userId,
    paymentId = null,
    items,
    shippingName = null,
    shippingEmail = null,
    shippingPhone = null,
    shippingAddress = null,
    stripePaymentIntentId = null,
  } = data;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  await pool.execute<ResultSetHeader>(
    `INSERT INTO orders (id, user_id, payment_id, status, total, shipping_name, shipping_email, shipping_phone, shipping_address, stripe_payment_intent_id)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
    [id, userId, paymentId, total, shippingName, shippingEmail, shippingPhone, shippingAddress, stripePaymentIntentId]
  );

  for (const item of items) {
    const itemId = uuidv4();
    await pool.execute<ResultSetHeader>(
      `INSERT INTO order_items (id, order_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, id, item.productId, item.quantity, item.price]
    );
  }

  const created = await findById(id);
  if (!created) {
    throw new Error('Failed to create order');
  }
  return created;
};

export const createOrderFromCheckout = async (data: {
  userId: string;
  paymentId: string;
  items: Array<{ productId: number | string; quantity: number; price: number }>;
  stripePaymentIntentId?: string | null;
}): Promise<OrderRow> => {
  const order = await create({
    userId: data.userId,
    paymentId: data.paymentId,
    items: data.items,
    stripePaymentIntentId: data.stripePaymentIntentId,
  });

  await updateStatus(order.id, 'paid');

  return (await findById(order.id))!;
};

export const updateStatus = async (
  id: string,
  status: OrderStatus
): Promise<OrderRow | null> => {
  await pool.execute<ResultSetHeader>(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id]
  );
  return findById(id);
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  await pool.execute<ResultSetHeader>(
    'DELETE FROM order_items WHERE order_id = ?',
    [id]
  );

  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM orders WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
