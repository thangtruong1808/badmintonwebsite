import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";
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
  guest_count?: number;
  created_at?: string;
}

interface GuestRow {
  id: number;
  name: string;
  sortOrder: number;
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
  const [loading, setLoading] = useState(true);
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
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [guestFormName, setGuestFormName] = useState("");
  const [editingGuest, setEditingGuest] = useState<GuestRow | null>(null);
  const [guestFormError, setGuestFormError] = useState<string | null>(null);
  const [deleteGuestTarget, setDeleteGuestTarget] = useState<GuestRow | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/registrations");
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
    setGuests([]);
    setGuestFormName("");
    setEditingGuest(null);
    setGuestFormError(null);
    setModalOpen(true);
    if (row.id) {
      setGuestsLoading(true);
      apiFetch(`/api/dashboard/registrations/${row.id}/guests`)
        .then((res) => (res.ok ? res.json() : { guests: [] }))
        .then((data) => setGuests(data.guests ?? []))
        .catch(() => setGuests([]))
        .finally(() => setGuestsLoading(false));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing?.id) {
      try {
        const payload = guests.map((g) => ({ id: g.id, name: g.name }));
        const res = await apiFetch(`/api/dashboard/registrations/${editing.id}/guests`, {
          method: "PUT",
          body: JSON.stringify({ guests: payload }),
        });
        if (res.ok) {
          setModalOpen(false);
          fetchList();
        } else {
          const data = await res.json().catch(() => ({}));
          setGuestFormError(data.message || "Failed to save guest names.");
        }
      } catch {
        setGuestFormError("Failed to save guest names.");
      }
    } else {
      setModalOpen(false);
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestFormName.trim();
    if (!name) {
      setGuestFormError("Guest name is required.");
      return;
    }
    setGuests((prev) => [...prev, { id: -Date.now(), name, sortOrder: prev.length }]);
    setGuestFormName("");
    setGuestFormError(null);
  };

  const handleUpdateGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const name = guestFormName.trim();
    if (!editingGuest || !name) {
      setGuestFormError("Guest name is required.");
      return;
    }
    setGuests((prev) => prev.map((g) => (g.id === editingGuest.id ? { ...g, name } : g)));
    setEditingGuest(null);
    setGuestFormName("");
    setGuestFormError(null);
  };

  const handleRemoveGuest = (g: GuestRow) => {
    setGuests((prev) => prev.filter((x) => x.id !== g.id));
  };

  const handleDelete = (_row: RegistrationRow) => {
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
      {loading ? (
        <p className="font-calibri text-gray-600">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={items}
          getRowId={(r) => r.id}
          onEdit={openEdit}
          onDelete={(r) => setDeleteTarget(r)}
          emptyMessage="No registrations yet."
        />
      )}
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
        {editing && (
          <div className="col-span-full border-t border-gray-200 pt-4 mt-4 space-y-3">
            <h3 className="font-calibri font-semibold text-gray-800">Guest names (friends)</h3>
            {guestFormError && (
              <p className="text-sm text-red-600 font-calibri">{guestFormError}</p>
            )}
            <div className="flex gap-2 items-end">
              <TextInput
                label={editingGuest ? "Edit guest name" : "Add guest name"}
                name="guest_name"
                value={guestFormName}
                onChange={(e) => setGuestFormName(e.target.value)}
                placeholder="e.g. John"
              />
              {editingGuest ? (
                <>
                  <button
                    type="button"
                    onClick={handleUpdateGuest}
                    className="rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingGuest(null); setGuestFormName(""); setGuestFormError(null); }}
                    className="rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleAddGuest}
                  className="rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600"
                >
                  Add
                </button>
              )}
            </div>
            {guestsLoading ? (
              <p className="font-calibri text-gray-500 text-sm">Loading guests…</p>
            ) : guests.length === 0 ? (
              <p className="font-calibri text-gray-500 text-sm">No guest names. Add above.</p>
            ) : (
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                {guests.map((g) => (
                  <li key={g.id} className="flex items-center justify-between px-4 py-2 bg-white hover:bg-gray-50">
                    <span className="font-calibri text-gray-800">{g.name}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => { setEditingGuest(g); setGuestFormName(g.name); setGuestFormError(null); }}
                        className="rounded p-1.5 text-rose-600 hover:bg-rose-100"
                        aria-label="Edit guest"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteGuestTarget(g)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-100"
                        aria-label="Remove guest"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
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
      <ConfirmDialog
        open={!!deleteGuestTarget}
        title="Remove Guest"
        message={
          deleteGuestTarget
            ? `Remove guest "${deleteGuestTarget.name}" from the list?`
            : ""
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteGuestTarget) handleRemoveGuest(deleteGuestTarget);
          setDeleteGuestTarget(null);
        }}
        onCancel={() => setDeleteGuestTarget(null)}
      />
    </div>
  );
};

export default RegistrationsSection;
