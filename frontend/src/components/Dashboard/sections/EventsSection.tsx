import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRow | null>(null);
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

  const openCreate = () => {
    setEditing(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = form.price ? parseFloat(form.price) : undefined;
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              title: form.title,
              date: form.date,
              time: form.time,
              day_of_week: form.day_of_week,
              location: form.location,
              description: form.description || undefined,
              max_capacity: form.max_capacity,
              current_attendees: form.current_attendees,
              price: priceNum,
              image_url: form.image_url || undefined,
              status: form.status,
              category: form.category,
              recurring: form.recurring,
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
          title: form.title,
          date: form.date,
          time: form.time,
          day_of_week: form.day_of_week,
          location: form.location,
          description: form.description || undefined,
          max_capacity: form.max_capacity,
          current_attendees: form.current_attendees,
          price: priceNum,
          image_url: form.image_url || undefined,
          status: form.status,
          category: form.category,
          recurring: form.recurring,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: EventRow) => {
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
          Add Event
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No events yet. Click Add Event to create one."
      />
      <FormModal
        title={editing ? "Edit Event" : "Add Event"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
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
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
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
        <TextInput
          label="Image URL"
          name="image_url"
          value={form.image_url}
          onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
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
        <Checkbox
          label="Recurring"
          name="recurring"
          checked={form.recurring}
          onChange={(e) =>
            setForm((f) => ({ ...f, recurring: e.target.checked }))
          }
        />
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
