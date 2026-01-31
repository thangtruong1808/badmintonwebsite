import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import ConfirmDialog from "../Shared/ConfirmDialog";
import {
  TextInput,
  NumberInput,
  TextArea,
  Checkbox,
  FormActions,
} from "../Shared/inputs";

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  category: string;
  in_stock: boolean;
  description?: string;
  created_at?: string;
}

const COLUMNS: Column<ProductRow>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "price", label: "Price" },
  { key: "original_price", label: "Original", render: (r) => r.original_price ?? "—" },
  { key: "in_stock", label: "In stock", render: (r) => (r.in_stock ? "Yes" : "No") },
  { key: "created_at", label: "Created", render: (r) => (r.created_at ? r.created_at.slice(0, 10) : "—") },
];

const ProductsSection: React.FC = () => {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    original_price: "",
    image: "",
    category: "",
    in_stock: true,
    description: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      price: 0,
      original_price: "",
      image: "",
      category: "",
      in_stock: true,
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (row: ProductRow) => {
    setEditing(row);
    setForm({
      name: row.name,
      price: row.price,
      original_price: row.original_price != null ? String(row.original_price) : "",
      image: row.image,
      category: row.category,
      in_stock: row.in_stock,
      description: row.description ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origPrice = form.original_price ? parseFloat(form.original_price) : undefined;
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
              ...r,
              name: form.name,
              price: form.price,
              original_price: origPrice,
              image: form.image,
              category: form.category,
              in_stock: form.in_stock,
              description: form.description || undefined,
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
          name: form.name,
          price: form.price,
          original_price: origPrice,
          image: form.image,
          category: form.category,
          in_stock: form.in_stock,
          description: form.description || undefined,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (row: ProductRow) => {
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
          Add Product
        </button>
      </div>
      <DataTable
        columns={COLUMNS}
        data={items}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onDelete={(r) => setDeleteTarget(r)}
        emptyMessage="No products yet. Click Add Product to create one."
      />
      <FormModal
        title={editing ? "Edit Product" : "Add Product"}
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
        <NumberInput
          label="Price"
          name="price"
          value={form.price}
          onChange={(e) =>
            setForm((f) => ({ ...f, price: Number(e.target.value) || 0 }))
          }
          required
        />
        <TextInput
          label="Original price (optional)"
          name="original_price"
          type="number"
          value={form.original_price}
          onChange={(e) =>
            setForm((f) => ({ ...f, original_price: e.target.value }))
          }
        />
        <TextInput
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          required
        />
        <TextInput
          label="Category"
          name="category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          required
        />
        <Checkbox
          label="In stock"
          name="in_stock"
          checked={form.in_stock}
          onChange={(e) =>
            setForm((f) => ({ ...f, in_stock: e.target.checked }))
          }
        />
        <TextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <FormActions onCancel={() => setModalOpen(false)} />
      </FormModal>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={
          deleteTarget
            ? `Delete product "${deleteTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ProductsSection;
