import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash, FaSpinner } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";
import { formatDateDDMonthYYYY, formatDateTime } from "../../../utils/dateUtils";
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
  event_day_of_week?: string | null;
  refund_review_status?: string | null;
  cancelled_at?: string | null;
  stripe_payment_intent_id?: string | null;
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

const getStatusDisplay = (r: RegistrationRow): string => {
  if ((r.status ?? "").toLowerCase() !== "cancelled") {
    return r.status ?? "";
  }
  const review = (r.refund_review_status ?? "none").toLowerCase();
  return review === "pending_review" ? "Cancelled (<24hrs)" : "Cancelled (24hrs+)";
};

const RegistrationsSection: React.FC = () => {
  const [items, setItems] = useState<RegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<RegistrationRow>[] = [
      {
        key: "seq",
        label: "No.",
        render: (_r, index) => (
          <span className="font-calibri text-sm font-medium text-gray-700">
            {index + 1}
          </span>
        ),
      },
      {
        key: "event_day_of_week",
        label: "Day",
        render: (r) => (
          <span className="font-calibri text-sm text-gray-700">
            {r.event_day_of_week ?? "—"}
          </span>
        ),
      },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      {
        key: "status",
        label: "Status",
        render: (r) => (
          <span className="font-calibri text-sm text-gray-700">
            {getStatusDisplay(r)}
          </span>
        ),
      },
      { key: "attendance_status", label: "Attendance" },
      {
        key: "registration_date",
        label: "Date",
        render: (r) => formatDateDDMonthYYYY(r.registration_date),
      },
      {
        key: "created_at",
        label: "Registered at",
        render: (r) => (
          <span className="font-calibri text-sm text-gray-700">
            {formatDateTime(r.created_at)}
          </span>
        ),
      },
      { key: "payment_method", label: "Payment" },
      { key: "points_used", label: "Points Used" },
      {
        key: "refund_action",
        label: "Refund",
        render: (r) => {
          const isCancelled = (r.status ?? "").toLowerCase() === "cancelled";
          const review = (r.refund_review_status ?? "").toLowerCase();
          const pendingReview = review === "pending_review";
          const approved = review === "approved";
          const none = review === "none";
          const denied = review === "denied";
          const hasStripe =
            (r.stripe_payment_intent_id ?? "").trim().length > 0;
          const isStripe =
            (r.payment_method ?? "stripe").toLowerCase() === "stripe";
          const eligible =
            isCancelled && pendingReview && hasStripe && isStripe;
          const isRefunding = refundingId === r.id;

          if (eligible) {
            return (
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!r.id || isRefunding) return;
                  setRefundError(null);
                  setRefundingId(r.id);
                  try {
                    const res = await apiFetch(
                      `/api/dashboard/registrations/${r.id}/request-refund`,
                      { method: "POST" }
                    );
                    const data = await res.json().catch(() => ({}));
                    if (res.ok) {
                      await fetchList();
                    } else {
                      setRefundError(data.message || "Failed to process refund.");
                    }
                  } catch {
                    setRefundError("Failed to process refund. Please try again.");
                  } finally {
                    setRefundingId(null);
                  }
                }}
                disabled={isRefunding}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-sm font-calibri text-rose-700 hover:bg-rose-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {isRefunding ? (
                  <FaSpinner className="animate-spin shrink-0" size={12} aria-hidden />
                ) : null}
                <span>{isRefunding ? "Processing…" : "Request refund"}</span>
              </button>
            );
          }
          if (isCancelled && isStripe && (approved || none)) {
            return <span className="font-calibri text-sm text-green-600">Refunded</span>;
          }
          if (isCancelled && denied) {
            return <span className="font-calibri text-sm text-gray-600">Denied</span>;
          }
          return <span className="font-calibri text-sm text-gray-400">—</span>;
        },
      },
    ];

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

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q) ||
        getStatusDisplay(r).toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

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

  const handleDelete = async (row: RegistrationRow) => {
    if (!row.id) return;
    setIsDeleting(true);
    setRefundError(null);
    try {
      const res = await apiFetch(`/api/dashboard/registrations/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        await fetchList();
      } else {
        const data = await res.json().catch(() => ({}));
        setRefundError(data.message || "Failed to delete registration.");
      }
    } catch {
      setRefundError("Failed to delete registration. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="registrations-search" className="sr-only">
            Search by name, email or status
          </label>
          <input
            id="registrations-search"
            type="search"
            placeholder="Search by name, email or status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
            aria-label="Search by name, email or status"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 font-calibri text-white hover:bg-rose-600 shrink-0"
        >
          <FaPlus size={16} />
          Add Registration
        </button>
      </div>
      {refundError && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-calibri text-red-700">
          {refundError}
          <button
            type="button"
            onClick={() => setRefundError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filteredItems}
        loading={loading}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No registrations yet."
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
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
              <div className="flex items-center gap-2 py-2">
                <FaSpinner className="animate-spin text-rose-500" size={14} />
                <span className="font-calibri text-gray-500 text-sm">Loading guests…</span>
              </div>
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
        confirmLoading={isDeleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
            setRefundError(null);
          }
        }}
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
