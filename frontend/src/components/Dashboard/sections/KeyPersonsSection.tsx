import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaUser } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, TextArea, FormActions } from "../Shared/inputs";
import { apiFetch, API_BASE } from "../../../utils/api";

export interface KeyPersonRow {
  id: number;
  first_name: string;
  last_name: string;
  role: string;
  description: string | null;
  image_url: string | null;
  cloudinary_public_id: string | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

const COLUMNS: Column<KeyPersonRow>[] = [
  {
    key: "image_url",
    label: "Preview",
    render: (r) =>
      r.image_url ? (
        <img
          src={r.image_url}
          alt={`${r.first_name} ${r.last_name}`}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-full bg-rose-200 flex items-center justify-center">
          <FaUser className="text-rose-600" size={18} />
        </div>
      ),
  },
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "role", label: "Role" },
  {
    key: "description",
    label: "Description",
    render: (r) =>
      r.description
        ? r.description.length > 60
          ? r.description.slice(0, 60) + "…"
          : r.description
        : "—",
  },
  { key: "display_order", label: "Order" },
];

const KeyPersonsSection: React.FC = () => {
  const [items, setItems] = useState<KeyPersonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<KeyPersonRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KeyPersonRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    description: "",
    display_order: 0,
    image_url: "",
    cloudinary_public_id: "",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/key-persons");
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
      firstName: "",
      lastName: "",
      role: "",
      description: "",
      display_order: items.length,
      image_url: "",
      cloudinary_public_id: "",
    });
    setFormError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const openEdit = (row: KeyPersonRow) => {
    setEditing(row);
    setForm({
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      description: row.description ?? "",
      display_order: row.display_order,
      image_url: row.image_url ?? "",
      cloudinary_public_id: row.cloudinary_public_id ?? "",
    });
    setFormError(null);
    setUploadError(null);
    setModalOpen(true);
  };

  const uploadKeyPersonImage = async (file: File) => {
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
      const res = await fetch(`${API_BASE}/api/upload/key-person-image`, {
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
    if (!form.firstName.trim() || !form.lastName.trim() || !form.role.trim()) {
      setFormError("First name, last name and role are required.");
      return;
    }
    if (editing) {
      try {
        const res = await apiFetch(`/api/dashboard/key-persons/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            role: form.role.trim(),
            description: form.description.trim() || null,
            displayOrder: form.display_order,
            imageUrl: form.image_url || null,
            cloudinaryPublicId: form.cloudinary_public_id || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Update failed");
        }
        const updated = await res.json();
        setItems((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        setModalOpen(false);
      } catch (err) {
        setFormError(err instanceof Error ? err.message : "Update failed");
      }
      return;
    }
    try {
      const res = await apiFetch("/api/dashboard/key-persons", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role.trim(),
          description: form.description.trim() || null,
          displayOrder: form.display_order,
          imageUrl: form.image_url || null,
          cloudinaryPublicId: form.cloudinary_public_id || null,
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
      const res = await apiFetch(`/api/dashboard/key-persons/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
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
          Add Key Person
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
          emptyMessage="No key persons yet. Add team or leadership entries to show on the About Us page."
          sortable
          pageSize={10}
          pageSizeOptions={[5, 10, 25]}
        />
      )}

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit key person" : "Add key person"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <label className="block font-calibri text-sm text-gray-700">Photo (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded file:border-0 file:bg-rose-100 file:px-4 file:py-2 file:font-calibri file:text-rose-800 hover:file:bg-rose-200"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadKeyPersonImage(file);
            }}
          />
          {uploading && <p className="text-sm text-gray-500">Uploading…</p>}
          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
          {form.image_url && (
            <div className="flex items-center gap-2 mt-2">
              <img
                src={form.image_url}
                alt="Preview"
                className="h-20 w-20 rounded-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, image_url: "", cloudinary_public_id: "" }))
                }
                className="text-sm font-calibri text-rose-600 hover:underline"
              >
                Remove photo
              </button>
            </div>
          )}
        </div>
        <TextInput
          label="First name"
          name="firstName"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          required
        />
        <TextInput
          label="Last name"
          name="lastName"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          required
        />
        <TextInput
          label="Role"
          name="role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          placeholder="e.g. Club President"
          required
        />
        <TextArea
          label="Description (optional)"
          name="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Short bio or role description"
          rows={3}
        />
        <NumberInput
          label="Display order"
          name="display_order"
          value={form.display_order}
          onChange={(e) =>
            setForm((f) => ({ ...f, display_order: e.target.valueAsNumber ?? 0 }))
          }
          min={0}
        />
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <FormActions
          onCancel={() => setModalOpen(false)}
          submitLabel={editing ? "Update" : "Create"}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete key person"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.first_name} ${deleteTarget.last_name}"? They will be removed from the About Us page.`
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

export default KeyPersonsSection;
