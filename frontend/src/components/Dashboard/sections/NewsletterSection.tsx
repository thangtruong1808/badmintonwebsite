import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, Select, FormActions } from "../Shared/inputs";

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

const COLUMNS: Column<NewsletterRow>[] = [
  { key: "id", label: "ID" },
  { key: "email", label: "Email" },
  { key: "subscribed_at", label: "Subscribed at", render: (r) => r.subscribed_at.slice(0, 16) },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const NewsletterSection: React.FC = () => {
  const [items, setItems] = useState<NewsletterRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsletterRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsletterRow | null>(null);
  const [form, setForm] = useState({
    email: "",
    subscribed_at: new Date().toISOString().slice(0, 16),
    status: "active",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: "",
      subscribed_at: new Date().toISOString().slice(0, 16),
      status: "active",
    });
    setModalOpen(true);
  };

  const openEdit = (row: NewsletterRow) => {
    setEditing(row);
    setForm({
      email: row.email,
      subscribed_at: row.subscribed_at.slice(0, 16),
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subAt = form.subscribed_at.replace("T", " ") + ":00";
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              email: form.email,
              subscribed_at: subAt,
              status: form.status,
            }
            : r
        )
      );
    } else {
      const newId = items.length ? Math.max(...items.map((e) => e.id)) + 1 : 1;
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          email: form.email,
          subscribed_at: subAt,
          status: form.status,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: NewsletterRow) => {
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
          Add Subscription
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No newsletter subscriptions yet. Click Add Subscription to create one."
      />
      <FormModal
        title={editing ? "Edit Subscription" : "Add Subscription"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
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
