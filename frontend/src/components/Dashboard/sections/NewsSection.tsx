import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  TextArea,
  FormActions,
} from "../Shared/inputs";
import { apiFetch, API_BASE } from "../../../utils/api";
import { formatDateDDMonthYYYY } from "../../../utils/dateUtils";

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

const COLUMNS: Column<NewsRow>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "badge", label: "Badge" },
  { key: "category", label: "Category", render: (r) => r.category ?? "—" },
  { key: "date", label: "Date", render: (r) => formatDateDDMonthYYYY(r.date) },
  { key: "display_order", label: "Order" },
  { key: "created_at", label: "Created", render: (r) => formatDateDDMonthYYYY(r.created_at) },
];

const NewsSection: React.FC = () => {
  const [items, setItems] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    image: "",
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    badge: "",
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

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.badge ?? "").toLowerCase().includes(q) ||
        (r.category ?? "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      image: "",
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      badge: "",
      category: "",
      link: "",
      display_order: 0,
    });
    setUploadError(null);
    setModalOpen(true);
  };

  const uploadNewsImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Image must be less than 4MB.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload/news-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setForm((f) => ({ ...f, image: data.url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
    setUploadError(null);
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
      badge: form.badge.trim() || undefined,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="news-search" className="sr-only">
            Search by title, badge or category
          </label>
          <input
            id="news-search"
            type="search"
            placeholder="Search by title, badge or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            aria-label="Search by title, badge or category"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600 shrink-0"
        >
          <FaPlus size={16} />
          Add News
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        loading={loading}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No news articles yet. Click Add News to create one."
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
      <FormModal
        title={editing ? "Edit News Article" : "Add News Article"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
        <div className="space-y-2">
          <label className="block font-calibri text-sm font-medium text-gray-700">
            Image
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:font-calibri file:text-rose-800 hover:file:bg-rose-200"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadNewsImage(file);
              }}
            />
            <span className="font-calibri text-sm text-gray-500 shrink-0">or paste URL below</span>
          </div>
          {uploading && (
            <p className="text-sm text-gray-500 font-calibri">Uploading…</p>
          )}
          {uploadError && (
            <p className="text-sm text-red-600 font-calibri">{uploadError}</p>
          )}
          <TextInput
            label="Image URL (optional if you uploaded above)"
            name="image"
            type="url"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            placeholder="https://… or leave empty after upload"
          />
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="mt-2 h-24 w-auto max-w-full object-contain rounded border border-gray-200"
            />
          )}
        </div>
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
        <TextInput
          label="Badge"
          name="badge"
          value={form.badge}
          onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
          placeholder="e.g. UPCOMING, REGULAR, OPEN"
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
