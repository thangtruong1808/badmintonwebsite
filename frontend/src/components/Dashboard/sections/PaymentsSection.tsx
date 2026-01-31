import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  TextArea,
  FormActions,
} from "../Shared/inputs";

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id?: string;
  metadata?: string;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "stripe", label: "Stripe" },
  { value: "points", label: "Points" },
  { value: "mixed", label: "Mixed" },
];

const COLUMNS: Column<PaymentRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 12) + "…" },
  { key: "user_id", label: "User ID", render: (r) => r.user_id.slice(0, 12) + "…" },
  { key: "amount", label: "Amount" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
  { key: "payment_method", label: "Method" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const PaymentsSection: React.FC = () => {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentRow | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    amount: 0,
    currency: "AUD",
    status: "pending",
    payment_method: "stripe",
    stripe_payment_intent_id: "",
    metadata: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      user_id: "",
      amount: 0,
      currency: "AUD",
      status: "pending",
      payment_method: "stripe",
      stripe_payment_intent_id: "",
      metadata: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row: PaymentRow) => {
    setEditing(row);
    setForm({
      user_id: row.user_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      payment_method: row.payment_method,
      stripe_payment_intent_id: row.stripe_payment_intent_id ?? "",
      metadata: row.metadata ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              user_id: form.user_id,
              amount: form.amount,
              currency: form.currency,
              status: form.status,
              payment_method: form.payment_method,
              stripe_payment_intent_id: form.stripe_payment_intent_id || undefined,
              metadata: form.metadata || undefined,
            }
            : r
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `pay-${Date.now()}`,
          user_id: form.user_id,
          amount: form.amount,
          currency: form.currency,
          status: form.status,
          payment_method: form.payment_method,
          stripe_payment_intent_id: form.stripe_payment_intent_id || undefined,
          metadata: form.metadata || undefined,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: PaymentRow) => {
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
          Add Payment
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No payments yet. Click Add Payment to create one."
      />
      <FormModal
        title={editing ? "Edit Payment" : "Add Payment"}
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
        <NumberInput
          label="Amount"
          name="amount"
          value={form.amount}
          onChange={(e) =>
            setForm((f) => ({ ...f, amount: Number(e.target.value) || 0 }))
          }
          required
        />
        <TextInput
          label="Currency"
          name="currency"
          value={form.currency}
          onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Payment method"
          name="payment_method"
          value={form.payment_method}
          onChange={(e) =>
            setForm((f) => ({ ...f, payment_method: e.target.value }))
          }
          options={PAYMENT_METHOD_OPTIONS}
        />
        <TextInput
          label="Stripe payment intent ID (optional)"
          name="stripe_payment_intent_id"
          value={form.stripe_payment_intent_id}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              stripe_payment_intent_id: e.target.value,
            }))
          }
        />
        <TextArea
          label="Metadata (JSON, optional)"
          name="metadata"
          value={form.metadata}
          onChange={(e) => setForm((f) => ({ ...f, metadata: e.target.value }))}
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Payment"
        message={
          deleteTarget
            ? `Delete this payment record? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default PaymentsSection;
