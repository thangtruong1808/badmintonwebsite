import type { RowDataPacket } from 'mysql2';
import pool from '../db/connection.js';

export interface InvoiceLineItemRow {
  id: number;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  event_id: number | null;
  registration_id: string | null;
  sort_order: number;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  payment_id: string | null;
  invoice_number: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  created_at?: string;
  updated_at?: string;
  line_items?: InvoiceLineItemRow[];
}

interface InvoiceDbRow extends RowDataPacket {
  id: string;
  user_id: string;
  payment_id: string | null;
  invoice_number: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  due_date: Date | string | null;
  paid_at: Date | string | null;
  pdf_url: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
}

interface LineItemDbRow extends RowDataPacket {
  id: number;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  event_id: number | null;
  registration_id: string | null;
  sort_order: number;
}

function rowToInvoice(r: InvoiceDbRow): Omit<InvoiceRow, 'line_items'> {
  return {
    id: r.id,
    user_id: r.user_id,
    payment_id: r.payment_id ?? null,
    invoice_number: r.invoice_number,
    status: r.status,
    subtotal: Number(r.subtotal),
    total: Number(r.total),
    currency: r.currency,
    due_date: r.due_date ? String(r.due_date).slice(0, 10) : null,
    paid_at: r.paid_at ? String(r.paid_at) : null,
    pdf_url: r.pdf_url ?? null,
    created_at: r.created_at ? String(r.created_at) : undefined,
    updated_at: r.updated_at ? String(r.updated_at) : undefined,
  };
}

function rowToLineItem(r: LineItemDbRow): InvoiceLineItemRow {
  return {
    id: r.id,
    invoice_id: r.invoice_id,
    description: r.description,
    quantity: r.quantity,
    unit_price: Number(r.unit_price),
    amount: Number(r.amount),
    event_id: r.event_id ?? null,
    registration_id: r.registration_id ?? null,
    sort_order: r.sort_order,
  };
}

export const findAll = async (): Promise<InvoiceRow[]> => {
  const [rows] = await pool.execute<InvoiceDbRow[]>(
    'SELECT * FROM invoices ORDER BY created_at DESC'
  );
  return rows.map((r) => rowToInvoice(r));
};

export const findById = async (id: string): Promise<InvoiceRow | null> => {
  const [invRows] = await pool.execute<InvoiceDbRow[]>(
    'SELECT * FROM invoices WHERE id = ?',
    [id]
  );
  if (!invRows.length) return null;
  const invoice = rowToInvoice(invRows[0]);
  const [lineRows] = await pool.execute<LineItemDbRow[]>(
    'SELECT * FROM invoice_line_items WHERE invoice_id = ? ORDER BY sort_order, id',
    [id]
  );
  return {
    ...invoice,
    line_items: lineRows.map(rowToLineItem),
  };
};
