import React, { useState, useEffect } from "react";
import { FaSpinner, FaExternalLinkAlt, FaSearch, FaFilter } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import {
  Select,
  FormActions,
} from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

export interface PaymentRow {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...STATUS_OPTIONS,
];

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const COLUMNS: Column<PaymentRow>[] = [
  { key: "id", label: "ID", render: (r) => (
    <span title={r.id} className="font-mono text-xs">
      {r.id.slice(0, 8)}…
    </span>
  )},
  { key: "user_id", label: "User ID", render: (r) => (
    <span title={r.user_id} className="font-mono text-xs">
      {r.user_id.slice(0, 8)}…
    </span>
  )},
  { key: "amount", label: "Amount", render: (r) => (
    <span className="font-medium">${Number(r.amount).toFixed(2)}</span>
  )},
  { key: "currency", label: "Currency", render: (r) => (
    <span className="uppercase text-xs">{r.currency}</span>
  )},
  { key: "status", label: "Status", render: (r) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(r.status)}`}>
      {r.status}
    </span>
  )},
  { key: "payment_method", label: "Method", render: (r) => (
    <span className="capitalize">{r.payment_method}</span>
  )},
  { key: "stripe_payment_intent_id", label: "Stripe ID", render: (r) => (
    r.stripe_payment_intent_id ? (
      <a
        href={`https://dashboard.stripe.com/payments/${r.stripe_payment_intent_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-mono"
        title={r.stripe_payment_intent_id}
      >
        {r.stripe_payment_intent_id.slice(0, 12)}…
        <FaExternalLinkAlt size={10} />
      </a>
    ) : <span className="text-gray-400">—</span>
  )},
  { key: "created_at", label: "Created", render: (r) => (
    r.created_at ? (
      <span className="text-xs text-gray-600">
        {new Date(r.created_at).toLocaleDateString()}
      </span>
    ) : "—"
  )},
];

const PaymentsSection: React.FC = () => {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ status: "pending" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/dashboard/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openEdit = (row: PaymentRow) => {
    setEditing(row);
    setForm({ status: row.status });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/dashboard/payments/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: form.status }),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      await fetchPayments();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.stripe_payment_intent_id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-rose-500 mr-2" size={20} />
        <span className="text-gray-600 font-calibri">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading payments</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchPayments}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by ID, user, or Stripe ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm"
            />
          </div>
          <div className="relative sm:w-40">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm appearance-none bg-white"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-calibri">
          {filteredItems.length} of {items.length} payment{items.length !== 1 ? "s" : ""}
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        emptyMessage="No payments found."
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      <FormModal
        title="Update Payment Status"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {editing && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><span className="font-medium">Payment ID:</span> <span className="font-mono">{editing.id}</span></p>
              <p><span className="font-medium">Amount:</span> ${Number(editing.amount).toFixed(2)} {editing.currency.toUpperCase()}</p>
              <p><span className="font-medium">Method:</span> {editing.payment_method}</p>
              {editing.stripe_payment_intent_id && (
                <p>
                  <span className="font-medium">Stripe:</span>{" "}
                  <a
                    href={`https://dashboard.stripe.com/payments/${editing.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    View in Stripe <FaExternalLinkAlt size={10} />
                  </a>
                </p>
              )}
            </div>
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
            <FormActions
              onCancel={() => setModalOpen(false)}
              submitLabel={submitting ? "Updating..." : "Update Status"}
              submitDisabled={submitting}
            />
          </div>
        )}
      </FormModal>
    </div>
  );
};

export default PaymentsSection;
