import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaImage, FaTimes, FaCloudUploadAlt, FaTrash } from "react-icons/fa";
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
import { apiFetch, API_BASE } from "../../../utils/api";

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
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
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    original_price: "",
    images: [] as string[],
    category: "",
    in_stock: true,
    description: "",
    quantity_tiers: [] as { quantity: number; unit_price: number }[],
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/dashboard/products");
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
    setFormError(null);
    setImageUploadError(null);
    setForm({
      name: "",
      price: 0,
      original_price: "",
      images: [],
      category: "",
      in_stock: true,
      description: "",
      quantity_tiers: [],
    });
    setModalOpen(true);
  };

  const openEdit = async (row: ProductRow) => {
    setEditing(row);
    setFormError(null);
    setImageUploadError(null);
    setLoadingProduct(true);
    setModalOpen(true);
    try {
      const res = await apiFetch(`/api/dashboard/products/${row.id}`);
      if (res.ok) {
        const data = await res.json();
        const images = Array.isArray(data.images) ? data.images : (data.image ? [data.image] : []);
        const tiers = Array.isArray(data.quantity_tiers)
          ? data.quantity_tiers.map((t: { quantity: number; unit_price: number }) => ({ quantity: t.quantity, unit_price: t.unit_price }))
          : [];
        setForm({
          name: data.name,
          price: data.price,
          original_price: data.original_price != null ? String(data.original_price) : "",
          images,
          category: data.category,
          in_stock: data.in_stock,
          description: data.description ?? "",
          quantity_tiers: tiers,
        });
      } else {
        setForm({
          name: row.name,
          price: row.price,
          original_price: row.original_price != null ? String(row.original_price) : "",
          images: row.image ? [row.image] : [],
          category: row.category,
          in_stock: row.in_stock,
          description: row.description ?? "",
          quantity_tiers: [],
        });
      }
    } catch {
      setForm({
        name: row.name,
        price: row.price,
        original_price: row.original_price != null ? String(row.original_price) : "",
        images: row.image ? [row.image] : [],
        category: row.category,
        in_stock: row.in_stock,
        description: row.description ?? "",
        quantity_tiers: [],
      });
    } finally {
      setLoadingProduct(false);
    }
  };

  const uploadProductImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setImageUploadError("Please select an image file (JPEG, PNG, etc.).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError("Image size must be less than 5MB.");
      return;
    }
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/api/upload/product-image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      const data = await res.json();
      setForm((f) => ({ ...f, images: [...f.images, data.url] }));
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        uploadProductImage(files[i]);
      }
    }
  };

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= form.images.length) return;
    const arr = [...form.images];
    const [removed] = arr.splice(from, 1);
    arr.splice(to, 0, removed);
    setForm((f) => ({ ...f, images: arr }));
  };

  const addQuantityTier = () => {
    setForm((f) => ({ ...f, quantity_tiers: [...f.quantity_tiers, { quantity: 1, unit_price: f.price }] }));
  };
  const removeQuantityTier = (index: number) => {
    setForm((f) => ({ ...f, quantity_tiers: f.quantity_tiers.filter((_, i) => i !== index) }));
  };
  const updateQuantityTier = (index: number, field: "quantity" | "unit_price", value: number) => {
    setForm((f) => ({
      ...f,
      quantity_tiers: f.quantity_tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (form.images.length === 0) {
      setFormError("At least one product photo is required.");
      return;
    }
    const origPrice = form.original_price ? parseFloat(form.original_price) : undefined;
    try {
      if (editing) {
        const res = await apiFetch(`/api/dashboard/products/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: form.name,
            price: form.price,
            original_price: origPrice,
            images: form.images,
            category: form.category,
            in_stock: form.in_stock,
            description: form.description || undefined,
            quantity_tiers: [...form.quantity_tiers].sort((a, b) => a.quantity - b.quantity),
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to update product.");
          return;
        }
        const updated = await res.json();
        setItems((prev) =>
          prev.map((r) => (r.id === editing.id ? { ...r, ...updated } : r))
        );
      } else {
        const res = await apiFetch("/api/dashboard/products", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            price: form.price,
            original_price: origPrice,
            images: form.images,
            category: form.category,
            in_stock: form.in_stock,
            description: form.description || undefined,
            quantity_tiers: form.quantity_tiers.length > 0
              ? [...form.quantity_tiers].sort((a, b) => a.quantity - b.quantity)
              : undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setFormError(data.message || "Failed to add product.");
          return;
        }
        const created = await res.json();
        setItems((prev) => [{ ...created, image: created.image || created.images?.[0] }, ...prev]);
      }
      setModalOpen(false);
    } catch {
      setFormError("Something went wrong. Please try again later.");
    }
  };

  const handleDelete = async (row: ProductRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/products/${row.id}`, {
        method: "DELETE",
      });
      if (res.ok) setItems((prev) => prev.filter((r) => r.id !== row.id));
    } catch {
      // keep dialog open
    }
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
      {loading ? (
        <p className="font-calibri text-gray-600">Loading...</p>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={items}
          getRowId={(r) => r.id}
          onEdit={openEdit}
          onDelete={(r) => setDeleteTarget(r)}
          emptyMessage="No products yet. Click Add Product to create one."
        />
      )}
      <FormModal
        title={editing ? "Edit Product" : "Add Product"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        maxWidth="2xl"
      >
        {loadingProduct ? (
          <p className="font-calibri text-gray-600 py-4">Loading product…</p>
        ) : (
          <>
            {formError && (
              <p className="text-sm text-red-600 font-calibri mb-2">{formError}</p>
            )}
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
            <div className="space-y-2">
              <label className="block font-calibri text-sm font-medium text-gray-700">
                Product Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 font-calibri">
                Add one or more photos. First image is the primary display image. Drag to reorder.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Upload product photos"
              />
              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                  {form.images.map((url, index) => (
                    <div
                      key={`${url}-${index}`}
                      className="relative group rounded-lg border border-gray-300 overflow-hidden bg-gray-50 aspect-square"
                    >
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-rose-500 text-white text-xs font-calibri px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="p-1.5 rounded bg-white/90 hover:bg-white text-gray-800"
                            aria-label="Move left"
                          >
                            ←
                          </button>
                        )}
                        {index < form.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="p-1.5 rounded bg-white/90 hover:bg-white text-gray-800"
                            aria-label="Move right"
                          >
                            →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1.5 rounded bg-red-500 text-white hover:bg-red-600"
                          aria-label="Remove photo"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (imageUploading) return;
                  const files = e.dataTransfer.files;
                  if (files) {
                    for (let i = 0; i < files.length; i++) {
                      if (files[i].type.startsWith("image/")) {
                        uploadProductImage(files[i]);
                      }
                    }
                  }
                }}
                className="w-full min-h-[100px] sm:min-h-[120px] rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 hover:bg-rose-50/50 transition-colors flex flex-col items-center justify-center gap-2 p-4 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {imageUploading ? (
                  <>
                    <span className="animate-pulse text-rose-500">
                      <FaCloudUploadAlt size={24} />
                    </span>
                    <span className="text-sm font-calibri text-gray-600">Uploading…</span>
                  </>
                ) : (
                  <>
                    <FaImage className="text-gray-400" size={24} />
                    <span className="text-sm font-calibri text-gray-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs font-calibri text-gray-500">
                      PNG, JPG up to 5MB. Multiple photos allowed.
                    </span>
                  </>
                )}
              </button>
              {imageUploadError && (
                <p className="text-sm text-red-600 font-calibri">{imageUploadError}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <label className="block font-calibri text-sm font-medium text-gray-700">
                Quantity Tiers (optional)
              </label>
              <p className="text-xs text-gray-500 font-calibri">
                Add quantity-based pricing (e.g. Buy 1 = $42/tube, Buy 3 = $41/tube). Leave empty for single price.
              </p>
              {form.quantity_tiers.length > 0 && (
                <div className="space-y-2 mt-2">
                  {form.quantity_tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <span className="text-sm font-calibri text-gray-600">Buy</span>
                      <input
                        type="number"
                        min={1}
                        value={tier.quantity}
                        onChange={(e) => updateQuantityTier(idx, "quantity", Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-rose-500"
                      />
                      <span className="text-sm font-calibri text-gray-600">tubes =</span>
                      <span className="text-sm font-calibri text-gray-600">$</span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={tier.unit_price}
                        onChange={(e) => updateQuantityTier(idx, "unit_price", Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-rose-500"
                      />
                      <span className="text-sm font-calibri text-gray-600">/tube</span>
                      <button
                        type="button"
                        onClick={() => removeQuantityTier(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        aria-label="Remove tier"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={addQuantityTier}
                className="inline-flex items-center gap-2 mt-2 text-sm font-calibri text-rose-600 hover:text-rose-700"
              >
                <FaPlus size={14} />
                Add quantity tier
              </button>
            </div>
            <FormActions onCancel={() => setModalOpen(false)} />
          </>
        )}
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
