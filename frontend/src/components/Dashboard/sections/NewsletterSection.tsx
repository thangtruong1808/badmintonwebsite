import React, { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, Select, FormActions } from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";
import { formatDateDDMonthYYYY } from "../../../utils/dateUtils";

export interface NewsletterRow {
  id: number;
  email: string;
  subscribed_at: string;
  status: string;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "unsubscribed", label: "Unsubscribed" },
];

function toDatetimeLocal(value: string): string {
  const s = value.replace(" ", "T").slice(0, 16);
  return s || new Date().toISOString().slice(0, 16);
}

const COLUMNS: Column<NewsletterRow>[] = [
  { key: "id", label: "ID" },
  { key: "email", label: "Email" },
  { key: "subscribed_at", label: "Subscribed at", render: (r) => formatDateDDMonthYYYY(r.subscribed_at) },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created", render: (r) => formatDateDDMonthYYYY(r.created_at) },
];

const NewsletterSection: React.FC = () => {
  const [items, setItems] = useState<NewsletterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsletterRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    subscribed_at: new Date().toISOString().slice(0, 16),
    status: "active",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/newsletter");
      if (res.ok) {
        const list = await res.json();
        setItems(Array.isArray(list) ? list : []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const openCreate = () => {
    setFormError(null);
    setEditing(null);
    setForm({
      email: "",
      subscribed_at: new Date().toISOString().slice(0, 16),
      status: "active",
    });
    setModalOpen(true);
  };

  const openEdit = (row: NewsletterRow) => {
    setFormError(null);
    setEditing(row);
    setForm({
      email: row.email,
      subscribed_at: toDatetimeLocal(row.subscribed_at),
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const subAt = form.subscribed_at.replace("T", " ") + ":00";
    try {
      if (editing) {
        const res = await apiFetch(`/api/dashboard/newsletter/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            email: form.email,
            subscribed_at: subAt,
            status: form.status,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to update subscription.");
          return;
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((r) => (r.id === editing.id ? updated : r))
        );
      } else {
        const res = await apiFetch("/api/dashboard/newsletter", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            subscribed_at: subAt,
            status: form.status,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.status === 409 || data.alreadySubscribed) {
          setFormError(data.message || "This email is already subscribed to our newsletter.");
          return;
        }
        if (!res.ok) {
          setFormError(data.message || "Failed to add subscription.");
          return;
        }
        setItems((prev) => [data, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = async (row: NewsletterRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/newsletter/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((r) => r.id !== row.id));
      }
    } catch {
      // keep dialog open or show error
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="newsletter-search" className="sr-only">
            Search by email or status
          </label>
          <input
            id="newsletter-search"
            type="search"
            placeholder="Search by email or status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            aria-label="Search by email or status"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600 shrink-0"
        >
          <FaPlus size={16} />
          Add Subscription
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        loading={loading}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No newsletter subscriptions yet. Click Add Subscription to create one."
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
      <FormModal
        title={editing ? "Edit Subscription" : "Add Subscription"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <TextInput
          label="Subscribed at"
          name="subscribed_at"
          type="datetime-local"
          value={form.subscribed_at}
          onChange={(e) =>
            setForm((f) => ({ ...f, subscribed_at: e.target.value }))
          }
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Subscription"
        message={
          deleteTarget
            ? `Remove subscription for "${deleteTarget.email}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default NewsletterSection;
