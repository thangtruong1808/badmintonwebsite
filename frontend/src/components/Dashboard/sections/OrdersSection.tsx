import React, { useState, useEffect } from "react";
import { FaSpinner, FaExternalLinkAlt, FaSearch, FaFilter, FaEye, FaTimes } from "react-icons/fa";
import DataTable, { type Column } from "../Shared/DataTable";
import FormModal from "../Shared/FormModal";
import {
  Select,
  FormActions,
} from "../Shared/inputs";
import { apiFetch } from "../../../utils/api";

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
}

export interface OrderRow {
  id: string;
  user_id: string;
  payment_id: string | null;
  status: string;
  total: number;
  shipping_name: string | null;
  shipping_email: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  stripe_payment_intent_id: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...STATUS_OPTIONS,
];

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const COLUMNS: Column<OrderRow>[] = [
  { key: "id", label: "Order ID", render: (r) => (
    <span title={r.id} className="font-mono text-xs">
      {r.id.slice(0, 8)}…
    </span>
  )},
  { key: "user_id", label: "User ID", render: (r) => (
    <span title={r.user_id} className="font-mono text-xs">
      {r.user_id.slice(0, 8)}…
    </span>
  )},
  { key: "total", label: "Total", render: (r) => (
    <span className="font-medium">${Number(r.total).toFixed(2)}</span>
  )},
  { key: "status", label: "Status", render: (r) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(r.status)}`}>
      {r.status}
    </span>
  )},
  { key: "shipping_name", label: "Customer", render: (r) => (
    r.shipping_name || r.shipping_email || <span className="text-gray-400">—</span>
  )},
  { key: "stripe_payment_intent_id", label: "Stripe ID", render: (r) => (
    r.stripe_payment_intent_id ? (
      <a
        href={`https://dashboard.stripe.com/payments/${r.stripe_payment_intent_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-mono"
        title={r.stripe_payment_intent_id}
      >
        {r.stripe_payment_intent_id.slice(0, 12)}…
        <FaExternalLinkAlt size={10} />
      </a>
    ) : <span className="text-gray-400">—</span>
  )},
  { key: "created_at", label: "Date", render: (r) => (
    r.created_at ? (
      <span className="text-xs text-gray-600">
        {new Date(r.created_at).toLocaleDateString()}
      </span>
    ) : "—"
  )},
];

const OrdersSection: React.FC = () => {
  const [items, setItems] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [viewingOrder, setViewingOrder] = useState<OrderRow | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ status: "pending" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/dashboard/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openEdit = (row: OrderRow) => {
    setEditing(row);
    setForm({ status: row.status });
    setModalOpen(true);
  };

  const openDetail = async (row: OrderRow) => {
    try {
      const res = await apiFetch(`/api/dashboard/orders/${row.id}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      const data = await res.json();
      setViewingOrder(data);
      setDetailModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load order details");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/dashboard/orders/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: form.status }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      await fetchOrders();
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (item.shipping_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-rose-500 mr-2" size={20} />
        <span className="text-gray-600 font-calibri">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading orders</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by ID, user, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm"
            />
          </div>
          <div className="relative sm:w-40">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm appearance-none bg-white"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-calibri">
          {filteredItems.length} of {items.length} order{items.length !== 1 ? "s" : ""}
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        getRowId={(r) => r.id}
        onEdit={openEdit}
        onView={openDetail}
        emptyMessage="No orders found."
        pageSize={10}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Update Status Modal */}
      <FormModal
        title="Update Order Status"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      >
        {editing && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
              <p><span className="font-medium">Order ID:</span> <span className="font-mono">{editing.id}</span></p>
              <p><span className="font-medium">Total:</span> ${Number(editing.total).toFixed(2)}</p>
              {editing.shipping_name && <p><span className="font-medium">Customer:</span> {editing.shipping_name}</p>}
              {editing.stripe_payment_intent_id && (
                <p>
                  <span className="font-medium">Stripe:</span>{" "}
                  <a
                    href={`https://dashboard.stripe.com/payments/${editing.stripe_payment_intent_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
                  >
                    View in Stripe <FaExternalLinkAlt size={10} />
                  </a>
                </p>
              )}
            </div>
            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
            <FormActions
              onCancel={() => setModalOpen(false)}
              submitLabel={submitting ? "Updating..." : "Update Status"}
              submitDisabled={submitting}
            />
          </div>
        )}
      </FormModal>

      {/* Order Detail Modal */}
      {detailModalOpen && viewingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-xl text-gray-900 font-calibri">Order Details</h2>
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Order ID</p>
                    <p className="font-mono">{viewingOrder.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(viewingOrder.status)}`}>
                      {viewingOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium text-lg">${Number(viewingOrder.total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p>{viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleString() : "—"}</p>
                  </div>
                </div>

                {(viewingOrder.shipping_name || viewingOrder.shipping_email || viewingOrder.shipping_phone) && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="text-sm space-y-1">
                      {viewingOrder.shipping_name && <p>{viewingOrder.shipping_name}</p>}
                      {viewingOrder.shipping_email && <p>{viewingOrder.shipping_email}</p>}
                      {viewingOrder.shipping_phone && <p>{viewingOrder.shipping_phone}</p>}
                      {viewingOrder.shipping_address && <p className="text-gray-600">{viewingOrder.shipping_address}</p>}
                    </div>
                  </div>
                )}

                {viewingOrder.items && viewingOrder.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Order Items</h3>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2">Product</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingOrder.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-2">{item.product_name || item.product_id}</td>
                            <td className="text-right p-2">{item.quantity}</td>
                            <td className="text-right p-2">${Number(item.unit_price).toFixed(2)}</td>
                            <td className="text-right p-2 font-medium">
                              ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewingOrder.stripe_payment_intent_id && (
                  <div className="border-t pt-4">
                    <a
                      href={`https://dashboard.stripe.com/payments/${viewingOrder.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700"
                    >
                      <FaEye size={14} />
                      View in Stripe Dashboard
                      <FaExternalLinkAlt size={10} />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-calibri"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
