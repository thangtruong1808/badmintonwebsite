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

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  reward_points: number;
  member_since: string;
  created_at?: string;
}

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "—" },
  { value: "stripe", label: "Stripe" },
  { value: "points", label: "Points" },
  { value: "mixed", label: "Mixed" },
];

const COLUMNS: Column<UserRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 12) + "…" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "reward_points", label: "Points" },
  { key: "member_since", label: "Member Since" },
];

const UsersSection: React.FC = () => {
  const [items, setItems] = useState<UserRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    default_payment_method: "",
    reward_points: 0,
    total_points_earned: 0,
    total_points_spent: 0,
    member_since: new Date().toISOString().slice(0, 10),
    avatar: "",
    password: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "user",
      default_payment_method: "",
      reward_points: 0,
      total_points_earned: 0,
      total_points_spent: 0,
      member_since: new Date().toISOString().slice(0, 10),
      avatar: "",
      password: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row: UserRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      phone: row.phone ?? "",
      role: row.role,
      default_payment_method: "",
      reward_points: row.reward_points,
      total_points_earned: row.reward_points,
      total_points_spent: 0,
      member_since: row.member_since,
      avatar: "",
      password: "",
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
              name: form.name,
              email: form.email,
              phone: form.phone || undefined,
              role: form.role,
              reward_points: form.reward_points,
              member_since: form.member_since,
            }
            : r
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          reward_points: form.reward_points,
          member_since: form.member_since,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: UserRow) => {
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
          Add User
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No users yet. Click Add User to create one."
      />
      <FormModal
        title={editing ? "Edit User" : "Add User"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
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
          disabled={!!editing}
        />
        <TextInput
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <Select
          label="Role"
          name="role"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          options={ROLE_OPTIONS}
        />
        <Select
          label="Default payment method"
          name="default_payment_method"
          value={form.default_payment_method}
          onChange={(e) =>
            setForm((f) => ({ ...f, default_payment_method: e.target.value }))
          }
          options={PAYMENT_METHOD_OPTIONS}
        />
        <NumberInput
          label="Reward points"
          name="reward_points"
          value={form.reward_points}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              reward_points: Number(e.target.value) || 0,
            }))
          }
        />
        <TextInput
          label="Member since (date)"
          name="member_since"
          type="date"
          value={form.member_since}
          onChange={(e) => setForm((f) => ({ ...f, member_since: e.target.value }))}
        />
        {!editing && (
          <TextInput
            label="Password (optional for mock)"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        )}
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={
          deleteTarget
            ? `Delete user "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersSection;
