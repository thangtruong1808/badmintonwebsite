import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  Checkbox,
  FormActions,
} from "../Shared/inputs";

export interface RegistrationRow {
  id: string;
  event_id: number;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  registration_date: string;
  status: string;
  attendance_status: string;
  points_earned: number;
  points_claimed: boolean;
  payment_method: string;
  points_used: number;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

const ATTENDANCE_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "attended", label: "Attended" },
  { value: "no-show", label: "No-show" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_OPTIONS = [
  { value: "stripe", label: "Stripe" },
  { value: "points", label: "Points" },
  { value: "mixed", label: "Mixed" },
];

const COLUMNS: Column<RegistrationRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 8) + "…" },
  { key: "event_id", label: "Event ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
  { key: "attendance_status", label: "Attendance" },
  { key: "registration_date", label: "Date", render: (r) => r.registration_date.slice(0, 10) },
  { key: "payment_method", label: "Payment" },
  { key: "points_used", label: "Points Used" },
];

const RegistrationsSection: React.FC = () => {
  const [items, setItems] = useState<RegistrationRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RegistrationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegistrationRow | null>(null);
  const [form, setForm] = useState({
    event_id: 1,
    user_id: "",
    name: "",
    email: "",
    phone: "",
    registration_date: new Date().toISOString().slice(0, 16),
    status: "pending",
    attendance_status: "upcoming",
    points_earned: 0,
    points_claimed: false,
    payment_method: "stripe",
    points_used: 0,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      event_id: 1,
      user_id: "",
      name: "",
      email: "",
      phone: "",
      registration_date: new Date().toISOString().slice(0, 16),
      status: "pending",
      attendance_status: "upcoming",
      points_earned: 0,
      points_claimed: false,
      payment_method: "stripe",
      points_used: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (row: RegistrationRow) => {
    setEditing(row);
    setForm({
      event_id: row.event_id,
      user_id: row.user_id ?? "",
      name: row.name,
      email: row.email,
      phone: row.phone,
      registration_date: row.registration_date.slice(0, 16),
      status: row.status,
      attendance_status: row.attendance_status,
      points_earned: row.points_earned,
      points_claimed: row.points_claimed,
      payment_method: row.payment_method,
      points_used: row.points_used,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const regDate = form.registration_date.replace("T", " ") + ":00";
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              event_id: form.event_id,
              user_id: form.user_id || undefined,
              name: form.name,
              email: form.email,
              phone: form.phone,
              registration_date: regDate,
              status: form.status,
              attendance_status: form.attendance_status,
              points_earned: form.points_earned,
              points_claimed: form.points_claimed,
              payment_method: form.payment_method,
              points_used: form.points_used,
            }
            : r
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `reg-${Date.now()}`,
          event_id: form.event_id,
          user_id: form.user_id || undefined,
          name: form.name,
          email: form.email,
          phone: form.phone,
          registration_date: regDate,
          status: form.status,
          attendance_status: form.attendance_status,
          points_earned: form.points_earned,
          points_claimed: form.points_claimed,
          payment_method: form.payment_method,
          points_used: form.points_used,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: RegistrationRow) => {
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
          Add Registration
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No registrations yet. Click Add Registration to create one."
      />
      <FormModal
        title={editing ? "Edit Registration" : "Add Registration"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <NumberInput
          label="Event ID"
          name="event_id"
          value={form.event_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, event_id: Number(e.target.value) || 0 }))
          }
        />
        <TextInput
          label="User ID (optional)"
          name="user_id"
          value={form.user_id}
          onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
        />
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
          required
        />
        <TextInput
          label="Registration date"
          name="registration_date"
          type="datetime-local"
          value={form.registration_date}
          onChange={(e) =>
            setForm((f) => ({ ...f, registration_date: e.target.value }))
          }
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <Select
          label="Attendance status"
          name="attendance_status"
          value={form.attendance_status}
          onChange={(e) =>
            setForm((f) => ({ ...f, attendance_status: e.target.value }))
          }
          options={ATTENDANCE_OPTIONS}
        />
        <NumberInput
          label="Points earned"
          name="points_earned"
          value={form.points_earned}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              points_earned: Number(e.target.value) || 0,
            }))
          }
        />
        <Checkbox
          label="Points claimed"
          name="points_claimed"
          checked={form.points_claimed}
          onChange={(e) =>
            setForm((f) => ({ ...f, points_claimed: e.target.checked }))
          }
        />
        <Select
          label="Payment method"
          name="payment_method"
          value={form.payment_method}
          onChange={(e) =>
            setForm((f) => ({ ...f, payment_method: e.target.value }))
          }
          options={PAYMENT_OPTIONS}
        />
        <NumberInput
          label="Points used"
          name="points_used"
          value={form.points_used}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              points_used: Number(e.target.value) || 0,
            }))
          }
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Registration"
        message={
          deleteTarget
            ? `Delete registration for "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default RegistrationsSection;
