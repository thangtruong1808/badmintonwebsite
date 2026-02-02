import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, Select, FormActions } from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

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
  { key: "subscribed_at", label: "Subscribed at", render: (r) => r.subscribed_at.slice(0, 16) },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const NewsletterSection: React.FC = () => {
  const [items, setItems] = useState<NewsletterRow[]>([]);
  const [loading, setLoading] = useState(true);
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
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
        >
          <FaPlus size={16} />
          Add Subscription
        </button>
      </div>
      {loading ? (
        <p className="font-calibri text-gray-600">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={items}
          getRowId={(r) => r.id}
          onEdit={openEdit}
          onDelete={(r) => setDeleteTarget(r)}
          emptyMessage="No newsletter subscriptions yet. Click Add Subscription to create one."
        />
      )}
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
