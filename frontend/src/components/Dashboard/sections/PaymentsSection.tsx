import React, { useState, useEffect } from "react";
import { FaSpinner, FaExternalLinkAlt, FaSearch, FaFilter, FaTrash } from "react-icons/fa";
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
  { value: "expired", label: "Expired" },
  { value: "disputed", label: "Disputed" },
  { value: "requires_action", label: "Requires Action" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...STATUS_OPTIONS,
];

const CLEANUP_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "refunded", label: "Refunded" },
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
    case "expired":
      return "bg-gray-200 text-gray-600";
    case "disputed":
      return "bg-orange-100 text-orange-800";
    case "requires_action":
      return "bg-blue-100 text-blue-800";
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
  
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupForm, setCleanupForm] = useState({
    status: "pending",
    startDate: "",
    endDate: "",
  });
  const [cleanupPreviewCount, setCleanupPreviewCount] = useState<number | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupConfirmed, setCleanupConfirmed] = useState(false);

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

  const openCleanupModal = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setCleanupForm({
      status: "pending",
      startDate: thirtyDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
    setCleanupPreviewCount(null);
    setCleanupConfirmed(false);
    setCleanupModalOpen(true);
  };

  const previewCleanup = async () => {
    if (!cleanupForm.startDate || !cleanupForm.endDate) return;
    
    setCleanupLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/payments/bulk-delete/preview", {
        method: "POST",
        body: JSON.stringify({
          status: cleanupForm.status,
          startDate: cleanupForm.startDate,
          endDate: cleanupForm.endDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to preview cleanup");
      const data = await res.json();
      setCleanupPreviewCount(data.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview cleanup");
    } finally {
      setCleanupLoading(false);
    }
  };

  const executeCleanup = async () => {
    if (!cleanupConfirmed || cleanupPreviewCount === null || cleanupPreviewCount === 0) return;
    
    setCleanupLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/payments/bulk-delete", {
        method: "POST",
        body: JSON.stringify({
          status: cleanupForm.status,
          startDate: cleanupForm.startDate,
          endDate: cleanupForm.endDate,
        }),
      });
      if (!res.ok) throw new Error("Failed to execute cleanup");
      const data = await res.json();
      await fetchPayments();
      setCleanupModalOpen(false);
      alert(`Successfully deleted ${data.deleted} payment record(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute cleanup");
    } finally {
      setCleanupLoading(false);
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
        <div className="flex items-center gap-4">
          <button
            onClick={openCleanupModal}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaTrash size={12} />
            Clean Up
          </button>
          <div className="text-sm text-gray-500 font-calibri">
            {filteredItems.length} of {items.length} payment{items.length !== 1 ? "s" : ""}
          </div>
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

      <FormModal
        title="Clean Up Payment Records"
        open={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        onSubmit={(e) => { e.preventDefault(); executeCleanup(); }}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Delete payment records by status and date range. This helps reduce database size by removing stale records.
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800 font-medium">Warning</p>
            <p className="text-xs text-amber-700 mt-1">
              This action is permanent and cannot be undone. Only delete records you no longer need.
            </p>
          </div>

          <Select
            label="Payment Status"
            name="cleanupStatus"
            value={cleanupForm.status}
            onChange={(e) => {
              setCleanupForm((f) => ({ ...f, status: e.target.value }));
              setCleanupPreviewCount(null);
              setCleanupConfirmed(false);
            }}
            options={CLEANUP_STATUS_OPTIONS}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={cleanupForm.startDate}
                onChange={(e) => {
                  setCleanupForm((f) => ({ ...f, startDate: e.target.value }));
                  setCleanupPreviewCount(null);
                  setCleanupConfirmed(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={cleanupForm.endDate}
                onChange={(e) => {
                  setCleanupForm((f) => ({ ...f, endDate: e.target.value }));
                  setCleanupPreviewCount(null);
                  setCleanupConfirmed(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={previewCleanup}
            disabled={cleanupLoading || !cleanupForm.startDate || !cleanupForm.endDate}
            className="w-full px-4 py-2 text-sm font-medium text-rose-600 border border-rose-300 rounded-lg hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cleanupLoading ? (
              <span className="inline-flex items-center gap-2">
                <FaSpinner className="animate-spin" size={14} />
                Calculating...
              </span>
            ) : (
              "Preview Records to Delete"
            )}
          </button>

          {cleanupPreviewCount !== null && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{cleanupPreviewCount}</p>
              <p className="text-sm text-gray-600">
                {cleanupPreviewCount === 1 ? "record" : "records"} will be deleted
              </p>
            </div>
          )}

          {cleanupPreviewCount !== null && cleanupPreviewCount > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cleanupConfirmed}
                onChange={(e) => setCleanupConfirmed(e.target.checked)}
                className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-sm text-gray-700">
                I understand this action is permanent and want to proceed
              </span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCleanupModalOpen(false)}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cleanupLoading || !cleanupConfirmed || cleanupPreviewCount === null || cleanupPreviewCount === 0}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cleanupLoading ? (
                <span className="inline-flex items-center gap-2 justify-center">
                  <FaSpinner className="animate-spin" size={14} />
                  Deleting...
                </span>
              ) : (
                `Delete ${cleanupPreviewCount ?? 0} Records`
              )}
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
};

export default PaymentsSection;
