import React, { useState, useEffect, useMemo } from "react";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";
import { formatDateDDMonthYYYY } from "../../../utils/dateUtils";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  TextArea,
  FormActions,
} from "../Shared/inputs";

export interface RewardTransactionRow {
  id: string;
  user_id: string;
  event_id?: number;
  event_title?: string;
  points: number;
  type: string;
  description?: string;
  date: string;
  status: string;
  created_at?: string;
}

const TYPE_OPTIONS = [
  { value: "earned", label: "Earned" },
  { value: "spent", label: "Spent" },
  { value: "bonus", label: "Bonus" },
  { value: "refund", label: "Refund" },
];

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: Column<RewardTransactionRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 10) + "…" },
  { key: "user_id", label: "User ID", render: (r) => r.user_id.slice(0, 12) + "…" },
  { key: "event_title", label: "Event", render: (r) => r.event_title ?? "—" },
  { key: "points", label: "Points" },
  { key: "type", label: "Type" },
  { key: "date", label: "Date", render: (r) => formatDateDDMonthYYYY(r.date) },
  { key: "status", label: "Status" },
];

const RewardTransactionsSection: React.FC = () => {
  const [items, setItems] = useState<RewardTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RewardTransactionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RewardTransactionRow | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    event_id: "",
    event_title: "",
    points: 0,
    type: "earned",
    description: "",
    date: new Date().toISOString().slice(0, 16),
    status: "completed",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/reward-transactions");
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
        (r.user_id ?? "").toLowerCase().includes(q) ||
        (r.event_title ?? "").toLowerCase().includes(q) ||
        (r.type ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const openEdit = (row: RewardTransactionRow) => {
    setEditing(row);
    setForm({
      user_id: row.user_id,
      event_id: row.event_id != null ? String(row.event_id) : "",
      event_title: row.event_title ?? "",
      points: row.points,
      type: row.type,
      description: row.description ?? "",
      date: row.date.slice(0, 16),
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(false);
  };

  const handleDelete = (_row: RewardTransactionRow) => {
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="w-full sm:max-w-xs">
        <label htmlFor="reward-transactions-search" className="sr-only">
          Search by user ID, event title, type or status
        </label>
        <input
          id="reward-transactions-search"
          type="search"
          placeholder="Search by user, event, type or status"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
          aria-label="Search by user ID, event title, type or status"
        />
      </div>
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        loading={loading}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No reward transactions yet."
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
      <FormModal
        title={editing ? "Edit Reward Transaction" : "Add Reward Transaction"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        <TextInput
          label="User ID"
          name="user_id"
          value={form.user_id}
          onChange={(e) => setForm((f) => ({ ...f, user_id: e.target.value }))}
          required
        />
        <TextInput
          label="Event ID (optional)"
          name="event_id"
          type="number"
          value={form.event_id}
          onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
        />
        <TextInput
          label="Event title"
          name="event_title"
          value={form.event_title}
          onChange={(e) =>
            setForm((f) => ({ ...f, event_title: e.target.value }))
          }
        />
        <NumberInput
          label="Points"
          name="points"
          value={form.points}
          onChange={(e) =>
            setForm((f) => ({ ...f, points: Number(e.target.value) || 0 }))
          }
        />
        <Select
          label="Type"
          name="type"
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          options={TYPE_OPTIONS}
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
          label="Date"
          name="date"
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          options={STATUS_OPTIONS}
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Transaction"
        message={
          deleteTarget
            ? `Delete this reward transaction? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default RewardTransactionsSection;
