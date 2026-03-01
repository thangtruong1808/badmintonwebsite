import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export type StatsPeriod = 'day' | 'week' | 'month';

export interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  averagePaymentAmount: number;
  totalRefunds: number;
  totalDisputes: number;
  disputeRate: number;
  revenueByMethod: {
    stripe: number;
    points: number;
    mixed: number;
  };
  revenueByStripeType: Record<string, number>;
  paymentsByStatus: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
    expired: number;
    disputed: number;
    requires_action: number;
  };
  revenueOverTime: Array<{ date: string; amount: number }>;
  paymentCountOverTime: Array<{ date: string; count: number }>;
  disputesByStatus: Record<string, number>;
  disputesByReason: Record<string, number>;
}

function getDateRangeForPeriod(period: StatsPeriod): { start: Date; end: Date; groupFormat: string } {
  const end = new Date();
  const start = new Date();
  let groupFormat: string;

  switch (period) {
    case 'day':
      start.setDate(start.getDate() - 30);
      groupFormat = '%Y-%m-%d';
      break;
    case 'week':
      start.setDate(start.getDate() - 12 * 7);
      groupFormat = '%Y-%u';
      break;
    case 'month':
      start.setMonth(start.getMonth() - 12);
      groupFormat = '%Y-%m';
      break;
    default:
      start.setDate(start.getDate() - 30);
      groupFormat = '%Y-%m-%d';
  }

  return { start, end, groupFormat };
}

