import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../db/connection.js';
import { v4 as uuidv4 } from 'uuid';

export type DisputeStatus = 
  | 'warning_needs_response'
  | 'warning_under_review'
  | 'warning_closed'
  | 'needs_response'
  | 'under_review'
  | 'won'
  | 'lost';

export interface DisputeRow {
  id: string;
  user_id: string | null;
  payment_id: string | null;
  stripe_dispute_id: string;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  reason: string | null;
  status: string;
  evidence_due_by: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDisputeData {
  stripeDisputeId: string;
  stripeChargeId?: string | null;
  userId?: string | null;
  paymentId?: string | null;
  amount: number;
  currency?: string;
  reason?: string | null;
  status: string;
  evidenceDueBy?: Date | null;
}

interface DisputeDbRow extends RowDataPacket {
  id: string;
  user_id: string | null;
  payment_id: string | null;
  stripe_dispute_id: string;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  reason: string | null;
  status: string;
  evidence_due_by: Date | string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

function rowToDispute(r: DisputeDbRow): DisputeRow {
  return {
    id: r.id,
    user_id: r.user_id,
    payment_id: r.payment_id,
    stripe_dispute_id: r.stripe_dispute_id,
    stripe_charge_id: r.stripe_charge_id,
    amount: Number(r.amount),
    currency: r.currency,
    reason: r.reason,
    status: r.status,
    evidence_due_by: r.evidence_due_by ? String(r.evidence_due_by) : null,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

export const findAll = async (): Promise<DisputeRow[]> => {
  const [rows] = await pool.execute<DisputeDbRow[]>(
    'SELECT * FROM disputes ORDER BY created_at DESC'
  );
  return rows.map(rowToDispute);
};

export const findById = async (id: string): Promise<DisputeRow | null> => {
  const [rows] = await pool.execute<DisputeDbRow[]>(
    'SELECT * FROM disputes WHERE id = ?',
    [id]
  );
  return rows.length > 0 ? rowToDispute(rows[0]) : null;
};

export const findByStripeDisputeId = async (
  stripeDisputeId: string
): Promise<DisputeRow | null> => {
  const [rows] = await pool.execute<DisputeDbRow[]>(
    'SELECT * FROM disputes WHERE stripe_dispute_id = ?',
    [stripeDisputeId]
  );
  return rows.length > 0 ? rowToDispute(rows[0]) : null;
};

export const findByUserId = async (userId: string): Promise<DisputeRow[]> => {
  const [rows] = await pool.execute<DisputeDbRow[]>(
    'SELECT * FROM disputes WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows.map(rowToDispute);
};

export const findByPaymentId = async (paymentId: string): Promise<DisputeRow[]> => {
  const [rows] = await pool.execute<DisputeDbRow[]>(
    'SELECT * FROM disputes WHERE payment_id = ? ORDER BY created_at DESC',
    [paymentId]
  );
  return rows.map(rowToDispute);
};

export const create = async (data: CreateDisputeData): Promise<DisputeRow> => {
  const id = uuidv4();
  const {
    stripeDisputeId,
    stripeChargeId = null,
    userId = null,
    paymentId = null,
    amount,
    currency = 'AUD',
    reason = null,
    status,
    evidenceDueBy = null,
  } = data;

  const evidenceDueByStr = evidenceDueBy 
    ? evidenceDueBy.toISOString().slice(0, 19).replace('T', ' ')
    : null;

  await pool.execute<ResultSetHeader>(
    `INSERT INTO disputes (id, user_id, payment_id, stripe_dispute_id, stripe_charge_id, amount, currency, reason, status, evidence_due_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, paymentId, stripeDisputeId, stripeChargeId, amount, currency, reason, status, evidenceDueByStr]
  );

  const created = await findById(id);
  if (!created) {
    throw new Error('Failed to create dispute record');
  }
  return created;
};

export const updateStatus = async (
  stripeDisputeId: string,
  status: string,
  reason?: string | null
): Promise<DisputeRow | null> => {
  const updates: string[] = ['status = ?'];
  const params: (string | null)[] = [status];

  if (reason !== undefined) {
    updates.push('reason = ?');
    params.push(reason);
  }

  params.push(stripeDisputeId);

  await pool.execute<ResultSetHeader>(
    `UPDATE disputes SET ${updates.join(', ')} WHERE stripe_dispute_id = ?`,
    params
  );

  return findByStripeDisputeId(stripeDisputeId);
};

export const getDisputeStats = async (): Promise<{
  total: number;
  totalAmount: number;
  byStatus: Record<string, number>;
  byReason: Record<string, number>;
}> => {
  const [totalRows] = await pool.execute<(RowDataPacket & { count: number; total_amount: number })[]>(
    'SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_amount FROM disputes'
  );

  const [statusRows] = await pool.execute<(RowDataPacket & { status: string; count: number })[]>(
    'SELECT status, COUNT(*) as count FROM disputes GROUP BY status'
  );

  const [reasonRows] = await pool.execute<(RowDataPacket & { reason: string; count: number })[]>(
    'SELECT COALESCE(reason, "unknown") as reason, COUNT(*) as count FROM disputes GROUP BY reason'
  );

  const byStatus: Record<string, number> = {};
  for (const row of statusRows) {
    byStatus[row.status] = row.count;
  }

  const byReason: Record<string, number> = {};
  for (const row of reasonRows) {
    byReason[row.reason] = row.count;
  }

  return {
    total: totalRows[0]?.count ?? 0,
    totalAmount: Number(totalRows[0]?.total_amount ?? 0),
    byStatus,
    byReason,
  };
};

export const deleteDispute = async (id: string): Promise<boolean> => {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM disputes WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
};
