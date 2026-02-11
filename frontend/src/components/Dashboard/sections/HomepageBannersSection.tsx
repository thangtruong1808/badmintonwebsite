import React, { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, FormActions } from "../Shared/inputs";
import { apiFetch, API_BASE } from "../../../utils/api";

export interface HomepageBannerRow {
  id: number;
  title: string | null;
  cloudinary_public_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const COLUMNS: Column<HomepageBannerRow>[] = [
  {
    key: "image_url",
    label: "Preview",
    render: (r) => (
      <img
        src={r.image_url}
        alt={r.alt_text}
        className="h-10 w-auto max-w-[120px] object-contain rounded"
      />
    ),
  },
  { key: "title", label: "Title", render: (r) => r.title ?? "—" },
  { key: "alt_text", label: "Alt text" },
  { key: "display_order", label: "Order" },
  {
    key: "is_active",
    label: "Active",
    render: (r) => (r.is_active ? "Yes" : "No"),
  },
];

const HomepageBannersSection: React.FC = () => {
  const [items, setItems] = useState<HomepageBannerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomepageBannerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomepageBannerRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    alt_text: "",
    display_order: 0,
    is_active: true,
    image_url: "",
    cloudinary_public_id: "",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/homepage-banners");
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
      title: "",
      alt_text: "",
      display_order: items.length,
      is_active: true,
      image_url: "",
      cloudinary_public_id: "",
    });
    setUploadError(null);
    setModalOpen(true);
  };

  const openEdit = (row: HomepageBannerRow) => {
    setEditing(row);
    setForm({
      title: row.title ?? "",
      alt_text: row.alt_text,
      display_order: row.display_order,
      is_active: row.is_active,
      image_url: row.image_url,
      cloudinary_public_id: row.cloudinary_public_id,
    });
    setUploadError(null);
    setModalOpen(true);
  };

  const uploadBannerImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setUploadError("Image must be less than 50MB.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload/banner-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        image_url: data.url,
        cloudinary_public_id: data.publicId,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (editing) {
      try {
        const res = await apiFetch(`/api/dashboard/homepage-banners/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: form.title.trim() || null,
            alt_text: form.alt_text.trim(),
            display_order: form.display_order,
            is_active: form.is_active,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Update failed");
        }
        const updated = await res.json();
        setItems((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
        setModalOpen(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Update failed");
      }
      return;
    }
    if (!form.image_url || !form.cloudinary_public_id || !form.alt_text.trim()) {
      setFormError("Please upload an image and enter alt text.");
      return;
    }
    try {
      const res = await apiFetch("/api/dashboard/homepage-banners", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim() || undefined,
          cloudinary_public_id: form.cloudinary_public_id,
          image_url: form.image_url,
          alt_text: form.alt_text.trim(),
          display_order: form.display_order,
          is_active: form.is_active,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Create failed");
      }
      const created = await res.json();
      setItems((prev) => [...prev, created].sort((a, b) => a.display_order - b.display_order));
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Create failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await apiFetch(`/api/dashboard/homepage-banners/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) setItems((prev) => prev.filter((b) => b.id !== deleteTarget.id));
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
          Add Banner
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
          emptyMessage="No homepage banners yet. Images are resized to 1920×600 for the carousel. Add one to get started."
          sortable
          pageSize={10}
          pageSizeOptions={[5, 10, 25]}
        />
      )}

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit banner" : "Add homepage banner"}
        onSubmit={handleSubmit}
      >
        {!editing && (
          <div className="space-y-2">
            <label className="block font-calibri text-sm text-gray-700">Image (1920×600 on upload)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:font-calibri file:text-rose-800 hover:file:bg-rose-200"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadBannerImage(file);
              }}
            />
            {uploading && <p className="text-sm text-gray-500">Uploading…</p>}
            {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Preview"
                className="mt-2 h-24 w-auto max-w-full object-cover rounded"
              />
            )}
          </div>
        )}
        <TextInput
          label="Title (optional)"
          name="title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Welcome"
        />
        <TextInput
          label="Alt text (required)"
          name="alt_text"
          value={form.alt_text}
          onChange={(e) => setForm((f) => ({ ...f, alt_text: e.target.value }))}
          placeholder="Describe the image for accessibility"
          required
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={form.display_order}
          onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.valueAsNumber || 0 }))}
          min={0}
        />
        {editing && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="banner-active"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-rose-600"
            />
            <label htmlFor="banner-active" className="font-calibri text-sm text-gray-700">
              Active (show in carousel)
            </label>
          </div>
        )}
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <FormActions onCancel={() => setModalOpen(false)} submitLabel={editing ? "Update" : "Create"} />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete banner"
        message={
          deleteTarget
            ? `Delete banner "${deleteTarget.alt_text}"? It will be removed from the homepage carousel.`
            : ""
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};

export default HomepageBannersSection;
