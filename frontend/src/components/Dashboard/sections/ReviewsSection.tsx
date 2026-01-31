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

export interface ReviewRow {
  id: number;
  user_id?: string;
  name: string;
  rating: number;
  review_date: string;
  review_text: string;
  is_verified: boolean;
  status: string;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "hidden", label: "Hidden" },
  { value: "deleted", label: "Deleted" },
];

const RATING_OPTIONS = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];

const COLUMNS: Column<ReviewRow>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "rating", label: "Rating" },
  { key: "review_date", label: "Date" },
  { key: "status", label: "Status" },
  { key: "is_verified", label: "Verified", render: (r) => (r.is_verified ? "Yes" : "No") },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const ReviewsSection: React.FC = () => {
  const [items, setItems] = useState<ReviewRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    rating: 5,
    review_date: new Date().toISOString().slice(0, 10),
    review_text: "",
    is_verified: false,
    status: "active",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      user_id: "",
      name: "",
      rating: 5,
      review_date: new Date().toISOString().slice(0, 10),
      review_text: "",
      is_verified: false,
      status: "active",
    });
    setModalOpen(true);
  };

  const openEdit = (row: ReviewRow) => {
    setEditing(row);
    setForm({
      user_id: row.user_id ?? "",
      name: row.name,
      rating: row.rating,
      review_date: row.review_date,
      review_text: row.review_text,
      is_verified: row.is_verified,
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              user_id: form.user_id || undefined,
              name: form.name,
              rating: form.rating,
              review_date: form.review_date,
              review_text: form.review_text,
              is_verified: form.is_verified,
              status: form.status,
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
          user_id: form.user_id || undefined,
          name: form.name,
          rating: form.rating,
          review_date: form.review_date,
          review_text: form.review_text,
          is_verified: form.is_verified,
          status: form.status,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: ReviewRow) => {
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
          Add Review
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No reviews yet. Click Add Review to create one."
      />
      <FormModal
        title={editing ? "Edit Review" : "Add Review"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
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
        <Select
          label="Rating (1–5)"
          name="rating"
          value={String(form.rating)}
          onChange={(e) =>
            setForm((f) => ({ ...f, rating: Number(e.target.value) }))
          }
          options={RATING_OPTIONS}
        />
        <TextInput
          label="Review date"
          name="review_date"
          type="date"
          value={form.review_date}
          onChange={(e) =>
            setForm((f) => ({ ...f, review_date: e.target.value }))
          }
          required
        />
        <TextArea
          label="Review text"
          name="review_text"
          value={form.review_text}
          onChange={(e) =>
            setForm((f) => ({ ...f, review_text: e.target.value }))
          }
          required
        />
        <Checkbox
          label="Is verified"
          name="is_verified"
          checked={form.is_verified}
          onChange={(e) =>
            setForm((f) => ({ ...f, is_verified: e.target.checked }))
          }
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
        title="Delete Review"
        message={
          deleteTarget
            ? `Delete review by "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ReviewsSection;