export const getPaymentStats = async (period: StatsPeriod = 'month'): Promise<PaymentStats> => {
  const { start, groupFormat } = getDateRangeForPeriod(period);
  const startStr = start.toISOString().slice(0, 19).replace('T', ' ');

  const [summaryRows] = await pool.execute<(RowDataPacket & {
    total_revenue: number;
    total_payments: number;
    avg_payment: number;
  })[]>(
    `SELECT 
      COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
      COUNT(*) as total_payments,
      COALESCE(AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END), 0) as avg_payment
    FROM payments
    WHERE created_at >= ?`,
    [startStr]
  );

  const [refundRows] = await pool.execute<(RowDataPacket & { total_refunds: number })[]>(
    `SELECT COUNT(*) as total_refunds FROM payments WHERE status = 'refunded' AND created_at >= ?`,
    [startStr]
  );

  const [disputeCountRows] = await pool.execute<(RowDataPacket & { total_disputes: number })[]>(
    `SELECT COUNT(*) as total_disputes FROM disputes WHERE created_at >= ?`,
    [startStr]
  );

  const [methodRows] = await pool.execute<(RowDataPacket & { 
    payment_method: string; 
    total: number 
  })[]>(
    `SELECT payment_method, COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total
     FROM payments
     WHERE created_at >= ?
     GROUP BY payment_method`,
    [startStr]
  );

  const [stripeTypeRows] = await pool.execute<(RowDataPacket & { 
    stripe_payment_method_type: string | null; 
    total: number 
  })[]>(
    `SELECT 
       COALESCE(stripe_payment_method_type, 'unknown') as stripe_payment_method_type, 
       COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total
     FROM payments
     WHERE created_at >= ? AND payment_method = 'stripe'
     GROUP BY stripe_payment_method_type`,
    [startStr]
  );

  const [statusRows] = await pool.execute<(RowDataPacket & { 
    status: string; 
    count: number 
  })[]>(
    `SELECT status, COUNT(*) as count
     FROM payments
     WHERE created_at >= ?
     GROUP BY status`,
    [startStr]
  );

  const [revenueTimeRows] = await pool.execute<(RowDataPacket & { 
    date_group: string; 
    total: number 
  })[]>(
    `SELECT DATE_FORMAT(created_at, '${groupFormat}') as date_group, 
            COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total
     FROM payments
     WHERE created_at >= ?
     GROUP BY date_group
     ORDER BY date_group ASC`,
    [startStr]
  );

  const [paymentCountTimeRows] = await pool.execute<(RowDataPacket & { 
    date_group: string; 
    count: number 
  })[]>(
    `SELECT DATE_FORMAT(created_at, '${groupFormat}') as date_group, COUNT(*) as count
     FROM payments
     WHERE created_at >= ?
     GROUP BY date_group
     ORDER BY date_group ASC`,
    [startStr]
  );

  const [disputeStatusRows] = await pool.execute<(RowDataPacket & { 
    status: string; 
    count: number 
  })[]>(
    `SELECT status, COUNT(*) as count
     FROM disputes
     WHERE created_at >= ?
     GROUP BY status`,
    [startStr]
  );

  const [disputeReasonRows] = await pool.execute<(RowDataPacket & { 
    reason: string; 
    count: number 
  })[]>(
    `SELECT COALESCE(reason, 'unknown') as reason, COUNT(*) as count
     FROM disputes
     WHERE created_at >= ?
     GROUP BY reason`,
    [startStr]
  );

  const revenueByMethod: { stripe: number; points: number; mixed: number } = {
    stripe: 0,
    points: 0,
    mixed: 0,
  };
  for (const row of methodRows) {
    if (row.payment_method in revenueByMethod) {
      revenueByMethod[row.payment_method as keyof typeof revenueByMethod] = Number(row.total);
    }
  }

  const revenueByStripeType: Record<string, number> = {};
  for (const row of stripeTypeRows) {
    const typeKey = row.stripe_payment_method_type || 'unknown';
    revenueByStripeType[typeKey] = Number(row.total);
  }

  const paymentsByStatus: { pending: number; completed: number; failed: number; refunded: number; expired: number; disputed: number; requires_action: number } = {
    pending: 0,
    completed: 0,
    failed: 0,
    refunded: 0,
    expired: 0,
    disputed: 0,
    requires_action: 0,
  };
  for (const row of statusRows) {
    if (row.status in paymentsByStatus) {
      paymentsByStatus[row.status as keyof typeof paymentsByStatus] = Number(row.count);
    }
  }

  const disputesByStatus: Record<string, number> = {};
  for (const row of disputeStatusRows) {
    disputesByStatus[row.status] = Number(row.count);
  }

  const disputesByReason: Record<string, number> = {};
  for (const row of disputeReasonRows) {
    disputesByReason[row.reason] = Number(row.count);
  }

  const totalPayments = Number(summaryRows[0]?.total_payments ?? 0);
  const totalDisputes = Number(disputeCountRows[0]?.total_disputes ?? 0);
  const disputeRate = totalPayments > 0 ? (totalDisputes / totalPayments) * 100 : 0;

  return {
    totalRevenue: Number(summaryRows[0]?.total_revenue ?? 0),
    totalPayments,
    averagePaymentAmount: Number(summaryRows[0]?.avg_payment ?? 0),
    totalRefunds: Number(refundRows[0]?.total_refunds ?? 0),
    totalDisputes,
    disputeRate: Math.round(disputeRate * 100) / 100,
    revenueByMethod,
    revenueByStripeType,
    paymentsByStatus,
    revenueOverTime: revenueTimeRows.map(r => ({
      date: r.date_group,
      amount: Number(r.total),
    })),
    paymentCountOverTime: paymentCountTimeRows.map(r => ({
      date: r.date_group,
      count: Number(r.count),
    })),
    disputesByStatus,
    disputesByReason,
  };
};

export const getAllTimeStats = async (): Promise<{
  totalRevenue: number;
  totalPayments: number;
  totalDisputes: number;
  totalRefunds: number;
}> => {
  const [paymentRows] = await pool.execute<(RowDataPacket & {
    total_revenue: number;
    total_payments: number;
    total_refunds: number;
  })[]>(
    `SELECT 
      COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as total_revenue,
      COUNT(*) as total_payments,
      SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as total_refunds
    FROM payments`
  );

  const [disputeRows] = await pool.execute<(RowDataPacket & { total_disputes: number })[]>(
    'SELECT COUNT(*) as total_disputes FROM disputes'
  );

  return {
    totalRevenue: Number(paymentRows[0]?.total_revenue ?? 0),
    totalPayments: Number(paymentRows[0]?.total_payments ?? 0),
    totalDisputes: Number(disputeRows[0]?.total_disputes ?? 0),
    totalRefunds: Number(paymentRows[0]?.total_refunds ?? 0),
  };
};
