import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'expired' | 'disputed' | 'requires_action';
export type PaymentMethod = 'stripe' | 'points' | 'mixed';

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_method_type: string | null;
  metadata: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentData {
  userId: string;
  amount: number;
  currency?: string;
  status?: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
  metadata?: Record<string, unknown> | null;
}

interface PaymentDbRow extends RowDataPacket {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_method_type: string | null;
  metadata: unknown;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToPayment(r: PaymentDbRow): PaymentRow {
  let parsedMetadata: Record<string, unknown> | null = null;
  if (r.metadata) {
    if (typeof r.metadata === 'string') {
      try {
        parsedMetadata = JSON.parse(r.metadata);
      } catch {
        parsedMetadata = null;
      }
    } else if (typeof r.metadata === 'object') {
      parsedMetadata = r.metadata as Record<string, unknown>;
    }
  }

  return {
    id: r.id,
    user_id: r.user_id,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status as PaymentStatus,
    payment_method: r.payment_method as PaymentMethod,
    stripe_payment_intent_id: r.stripe_payment_intent_id ?? null,
    stripe_checkout_session_id: r.stripe_checkout_session_id ?? null,
    stripe_payment_method_type: r.stripe_payment_method_type ?? null,
    metadata: parsedMetadata,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<PaymentRow[]> => {
  const [rows] = await pool.execute<PaymentDbRow[]>(
    'SELECT * FROM payments ORDER BY created_at DESC'
  );
  return rows.map(rowToPayment);
};

export const findById = async (id: string): Promise<PaymentRow | null> => {
  const [rows] = await pool.execute<PaymentDbRow[]>(
    'SELECT * FROM payments WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rowToPayment(rows[0]) : null;
};

export const findByStripeIntentId = async (
  stripePaymentIntentId: string
): Promise<PaymentRow | null> => {
  const [rows] = await pool.execute<PaymentDbRow[]>(
    'SELECT * FROM payments WHERE stripe_payment_intent_id = ?',
    [stripePaymentIntentId]
  );
  return rows.length > 0 ? rowToPayment(rows[0]) : null;
};

export const findByStripeCheckoutSessionId = async (
  sessionId: string
): Promise<PaymentRow | null> => {
  const [rows] = await pool.execute<PaymentDbRow[]>(
    'SELECT * FROM payments WHERE stripe_checkout_session_id = ?',
    [sessionId]
  );
  return rows.length > 0 ? rowToPayment(rows[0]) : null;
};

export const findByUserId = async (userId: string): Promise<PaymentRow[]> => {
  const [rows] = await pool.execute<PaymentDbRow[]>(
    'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(rowToPayment);
};

export const create = async (data: CreatePaymentData): Promise<PaymentRow> => {
  const id = uuidv4();
  const {
    userId,
    amount,
    currency = 'AUD',
    status = 'pending',
    paymentMethod,
    stripePaymentIntentId = null,
    stripeCheckoutSessionId = null,
    metadata = null,
  } = data;

  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  await pool.execute<ResultSetHeader>(
    `INSERT INTO payments (id, user_id, amount, currency, status, payment_method, stripe_payment_intent_id, stripe_checkout_session_id, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, amount, currency, status, paymentMethod, stripePaymentIntentId, stripeCheckoutSessionId, metadataJson]
  );

  const created = await findById(id);
  if (!created) {
    throw new Error('Failed to create payment record');
  }
  return created;
};

export const updateStatus = async (
  id: string,
  status: PaymentStatus,
  stripePaymentIntentId?: string | null
): Promise<PaymentRow | null> => {
  const updates: string[] = ['status = ?'];
  const params: (string | null)[] = [status];

  if (stripePaymentIntentId !== undefined) {
    updates.push('stripe_payment_intent_id = ?');
    params.push(stripePaymentIntentId);
  }

  params.push(id);

  await pool.execute<ResultSetHeader>(
    `UPDATE payments SET ${updates.join(', ')} WHERE id = ?`,
    params
  );

  return findById(id);
};

export const updateByStripeCheckoutSessionId = async (
  sessionId: string,
  status: PaymentStatus,
  stripePaymentIntentId?: string | null,
  stripePaymentMethodType?: string | null
): Promise<PaymentRow | null> => {
  const updates: string[] = ['status = ?'];
  const params: (string | null)[] = [status];

  if (stripePaymentIntentId !== undefined) {
    updates.push('stripe_payment_intent_id = ?');
    params.push(stripePaymentIntentId);
  }

  if (stripePaymentMethodType !== undefined) {
    updates.push('stripe_payment_method_type = ?');
    params.push(stripePaymentMethodType);
  }

  params.push(sessionId);

  await pool.execute<ResultSetHeader>(
    `UPDATE payments SET ${updates.join(', ')} WHERE stripe_checkout_session_id = ?`,
    params
  );

  return findByStripeCheckoutSessionId(sessionId);
};

export const deletePayment = async (id: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM payments WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
