import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  Select,
  TextArea,
  Checkbox,
  FormActions,
} from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

export interface ServiceRequestRow {
  id: number;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  racket_brand: string;
  racket_model: string;
  string_type: string;
  string_colour?: string;
  tension: string;
  stencil: boolean;
  grip: boolean;
  grommet_replacement?: string;
  message?: string;
  status: string;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const COLUMNS: Column<ServiceRequestRow>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "racket_brand", label: "Racket Brand" },
  { key: "racket_model", label: "Racket Model" },
  { key: "status", label: "Status" },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const ServiceRequestsSection: React.FC = () => {
  const [items, setItems] = useState<ServiceRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRequestRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequestRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    racket_brand: "",
    racket_model: "",
    string_type: "",
    string_colour: "",
    tension: "",
    stencil: false,
    grip: false,
    grommet_replacement: "",
    message: "",
    status: "pending",
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/service-requests");
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
      user_id: "",
      name: "",
      email: "",
      phone: "",
      racket_brand: "",
      racket_model: "",
      string_type: "",
      string_colour: "",
      tension: "",
      stencil: false,
      grip: false,
      grommet_replacement: "",
      message: "",
      status: "pending",
    });
    setModalOpen(true);
  };

  const openEdit = (row: ServiceRequestRow) => {
    setEditing(row);
    setForm({
      user_id: row.user_id ?? "",
      name: row.name,
      email: row.email,
      phone: row.phone,
      racket_brand: row.racket_brand,
      racket_model: row.racket_model,
      string_type: row.string_type,
      string_colour: row.string_colour ?? "",
      tension: row.tension,
      stencil: row.stencil,
      grip: row.grip,
      grommet_replacement: row.grommet_replacement ?? "",
      message: row.message ?? "",
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!editing) {
      setModalOpen(false);
      return;
    }
    try {
      const res = await apiFetch(`/api/dashboard/service-requests/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: form.status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data.message || "Failed to update.");
        return;
      }
      const updated = await res.json();
      setItems((prev) =>
        prev.map((r) => (r.id === editing.id ? updated : r))
      );
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = (_row: ServiceRequestRow) => {
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
          Add Service Request
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
          emptyMessage="No service requests yet."
        />
      )}
      <FormModal
        title={editing ? "Edit Service Request" : "Add Service Request"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {formError && (
          <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
        )}
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
          label="Racket brand"
          name="racket_brand"
          value={form.racket_brand}
          onChange={(e) =>
            setForm((f) => ({ ...f, racket_brand: e.target.value }))
          }
          required
        />
        <TextInput
          label="Racket model"
          name="racket_model"
          value={form.racket_model}
          onChange={(e) =>
            setForm((f) => ({ ...f, racket_model: e.target.value }))
          }
          required
        />
        <TextInput
          label="String type"
          name="string_type"
          value={form.string_type}
          onChange={(e) =>
            setForm((f) => ({ ...f, string_type: e.target.value }))
          }
          required
        />
        <TextInput
          label="String colour"
          name="string_colour"
          value={form.string_colour}
          onChange={(e) =>
            setForm((f) => ({ ...f, string_colour: e.target.value }))
          }
        />
        <TextInput
          label="Tension"
          name="tension"
          value={form.tension}
          onChange={(e) => setForm((f) => ({ ...f, tension: e.target.value }))}
          required
        />
        <Checkbox
          label="Stencil"
          name="stencil"
          checked={form.stencil}
          onChange={(e) =>
            setForm((f) => ({ ...f, stencil: e.target.checked }))
          }
        />
        <Checkbox
          label="Grip"
          name="grip"
          checked={form.grip}
          onChange={(e) =>
            setForm((f) => ({ ...f, grip: e.target.checked }))
          }
        />
        <TextInput
          label="Grommet replacement"
          name="grommet_replacement"
          value={form.grommet_replacement}
          onChange={(e) =>
            setForm((f) => ({ ...f, grommet_replacement: e.target.value }))
          }
        />
        <TextArea
          label="Message"
          name="message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
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
        title="Delete Service Request"
        message={
          deleteTarget
            ? `Delete service request for "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ServiceRequestsSection;
