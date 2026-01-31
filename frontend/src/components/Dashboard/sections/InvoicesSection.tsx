import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  FormActions,
} from "../Shared/inputs";

export interface InvoiceLineItemRow {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  event_id?: number;
  registration_id?: string;
  sort_order: number;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  payment_id?: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  due_date?: string;
  paid_at?: string;
  pdf_url?: string;
  line_items: InvoiceLineItemRow[];
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "issued", label: "Issued" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: Column<InvoiceRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 10) + "…" },
  { key: "invoice_number", label: "Invoice #" },
  { key: "user_id", label: "User ID", render: (r) => r.user_id.slice(0, 12) + "…" },
  { key: "status", label: "Status" },
  { key: "total", label: "Total" },
  { key: "currency", label: "Currency" },
  { key: "due_date", label: "Due", render: (r) => r.due_date ?? "—" },
  { key: "paid_at", label: "Paid at", render: (r) => (r.paid_at ? r.paid_at.slice(0, 10) : "—") },
];

const defaultLineItem = (sortOrder: number): InvoiceLineItemRow => ({
  description: "",
  quantity: 1,
  unit_price: 0,
  amount: 0,
  sort_order: sortOrder,
});

const InvoicesSection: React.FC = () => {
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    payment_id: "",
    invoice_number: "",
    status: "draft",
    subtotal: 0,
    total: 0,
    currency: "AUD",
    due_date: "",
    paid_at: "",
    pdf_url: "",
  });
  const [lineItems, setLineItems] = useState<InvoiceLineItemRow[]>([
    defaultLineItem(0),
  ]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      user_id: "",
      payment_id: "",
      invoice_number: `INV-${Date.now()}`,
      status: "draft",
      subtotal: 0,
      total: 0,
      currency: "AUD",
      due_date: "",
      paid_at: "",
      pdf_url: "",
    });
    setLineItems([defaultLineItem(0)]);
    setModalOpen(true);
  };

  const openEdit = (row: InvoiceRow) => {
    setEditing(row);
    setForm({
      user_id: row.user_id,
      payment_id: row.payment_id ?? "",
      invoice_number: row.invoice_number,
      status: row.status,
      subtotal: row.subtotal,
      total: row.total,
      currency: row.currency,
      due_date: row.due_date ?? "",
      paid_at: row.paid_at ? row.paid_at.slice(0, 16) : "",
      pdf_url: row.pdf_url ?? "",
    });
    setLineItems(
      row.line_items.length > 0
        ? row.line_items
        : [defaultLineItem(0)]
    );
    setModalOpen(true);
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, defaultLineItem(prev.length)]);
  };

  const removeLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItemRow, value: string | number) => {
    setLineItems((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === "quantity" || field === "unit_price") {
        item.amount = item.quantity * item.unit_price;
      }
      next[index] = item;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidAt = form.paid_at ? form.paid_at.replace("T", " ") + ":00" : undefined;
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              user_id: form.user_id,
              payment_id: form.payment_id || undefined,
              invoice_number: form.invoice_number,
              status: form.status,
              subtotal: form.subtotal,
              total: form.total,
              currency: form.currency,
              due_date: form.due_date || undefined,
              paid_at: paidAt,
              pdf_url: form.pdf_url || undefined,
              line_items: lineItems,
            }
            : r
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `inv-${Date.now()}`,
          user_id: form.user_id,
          payment_id: form.payment_id || undefined,
          invoice_number: form.invoice_number,
          status: form.status,
          subtotal: form.subtotal,
          total: form.total,
          currency: form.currency,
          due_date: form.due_date || undefined,
          paid_at: paidAt,
          pdf_url: form.pdf_url || undefined,
          line_items: lineItems,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: InvoiceRow) => {
    setItems((prev) => prev.filter((r) => r.id !== row.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
        >
          <FaPlus size={16} />
          Add Invoice
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No invoices yet. Click Add Invoice to create one."
      />
      <FormModal
        title={editing ? "Edit Invoice" : "Add Invoice"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <TextInput
          label="User ID"
          name="user_id"
          value={form.user_id}
          onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          required
        />
        <TextInput
          label="Payment ID (optional)"
          name="payment_id"
          value={form.payment_id}
          onChange={(e) => setForm((f) => ({ ...f, payment_id: e.target.value }))}
        />
        <TextInput
          label="Invoice number"
          name="invoice_number"
          value={form.invoice_number}
          onChange={(e) =>
            setForm((f) => ({ ...f, invoice_number: e.target.value }))
          }
          required
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <NumberInput
          label="Subtotal"
          name="subtotal"
          value={form.subtotal}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              subtotal: Number(e.target.value) || 0,
            }))
          }
        />
        <NumberInput
          label="Total"
          name="total"
          value={form.total}
          onChange={(e) =>
            setForm((f) => ({ ...f, total: Number(e.target.value) || 0 }))
          }
        />
        <TextInput
          label="Currency"
          name="currency"
          value={form.currency}
          onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
        />
        <TextInput
          label="Due date"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
        />
        <TextInput
          label="Paid at (datetime)"
          name="paid_at"
          type="datetime-local"
          value={form.paid_at}
          onChange={(e) => setForm((f) => ({ ...f, paid_at: e.target.value }))}
        />
        <TextInput
          label="PDF URL"
          name="pdf_url"
          value={form.pdf_url}
          onChange={(e) => setForm((f) => ({ ...f, pdf_url: e.target.value }))}
        />
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-calibri font-medium text-gray-700">
              Line items
            </span>
            <button
              type="button"
              onClick={addLineItem}
              className="text-sm text-rose-600 hover:text-rose-700 font-calibri"
            >
              + Add row
            </button>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 rounded border border-gray-200 p-2 bg-gray-50 items-end"
              >
                <div className="sm:col-span-2">
                  <TextInput
                    label="Description"
                    name={`line_${index}_desc`}
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, "description", e.target.value)
                    }
                  />
                </div>
                <NumberInput
                  label="Qty"
                  name={`line_${index}_qty`}
                  value={item.quantity}
                  onChange={(e) =>
                    updateLineItem(index, "quantity", Number(e.target.value) || 0)
                  }
                />
                <NumberInput
                  label="Unit price"
                  name={`line_${index}_unit`}
                  value={item.unit_price}
                  onChange={(e) =>
                    updateLineItem(index, "unit_price", Number(e.target.value) || 0)
                  }
                />
                <NumberInput
                  label="Amount"
                  name={`line_${index}_amount`}
                  value={item.amount}
                  onChange={(e) =>
                    updateLineItem(index, "amount", Number(e.target.value) || 0)
                  }
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(index)}
                  className="rounded p-2 text-red-600 hover:bg-red-100 text-sm"
                  disabled={lineItems.length <= 1}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Invoice"
        message={
          deleteTarget
            ? `Delete invoice "${deleteTarget.invoice_number}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default InvoicesSection;
