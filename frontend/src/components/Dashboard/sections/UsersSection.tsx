import React, { useState, useEffect } from "react";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  Select,
  FormActions,
} from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

export interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
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
  { key: "firstName", label: "Name", render: (r) => `${r.firstName} ${r.lastName}`.trim() },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "reward_points", label: "Points" },
  { key: "member_since", label: "Member Since" },
];

function toUserRow(u: { id: string; firstName: string; lastName: string; email: string; phone?: string; role: string; rewardPoints: number; memberSince: string; created_at?: string }): UserRow {
  return {
    id: u.id,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: u.email,
    phone: u.phone,
    role: u.role,
    reward_points: u.rewardPoints,
    member_since: u.memberSince,
    created_at: u.created_at,
  };
}

const UsersSection: React.FC = () => {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
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

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/users");
      if (res.ok) {
        const list = await res.json();
        setItems(Array.isArray(list) ? list.map(toUserRow) : []);
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

  const openEdit = (row: UserRow) => {
    setFormError(null);
    setEditing(row);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editing) return;
    try {
      const res = await apiFetch(`/api/dashboard/users/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          role: form.role,
          rewardPoints: form.reward_points,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || "Failed to update user.");
        return;
      }
      const updated = await res.json();
      setItems((prev) =>
        prev.map((r) => (r.id === editing.id ? toUserRow(updated) : r))
      );
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="font-calibri text-gray-600">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={items}
          getRowId={(r) => r.id}
          onEdit={openEdit}
          onDelete={(r) => setDeleteTarget(r)}
          emptyMessage="No users yet."
        />
      )}
      <FormModal
        title="Edit User"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
        <TextInput
          label="First name"
          name="firstName"
          value={form.firstName}
          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
          required
        />
        <TextInput
          label="Last name"
          name="lastName"
          value={form.lastName}
          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
          required
        />
        <TextInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
          disabled
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
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={
          deleteTarget
            ? "User deletion is not available from the dashboard. Use your database or user management tools."
            : ""
        }
        confirmLabel="OK"
        onConfirm={() => setDeleteTarget(null)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default UsersSection;
