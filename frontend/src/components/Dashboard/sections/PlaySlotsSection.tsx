import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaImage, FaTimes, FaCloudUploadAlt, FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch, API_BASE } from "../../../utils/api";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import { TextInput, NumberInput, Select, TextArea, FormActions } from "../Shared/inputs";

export interface PlaySlotRow {
  id: number;
  dayOfWeek: string;
  time: string;
  location: string;
  title: string;
  description: string | null;
  price: number;
  maxCapacity: number;
  imageUrl?: string | null;
  isActive: boolean;
}

export interface CourtRow {
  id: number;
  playSlotId: number;
  name: string;
  sortOrder: number;
}

const DAY_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

async function fetchCourts(slotId: number): Promise<CourtRow[]> {
  const res = await apiFetch(`/api/play-slots/${slotId}/courts`);
  if (!res.ok) return [];
  const list = await res.json();
  return Array.isArray(list) ? list : [];
}

const PlaySlotsSection: React.FC = () => {
  const [items, setItems] = useState<PlaySlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlaySlotRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlaySlotRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    day_of_week: "Wednesday",
    time: "7:00 PM - 10:00 PM",
    location: "",
    title: "",
    description: "",
    price: 20,
    max_capacity: 45,
    image_url: "",
    is_active: true,
  });
  const [courts, setCourts] = useState<CourtRow[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtModalSlot, setCourtModalSlot] = useState<PlaySlotRow | null>(null);
  const [courtFormName, setCourtFormName] = useState("");
  const [courtFormError, setCourtFormError] = useState<string | null>(null);
  const [editingCourt, setEditingCourt] = useState<CourtRow | null>(null);
  const [deleteCourtTarget, setDeleteCourtTarget] = useState<CourtRow | null>(null);

  const COLUMNS: Column<PlaySlotRow>[] = [
    { key: "id", label: "ID" },
    { key: "dayOfWeek", label: "Day" },
    { key: "time", label: "Time" },
    { key: "location", label: "Location" },
    { key: "title", label: "Title" },
    { key: "imageUrl", label: "Image", render: (r) => (r.imageUrl ? <img src={r.imageUrl} alt="" className="w-12 h-12 object-contain rounded" /> : "—") },
    { key: "maxCapacity", label: "Total spots" },
    { key: "price", label: "Price", render: (r) => `$${r.price}` },
    { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
    {
      key: "courts",
      label: "Courts",
      render: (r) => (
        <button
          type="button"
          onClick={() => {
            setCourtModalSlot(r);
            setCourtsLoading(true);
            setCourts([]);
            fetchCourts(r.id).then((list) => {
              setCourts(list);
              setCourtsLoading(false);
            });
            setCourtFormName("");
            setEditingCourt(null);
            setCourtFormError(null);
          }}
          className="rounded px-3 py-1.5 text-sm font-calibri text-rose-600 hover:bg-rose-50 border border-rose-200"
        >
          Manage
        </button>
      ),
    },
  ];

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/play-slots");
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
    setImageUploadError(null);
    setForm({
      day_of_week: "Wednesday",
      time: "7:00 PM - 10:00 PM",
      location: "",
      title: "",
      description: "",
      price: 20,
      max_capacity: 45,
      image_url: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: PlaySlotRow) => {
    setEditing(row);
    setImageUploadError(null);
    setForm({
      day_of_week: row.dayOfWeek,
      time: row.time,
      location: row.location,
      title: row.title,
      description: row.description ?? "",
      price: row.price,
      max_capacity: row.maxCapacity,
      image_url: row.imageUrl ?? "",
      is_active: row.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      dayOfWeek: form.day_of_week,
      time: form.time,
      location: form.location,
      title: form.title,
      description: form.description || undefined,
      price: form.price,
      maxCapacity: form.max_capacity,
      imageUrl: form.image_url || undefined,
      isActive: form.is_active,
    };
    try {
      if (editing) {
        const res = await apiFetch(`/api/play-slots/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to update play slot.");
          return;
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((r) => (r.id === editing.id ? updated : r))
        );
      } else {
        const res = await apiFetch("/api/play-slots", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to create play slot.");
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

  const handleDelete = async (row: PlaySlotRow) => {
    try {
      const res = await apiFetch(`/api/play-slots/${row.id}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // keep dialog open
    }
    setDeleteTarget(null);
  };

  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size must be less than 5MB.");
      return;
    }
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload/play-slot-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setForm((f) => ({ ...f, image_url: data.url }));
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadImageFile(file);
  };

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtModalSlot) return;
    setCourtFormError(null);
    const name = courtFormName.trim();
    if (!name) {
      setCourtFormError("Court name is required.");
      return;
    }
    try {
      const res = await apiFetch(`/api/play-slots/${courtModalSlot.id}/courts`, {
        method: "POST",
        body: JSON.stringify({ name, sortOrder: courts.length }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCourtFormError(data.message || "Failed to add court.");
        return;
      }
      const created = await res.json();
      setCourts((prev) => [...prev, created]);
      setCourtFormName("");
    } catch {
      setCourtFormError("Something went wrong.");
    }
  };

  const handleUpdateCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtModalSlot || !editingCourt) return;
    setCourtFormError(null);
    const name = courtFormName.trim();
    if (!name) {
      setCourtFormError("Court name is required.");
      return;
    }
    try {
      const res = await apiFetch(`/api/play-slots/${courtModalSlot.id}/courts/${editingCourt.id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCourtFormError(data.message || "Failed to update court.");
        return;
      }
      const updated = await res.json();
      setCourts((prev) => prev.map((c) => (c.id === editingCourt.id ? updated : c)));
      setEditingCourt(null);
      setCourtFormName("");
    } catch {
      setCourtFormError("Something went wrong.");
    }
  };

  const handleDeleteCourt = async (court: CourtRow) => {
    if (!courtModalSlot) return;
    try {
      const res = await apiFetch(`/api/play-slots/${courtModalSlot.id}/courts/${court.id}`, {
        method: "DELETE",
      });
      if (res.ok) setCourts((prev) => prev.filter((c) => c.id !== court.id));
    } catch {
      // keep dialog open
    }
    setDeleteCourtTarget(null);
  };

  return (
    <div className="space-y-4">
      <p className="font-calibri text-gray-600">
        Manage recurring play slots (e.g. Wednesday, Friday). Events are auto-generated from these slots. Edit <strong>Total spots</strong> to change max capacity for future sessions.
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
        >
          <FaPlus size={16} />
          Add Play Slot
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
          emptyMessage="No play slots yet. Add one to enable calendar session generation."
          sortable
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      )}
      <FormModal
        title={editing ? "Edit Play Slot" : "Add Play Slot"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        maxWidth="4xl"
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2 col-span-full">{formError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 col-span-full">
          <Select
            label="Day of week"
            name="day_of_week"
            value={form.day_of_week}
            onChange={(e) => setForm((f) => ({ ...f, day_of_week: e.target.value }))}
            options={DAY_OPTIONS}
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
            required
          />
          <TextInput
            label="Title"
            name="title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <NumberInput
            label="Total spots (max capacity)"
            name="max_capacity"
            value={form.max_capacity}
            onChange={(e) =>
              setForm((f) => ({ ...f, max_capacity: Number(e.target.value) || 0 }))
            }
          />
          <NumberInput
            label="Price"
            name="price"
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
            }
          />
          <div className="md:col-span-2 flex items-end">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <label htmlFor="is_active" className="font-calibri text-gray-700">
                Active
              </label>
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="block font-calibri text-sm font-medium text-gray-700">
              Slot Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="Upload slot image"
            />
            {form.image_url ? (
              <div className="relative rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
                <img
                  src={form.image_url}
                  alt="Slot preview"
                  className="w-full h-40 sm:h-48 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (imageUploading) return;
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/")) uploadImageFile(file);
                }}
                className="w-full min-h-[120px] sm:min-h-[140px] rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {imageUploading ? (
                  <>
                    <span className="animate-pulse text-rose-500">
                      <FaCloudUploadAlt size={28} />
                    </span>
                    <span className="text-sm font-calibri text-gray-600">Uploading…</span>
                  </>
                ) : (
                  <>
                    <FaImage className="text-gray-400" size={28} />
                    <span className="text-sm font-calibri text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs font-calibri text-gray-500">
                      PNG, JPG up to 5MB
                    </span>
                  </>
                )}
              </button>
            )}
            {imageUploadError && (
              <p className="mt-1 text-sm text-red-600 font-calibri">{imageUploadError}</p>
            )}
          </div>
        </div>
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Play Slot"
        message={
          deleteTarget
            ? `Delete play slot "${deleteTarget.title}"? Future events will not be generated from this slot.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
      {courtModalSlot && (
        <FormModal
          title={`Courts: ${courtModalSlot.title} (${courtModalSlot.dayOfWeek} )`}
          open={!!courtModalSlot}
          onClose={() => {
            setCourtModalSlot(null);
            setEditingCourt(null);
            setCourtFormName("");
            setCourtFormError(null);
          }}
          onSubmit={editingCourt ? handleUpdateCourt : handleAddCourt}
          maxWidth="lg"
          titleClassName="font-calibri text-xl text-gray-800"
        >
          <div className="space-y-4">
            {courtFormError && (
              <p className="text-sm text-red-600 font-calibri">{courtFormError}</p>
            )}
            <div className="flex gap-2">
              <TextInput
                label={editingCourt ? "Edit court name" : "New court name"}
                name="court_name"
                value={courtFormName}
                onChange={(e) => setCourtFormName(e.target.value)}
                placeholder="e.g. Court 1"
              />
              <div className="flex items-end gap-2">
                {editingCourt ? (
                  <>
                    <button
                      type="submit"
                      className="rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourt(null);
                        setCourtFormName("");
                        setCourtFormError(null);
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
                  >
                    Add Court
                  </button>
                )}
              </div>
            </div>
            {courtsLoading ? (
              <p className="font-calibri text-gray-500">Loading courts…</p>
            ) : courts.length === 0 ? (
              <p className="font-calibri text-gray-500">No courts yet. Add one above.</p>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {courts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50">
                    <span className="font-calibri text-gray-800">{c.name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCourt(c);
                          setCourtFormName(c.name);
                          setCourtFormError(null);
                        }}
                        className="rounded p-2 text-rose-600 hover:bg-rose-100"
                        aria-label="Edit court"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCourtTarget(c)}
                        className="rounded p-2 text-red-600 hover:bg-red-100"
                        aria-label="Delete court"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FormModal>
      )}
      <ConfirmDialog
        open={!!deleteCourtTarget}
        title="Delete Court"
        message={
          deleteCourtTarget
            ? `Delete court "${deleteCourtTarget.name}"?`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteCourtTarget && handleDeleteCourt(deleteCourtTarget)}
        onCancel={() => setDeleteCourtTarget(null)}
      />
    </div>
  );
};

export default PlaySlotsSection;
