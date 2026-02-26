import React from "react";
import { FaSpinner } from "react-icons/fa";
import type { SocialEvent } from "../../../types/socialEvent";

interface WaitlistFormModalProps {
  open: boolean;
  event: SocialEvent | null;
  form: { name: string; email: string; phone: string };
  user: { firstName?: string; lastName?: string; email?: string; phone?: string } | null;
  submitting: boolean;
  message: { type: "success" | "error"; text: string } | null;
  onFormChange: (updater: (prev: { name: string; email: string; phone: string }) => { name: string; email: string; phone: string }) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const WaitlistFormModal: React.FC<WaitlistFormModalProps> = ({
  open,
  event,
  form,
  user,
  submitting,
  message,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  if (!open || !event) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 font-calibri mb-4">Join waitlist</h3>
        <p className="text-gray-700 text-sm sm:text-base mb-4 font-calibri">
          This session is full. We&apos;ll email you when a spot opens for &quot;{event.title}&quot;. Please regularly check your email for updates.
        </p>
        {user ? (
          <div className="space-y-2 rounded-lg bg-gray-50 border border-gray-200 p-4 font-calibri">
            <p className="text-gray-700 text-sm">
              <span className="font-medium text-gray-600">Name:</span>{" "}
              {form.name || "—"}
            </p>
            <p className="text-gray-700 text-sm">
              <span className="font-medium text-gray-600">Email:</span>{" "}
              {form.email || "—"}
            </p>
            {form.phone ? (
              <p className="text-gray-700 text-sm">
                <span className="font-medium text-gray-600">Phone:</span>{" "}
                {form.phone}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3 font-calibri">
            <input
              type="text"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => onFormChange((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-sm sm:text-base"
            />
            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => onFormChange((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-sm sm:text-base"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => onFormChange((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-sm sm:text-base"
            />
          </div>
        )}
        {message && (
          <p
            className={`mt-3 text-sm font-calibri ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium font-calibri text-md"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-2 px-3 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium disabled:opacity-60 disabled:cursor-not-allowed font-calibri text-md hover:text-amber-700 inline-flex items-center justify-center gap-2"
          >
            {submitting ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Submitting…</span></> : "Join waitlist"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitlistFormModal;
