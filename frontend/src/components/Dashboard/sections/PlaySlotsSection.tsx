import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";
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
  isActive: boolean;
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

const COLUMNS: Column<PlaySlotRow>[] = [
  { key: "id", label: "ID" },
  { key: "dayOfWeek", label: "Day" },
  { key: "time", label: "Time" },
  { key: "location", label: "Location" },
  { key: "title", label: "Title" },
  { key: "maxCapacity", label: "Total spots" },
  { key: "price", label: "Price", render: (r) => `$${r.price}` },
  { key: "isActive", label: "Active", render: (r) => (r.isActive ? "Yes" : "No") },
];

const PlaySlotsSection: React.FC = () => {
  const [items, setItems] = useState<PlaySlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlaySlotRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlaySlotRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    day_of_week: "Wednesday",
    time: "7:00 PM - 10:00 PM",
    location: "",
    title: "",
    description: "",
    price: 20,
    max_capacity: 45,
    is_active: true,
  });

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
    setForm({
      day_of_week: "Wednesday",
      time: "7:00 PM - 10:00 PM",
      location: "",
      title: "",
      description: "",
      price: 20,
      max_capacity: 45,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: PlaySlotRow) => {
    setEditing(row);
    setForm({
      day_of_week: row.dayOfWeek,
      time: row.time,
      location: row.location,
      title: row.title,
      description: row.description ?? "",
      price: row.price,
      max_capacity: row.maxCapacity,
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
        />
      )}
      <FormModal
        title={editing ? "Edit Play Slot" : "Add Play Slot"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
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
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
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
    </div>
  );
};

export default PlaySlotsSection;
