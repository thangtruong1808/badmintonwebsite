import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id: string | null;
  metadata: unknown;
  created_at?: string;
  updated_at?: string;
}

interface PaymentDbRow extends RowDataPacket {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id: string | null;
  metadata: unknown;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToPayment(r: PaymentDbRow): PaymentRow {
  return {
    id: r.id,
    user_id: r.user_id,
    amount: Number(r.amount),
    currency: r.currency,
    status: r.status,
    payment_method: r.payment_method,
    stripe_payment_intent_id: r.stripe_payment_intent_id ?? null,
    metadata: r.metadata ?? null,
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
