import React, { useState } from "react";
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRequestRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceRequestRow | null>(null);
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
              email: form.email,
              phone: form.phone,
              racket_brand: form.racket_brand,
              racket_model: form.racket_model,
              string_type: form.string_type,
              string_colour: form.string_colour || undefined,
              tension: form.tension,
              stencil: form.stencil,
              grip: form.grip,
              grommet_replacement: form.grommet_replacement || undefined,
              message: form.message || undefined,
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
          email: form.email,
          phone: form.phone,
          racket_brand: form.racket_brand,
          racket_model: form.racket_model,
          string_type: form.string_type,
          string_colour: form.string_colour || undefined,
          tension: form.tension,
          stencil: form.stencil,
          grip: form.grip,
          grommet_replacement: form.grommet_replacement || undefined,
          message: form.message || undefined,
          status: form.status,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: ServiceRequestRow) => {
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
          Add Service Request
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No service requests yet. Click Add Service Request to create one."
      />
      <FormModal
        title={editing ? "Edit Service Request" : "Add Service Request"}
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
