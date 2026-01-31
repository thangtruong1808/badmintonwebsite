import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

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
  getRowId: (row: T) => string | number;
  emptyMessage?: string;
}

function DataTable<T>({
  columns,
  data,
  loading = false,
  onEdit,
  onDelete,
  getRowId,
  emptyMessage = "No data yet.",
}: DataTableProps<T>) {
  return (
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
                  className="px-4 py-3 text-left font-semibold text-gray-700"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right font-semibold text-gray-700">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row) => (
              <tr key={String(getRowId(row))} className="hover:bg-rose-50/30">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
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
  );
}

export default DataTable;
