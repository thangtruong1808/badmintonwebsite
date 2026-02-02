import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, Select, TextArea, FormActions } from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

export interface ContactMessageRow {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

const COLUMNS: Column<ContactMessageRow>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "subject", label: "Subject" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const ContactMessagesSection: React.FC = () => {
  const [items, setItems] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactMessageRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "new",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/contact-messages");
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
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      status: "new",
    });
    setModalOpen(true);
  };

  const openEdit = (row: ContactMessageRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      phone: row.phone ?? "",
      subject: row.subject,
      message: row.message,
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editing) {
      setModalOpen(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/dashboard/contact-messages/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: form.status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || "Failed to update.");
        return;
      }
      const updated = await res.json();
      setItems((prev) =>
        prev.map((r) => (r.id === editing.id ? updated : r))
      );
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = (_row: ContactMessageRow) => {
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
          Add Message
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
          emptyMessage="No contact messages yet."
        />
      )}
      <FormModal
        title={editing ? "Edit Contact Message" : "Add Contact Message"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
        <TextInput
          label="Name"
          name="name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <TextInput
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <TextInput
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          required
        />
        <TextArea
          label="Message"
          name="message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          required
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
        title="Delete Message"
        message={
          deleteTarget
            ? `Delete message from "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ContactMessagesSection;
