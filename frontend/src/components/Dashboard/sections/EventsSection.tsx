import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaImage, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch, API_BASE } from "../../../utils/api";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  TextArea,
  Checkbox,
  FormActions,
} from "../Shared/inputs";

export interface EventRow {
  id: number;
  title: string;
  date: string;
  time: string;
  day_of_week: string;
  location: string;
  description?: string;
  max_capacity: number;
  current_attendees: number;
  price?: number;
  image_url?: string;
  status: string;
  category: string;
  recurring: boolean;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "full", label: "Full" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CATEGORY_OPTIONS = [
  { value: "regular", label: "Regular" },
  { value: "tournament", label: "Tournament" },
];

const DAY_OPTIONS = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

function toEventRow(e: {
  id: number;
  title: string;
  date: string;
  time: string;
  dayOfWeek: string;
  location: string;
  description?: string;
  maxCapacity: number;
  currentAttendees: number;
  price?: number;
  imageUrl?: string;
  status: string;
  category: string;
  recurring?: boolean;
  created_at?: string;
}): EventRow {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    day_of_week: e.dayOfWeek,
    location: e.location,
    description: e.description,
    max_capacity: e.maxCapacity,
    current_attendees: e.currentAttendees,
    price: e.price,
    image_url: e.imageUrl,
    status: e.status,
    category: e.category,
    recurring: e.recurring ?? false,
    created_at: e.created_at,
  };
}

const COLUMNS: Column<EventRow>[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
  { key: "category", label: "Category" },
  { key: "max_capacity", label: "Capacity" },
  { key: "current_attendees", label: "Attendees" },
  { key: "price", label: "Price", render: (r) => r.price ?? "—" },
];

const EventsSection: React.FC = () => {
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    day_of_week: "Wednesday",
    location: "",
    description: "",
    max_capacity: 20,
    current_attendees: 0,
    price: "",
    image_url: "",
    status: "available",
    category: "regular",
    recurring: false,
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/events");
      if (res.ok) {
        const list = await res.json();
        setItems(Array.isArray(list) ? list.map(toEventRow) : []);
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
      title: "",
      date: new Date().toISOString().slice(0, 10),
      time: "7:00 PM",
      day_of_week: "Wednesday",
      location: "",
      description: "",
      max_capacity: 20,
      current_attendees: 0,
      price: "",
      image_url: "",
      status: "available",
      category: "regular",
      recurring: false,
    });
    setModalOpen(true);
  };

  const openEdit = (row: EventRow) => {
    setEditing(row);
    setImageUploadError(null);
    setForm({
      title: row.title,
      date: row.date,
      time: row.time,
      day_of_week: row.day_of_week,
      location: row.location,
      description: row.description ?? "",
      max_capacity: row.max_capacity,
      current_attendees: row.current_attendees,
      price: row.price != null ? String(row.price) : "",
      image_url: row.image_url ?? "",
      status: row.status,
      category: row.category,
      recurring: row.recurring,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const priceNum = form.price ? parseFloat(form.price) : undefined;
    const payload = {
      title: form.title,
      date: form.date,
      time: form.time,
      dayOfWeek: form.day_of_week,
      location: form.location,
      description: form.description || undefined,
      maxCapacity: form.max_capacity,
      currentAttendees: form.current_attendees,
      price: priceNum,
      imageUrl: form.image_url || undefined,
      status: form.status,
      category: form.category,
      recurring: form.recurring,
    };
    try {
      if (editing) {
        const res = await apiFetch(`/api/events/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to update event.");
          return;
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((r) => (r.id === editing.id ? toEventRow(updated) : r))
        );
      } else {
        const res = await apiFetch("/api/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to create event.");
          return;
        }
        const created = await res.json();
        setItems((prev) => [toEventRow(created), ...prev]);
      }
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = async (row: EventRow) => {
    try {
      const res = await apiFetch(`/api/events/${row.id}`, { method: "DELETE" });
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
      const res = await fetch(`${API_BASE}/api/upload/event-image`, {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
        >
          <FaPlus size={16} />
          Add Event
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
          emptyMessage="No events yet. Click Add Event to create one."
          sortable
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      )}
      <FormModal
        title={editing ? "Edit Event" : "Add Event"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        maxWidth="4xl"
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2 col-span-full">{formError}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 col-span-full">
          <div className="md:col-span-2">
            <TextInput
              label="Title"
              name="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <TextInput
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            required
          />
          <TextInput
            label="Time"
            name="time"
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
          />
          <Select
            label="Day of week"
            name="day_of_week"
            value={form.day_of_week}
            onChange={(e) =>
              setForm((f) => ({ ...f, day_of_week: e.target.value }))
            }
            options={DAY_OPTIONS}
          />
          <TextInput
            label="Location"
            name="location"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            required
          />
          <div className="md:col-span-2">
            <TextArea
              label="Description"
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <NumberInput
            label="Max capacity"
            name="max_capacity"
            value={form.max_capacity}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                max_capacity: Number(e.target.value) || 0,
              }))
            }
          />
          <NumberInput
            label="Current attendees"
            name="current_attendees"
            value={form.current_attendees}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                current_attendees: Number(e.target.value) || 0,
              }))
            }
          />
          <TextInput
            label="Price (optional)"
            name="price"
            type="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={CATEGORY_OPTIONS}
          />
          <div className="md:col-span-2 flex items-end">
            <Checkbox
              label="Recurring"
              name="recurring"
              checked={form.recurring}
              onChange={(e) =>
                setForm((f) => ({ ...f, recurring: e.target.checked }))
              }
            />
          </div>
          {/* Event Image Upload */}
          <div className="md:col-span-2 space-y-2">
            <label className="block font-calibri text-sm font-medium text-gray-700">
              Event Image
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Upload event image"
                />
                {form.image_url ? (
                  <div className="relative rounded-lg border border-gray-300 overflow-hidden bg-gray-50">
                    <img
                      src={form.image_url}
                      alt="Event preview"
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
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (imageUploading) return;
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) uploadImageFile(file);
                    }}
                    disabled={imageUploading}
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
          </div>
        </div>
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Event"
        message={
          deleteTarget
            ? `Delete event "${deleteTarget.title}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default EventsSection;
