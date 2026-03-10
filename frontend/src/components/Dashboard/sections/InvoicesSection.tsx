import React, { useState, useEffect, useMemo } from "react";
import { formatDateDDMonthYYYY } from "../../../utils/dateUtils";
import DataTable, { type Column } from "../Shared/DataTable";
import { apiFetch } from "../../../utils/api";

export interface InvoiceLineItemRow {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  event_id?: number;
  registration_id?: string;
  sort_order: number;
}

export interface InvoiceRow {
  id: string;
  user_id: string;
  payment_id?: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  due_date?: string;
  paid_at?: string;
  pdf_url?: string;
  line_items: InvoiceLineItemRow[];
  created_at?: string;
}

const COLUMNS: Column<InvoiceRow>[] = [
  { key: "id", label: "ID", render: (r) => r.id.slice(0, 10) + "…" },
  { key: "invoice_number", label: "Invoice #" },
  { key: "user_id", label: "User ID", render: (r) => r.user_id.slice(0, 12) + "…" },
  { key: "status", label: "Status" },
  { key: "total", label: "Total" },
  { key: "currency", label: "Currency" },
  { key: "due_date", label: "Due", render: (r) => formatDateDDMonthYYYY(r.due_date) },
  { key: "paid_at", label: "Paid at", render: (r) => formatDateDDMonthYYYY(r.paid_at) },
];

const InvoicesSection: React.FC = () => {
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<InvoiceRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/dashboard/invoices");
      if (res.ok) {
        const list = await res.json();
        setItems(Array.isArray(list) ? list : []);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || "Failed to load invoices");
        setItems([]);
      }
    } catch {
      setError("Could not load invoices");
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
        (r.invoice_number ?? "").toLowerCase().includes(q) ||
        (r.user_id ?? "").toLowerCase().includes(q) ||
        (r.status ?? "").toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const openDetail = async (row: InvoiceRow) => {
    setDetail(row);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await apiFetch(`/api/dashboard/invoices/${row.id}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      }
    } catch {
      // keep row as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full sm:max-w-xs">
        <label htmlFor="invoices-search" className="sr-only">
          Search by invoice number, user ID or status
        </label>
        <input
          id="invoices-search"
          type="search"
          placeholder="Search by invoice #, user ID or status"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-calibri text-gray-700 placeholder-gray-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
          aria-label="Search by invoice number, user ID or status"
        />
      </div>
      {error && (
        <p className="text-red-600 font-calibri">{error}</p>
      )}
      <DataTable
        columns={COLUMNS}
        data={filteredItems}
        loading={loading}
        getRowId={(r) => r.id}
        onEdit={openDetail}
        emptyMessage="No invoices yet."
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
      {detailOpen && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-calibri font-bold text-gray-900">
                Invoice: {detail.invoice_number}
              </h3>
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="text-gray-500 hover:text-gray-700 font-calibri"
              >
                Close
              </button>
            </div>
            {detailLoading ? (
              <p className="text-gray-600 font-calibri">Loading details…</p>
            ) : (
              <div className="space-y-4 font-calibri">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-gray-600">ID</span>
                  <span>{detail.id}</span>
                  <span className="text-gray-600">Invoice #</span>
                  <span>{detail.invoice_number}</span>
                  <span className="text-gray-600">User ID</span>
                  <span>{detail.user_id}</span>
                  <span className="text-gray-600">Payment ID</span>
                  <span>{detail.payment_id ?? "—"}</span>
                  <span className="text-gray-600">Status</span>
                  <span>{detail.status}</span>
                  <span className="text-gray-600">Subtotal</span>
                  <span>{detail.subtotal}</span>
                  <span className="text-gray-600">Total</span>
                  <span>{detail.total} {detail.currency}</span>
                  <span className="text-gray-600">Due date</span>
                  <span>{formatDateDDMonthYYYY(detail.due_date)}</span>
                  <span className="text-gray-600">Paid at</span>
                  <span>{formatDateDDMonthYYYY(detail.paid_at)}</span>
                  <span className="text-gray-600">PDF URL</span>
                  <span className="break-all">{detail.pdf_url ?? "—"}</span>
                </div>
                {detail.line_items && detail.line_items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Line items</h4>
                    <div className="border rounded overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2">Description</th>
                            <th className="text-right p-2">Qty</th>
                            <th className="text-right p-2">Unit price</th>
                            <th className="text-right p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.line_items.map((item, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{item.description}</td>
                              <td className="p-2 text-right">{item.quantity}</td>
                              <td className="p-2 text-right">{item.unit_price}</td>
                              <td className="p-2 text-right">{item.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesSection;
