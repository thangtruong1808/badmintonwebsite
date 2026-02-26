import React from "react";
import { FaSpinner } from "react-icons/fa";

interface EditGuestsModalProps {
  open: boolean;
  list: { id?: number; name: string }[];
  loading: boolean;
  submitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onListChange: (updater: (prev: { id?: number; name: string }[]) => { id?: number; name: string }[]) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditGuestsModal: React.FC<EditGuestsModalProps> = ({
  open,
  list,
  loading,
  submitting,
  message,
  onListChange,
  onSave,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[85vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-900 font-calibri mb-2">Edit friend names</h3>
        <p className="text-sm text-gray-600 font-calibri mb-4">
          Update names only. Use &quot;Add friends&quot; or &quot;Remove friends&quot; outside this dialog to change how many friends are on your registration.
        </p>
        {message && (
          <p className={`mb-3 text-sm font-calibri ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-gray-500 font-calibri py-2">Loading…</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500 font-calibri py-2">No friends on this registration. Use &quot;Add friends&quot; to add some first.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {list.map((g, i) => (
              <li key={g.id ?? i} className="flex items-center gap-2">
                <label className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-sm font-calibri text-gray-600 shrink-0">Friend {i + 1}</span>
                  <input
                    type="text"
                    value={g.name ?? ""}
                    onChange={(e) =>
                      onListChange((prev) =>
                        prev.map((guest, idx) => (idx === i ? { ...guest, name: e.target.value } : guest))
                      )
                    }
                    placeholder="Name"
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-calibri text-sm"
                    aria-label={`Friend ${i + 1} name`}
                  />
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
            Close
          </button>
          <button
            onClick={onSave}
            disabled={submitting || list.length === 0}
            className="flex-1 py-2 px-3 rounded-lg border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-medium disabled:opacity-60 font-calibri inline-flex items-center justify-center gap-2"
          >
            {submitting ? <><FaSpinner className="animate-spin h-4 w-4" /><span>Saving…</span></> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGuestsModal;
