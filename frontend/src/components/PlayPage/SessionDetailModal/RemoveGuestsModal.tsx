import React from "react";
import { FaSpinner } from "react-icons/fa";

interface RemoveGuestsModalProps {
  open: boolean;
  list: { id: number; name: string }[];
  loading: boolean;
  selectedIds: Set<number>;
  submitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onToggle: (id: number) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const RemoveGuestsModal: React.FC<RemoveGuestsModalProps> = ({
  open,
  list,
  loading,
  selectedIds,
  submitting,
  message,
  onToggle,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 font-calibri mb-2">Remove friends</h3>
        <p className="text-sm text-gray-600 font-calibri mb-4">
          Select the friend(s) you want to remove from your registration. Freed spot(s) may be offered to the waitlist.
        </p>
        {message && (
          <p className={`mb-3 text-sm font-calibri ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 font-calibri py-2">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500 font-calibri py-2">No friends on this registration.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {list.map((g) => (
              <li key={g.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id={`remove-guest-${g.id}`}
                  checked={selectedIds.has(g.id)}
                  onChange={() => onToggle(g.id)}
                  className="rounded border-gray-300 text-rose-500 focus:ring-rose-500 h-4 w-4"
                  aria-label={`Remove ${g.name || "friend"}`}
                />
                <label htmlFor={`remove-guest-${g.id}`} className="flex-1 font-calibri text-gray-800 cursor-pointer">
                  {g.name || "(unnamed)"}
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium font-calibri"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting || selectedIds.size === 0}
            className="flex-1 py-2 px-3 rounded-lg border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-medium disabled:opacity-60 disabled:cursor-not-allowed font-calibri inline-flex items-center justify-center gap-2"
          >
            {submitting ? <><FaSpinner className="animate-spin h-4 w-4" /><span>Removing…</span></> : `Remove selected (${selectedIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemoveGuestsModal;
