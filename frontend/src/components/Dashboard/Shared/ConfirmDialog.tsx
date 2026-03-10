import React from "react";
import { FaSpinner } from "react-icons/fa";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "default";
  /** If true, only show the confirm button (useful for acknowledgment dialogs) */
  singleButton?: boolean;
  /** If true, show spinner and loading state on confirm button, disable both buttons */
  confirmLoading?: boolean;
  /** Text to show when confirmLoading (e.g. "Deleting…", "Cancelling…") */
  confirmLoadingLabel?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  singleButton = false,
  confirmLoading = false,
  confirmLoadingLabel = "Deleting…",
}) => {
  if (!open) return null;

  const confirmClass =
    variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-rose-500 text-white hover:bg-rose-600";

  const showCancelButton = !singleButton && cancelLabel && cancelLabel.trim() !== "";
  const disabled = confirmLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={disabled ? undefined : onCancel}
        aria-hidden
      />
      <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 className="font-calibri text-xl font-medium text-gray-800">{title}</h3>
        <hr className="mt-3 mb-3 border-gray-200" />
        <p className="font-calibri text-base text-gray-700">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          {showCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-calibri text-gray-700 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-calibri ${confirmClass} disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {confirmLoading ? (
              <>
                <FaSpinner className="animate-spin h-4 w-4 shrink-0" aria-hidden />
                <span>{confirmLoadingLabel}</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
