import React, { useState, useEffect } from "react";
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
import { apiFetch } from "../../../utils/api";

export interface NewsRow {
  id: number;
  image?: string;
  title: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  badge: string;
  category?: string;
  link?: string;
  display_order: number;
  created_at?: string;
}

const BADGE_OPTIONS = [
  { value: "UPCOMING", label: "Upcoming" },
  { value: "REGULAR", label: "Regular" },
  { value: "OPEN", label: "Open" },
];

const COLUMNS: Column<NewsRow>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "badge", label: "Badge" },
  { key: "category", label: "Category", render: (r) => r.category ?? "—" },
  { key: "date", label: "Date", render: (r) => r.date ?? "—" },
  { key: "display_order", label: "Order" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const NewsSection: React.FC = () => {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    image: "",
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    badge: "OPEN",
    category: "",
    link: "",
    display_order: 0,
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/news");
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
      image: "",
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      badge: "OPEN",
      category: "",
      link: "",
      display_order: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (row: NewsRow) => {
    setEditing(row);
    setForm({
      image: row.image ?? "",
      title: row.title,
      date: row.date ?? "",
      time: row.time ?? "",
      location: row.location ?? "",
      description: row.description ?? "",
      badge: row.badge,
      category: row.category ?? "",
      link: row.link ?? "",
      display_order: row.display_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      image: form.image || undefined,
      title: form.title,
      date: form.date || undefined,
      time: form.time || undefined,
      location: form.location || undefined,
      description: form.description || undefined,
      badge: form.badge,
      category: form.category || undefined,
      link: form.link || undefined,
      display_order: form.display_order,
    };
    try {
      if (editing) {
        const res = await apiFetch(`/api/dashboard/news/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to update news.");
          return;
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((r) => (r.id === editing.id ? updated : r))
        );
      } else {
        const res = await apiFetch("/api/dashboard/news", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to add news.");
          return;
        }
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = async (row: NewsRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/news/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) setItems((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // keep dialog open
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
          Add News
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
          emptyMessage="No news articles yet. Click Add News to create one."
        />
      )}
      <FormModal
        title={editing ? "Edit News Article" : "Add News Article"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
        <TextInput
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
        />
        <TextInput
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <TextInput
          label="Date"
          name="date"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <TextInput
          label="Time"
          name="time"
          value={form.time}
          onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
        />
        <TextInput
          label="Location"
          name="location"
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <Select
          label="Badge"
          name="badge"
          value={form.badge}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
          options={BADGE_OPTIONS}
        />
        <TextInput
          label="Category"
          name="category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        />
        <TextInput
          label="Link URL"
          name="link"
          value={form.link}
          onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={form.display_order}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              display_order: Number(e.target.value) || 0,
            }))
          }
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete News Article"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default NewsSection;
