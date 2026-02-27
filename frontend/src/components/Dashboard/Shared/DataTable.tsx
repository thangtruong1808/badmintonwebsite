import React, { useState, useMemo, useEffect } from "react";
import { FaEdit, FaTrash, FaChevronUp, FaChevronDown, FaChevronLeft, FaChevronRight, FaEye } from "react-icons/fa";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
  /** When true, column headers are clickable to sort */
  sortable?: boolean;
  /** When set, enables pagination with this many rows per page */
  pageSize?: number;
  /** When set, shows a dropdown to change records per page (e.g. [5, 10, 25, 50]) */
  pageSizeOptions?: number[];
}

function DataTable<T>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  onView,
  getRowId,
  emptyMessage = "No data yet.",
  sortable = false,
  pageSize,
  pageSizeOptions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>(columns[0]?.key ?? "");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const defaultPerPage = pageSize ?? pageSizeOptions?.[0] ?? 10;
  const [perPage, setPerPage] = useState(defaultPerPage);
  const effectivePageSize = pageSizeOptions?.length ? perPage : (pageSize ?? 10);

  const handleSort = (key: string) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortable || !sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      const aVal = av === null || av === undefined ? "" : av;
      const bVal = bv === null || bv === undefined ? "" : bv;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortable, sortKey, sortDir]);

  const totalItems = sortedData.length;
  const totalPages = effectivePageSize ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (effectivePageSize && currentPage > totalPages) setCurrentPage(1);
  }, [effectivePageSize, currentPage, totalPages]);

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setPerPage(val);
    setCurrentPage(1);
  };

  const startIdx = effectivePageSize ? (safePage - 1) * effectivePageSize : 0;
  const endIdx = effectivePageSize ? Math.min(startIdx + effectivePageSize, totalItems) : totalItems;
  const paginatedData = effectivePageSize ? sortedData.slice(startIdx, endIdx) : sortedData;

  const displayData = paginatedData;
  const hasPagination = (pageSize || pageSizeOptions?.length) && data.length > 0;

  const PaginationButtons = () => (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => setCurrentPage(1)}
        disabled={safePage <= 1}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-calibri text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="First page"
      >
        First
      </button>
      <button
        type="button"
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={safePage <= 1}
        className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <FaChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={safePage >= totalPages}
        className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <FaChevronRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => setCurrentPage(totalPages)}
        disabled={safePage >= totalPages}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-calibri text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Last page"
      >
        Last
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {hasPagination && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 px-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {pageSizeOptions && pageSizeOptions.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-calibri text-gray-600">
                <span className="whitespace-nowrap">Show</span>
                <select
                  value={perPage}
                  onChange={handlePerPageChange}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-calibri text-gray-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                  aria-label="Records per page"
                >
                  {pageSizeOptions.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="whitespace-nowrap">per page</span>
              </label>
            )}
            <p className="text-sm font-calibri text-gray-600">
              Showing {startIdx + 1}–{endIdx} of {totalItems}
            </p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow">
        {loading ? (
          <div className="flex items-center justify-center py-12 font-calibri text-gray-500">
            Loading…
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center font-calibri text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 font-calibri text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => sortable && handleSort(col.key)}
                    className={`px-4 py-3 text-left font-semibold text-gray-700 ${
                      sortable ? "cursor-pointer select-none hover:bg-gray-100 transition-colors" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortable && sortKey === col.key &&
                        (sortDir === "asc" ? (
                          <FaChevronUp size={12} className="text-rose-500" />
                        ) : (
                          <FaChevronDown size={12} className="text-rose-500" />
                        ))}
                    </span>
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {displayData.map((row) => (
                <tr key={String(getRowId(row))} className="hover:bg-rose-50/30">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="rounded p-2 text-blue-600 hover:bg-blue-100"
                            aria-label="View"
                          >
                            <FaEye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="rounded p-2 text-rose-600 hover:bg-rose-100"
                            aria-label="Edit"
                          >
                            <FaEdit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="rounded p-2 text-red-600 hover:bg-red-100"
                            aria-label="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {hasPagination && (
        <div className="flex justify-center pt-2">
          <PaginationButtons />
        </div>
      )}
    </div>
  );
}

export default DataTable;
