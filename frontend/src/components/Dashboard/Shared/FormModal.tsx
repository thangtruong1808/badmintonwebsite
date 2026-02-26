import React from "react";
import { FaTimes } from "react-icons/fa";

interface FormModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  /** Optional wider modal (e.g. "xl" for max-w-4xl). Default: "lg" (max-w-lg). */
  maxWidth?: "lg" | "xl" | "2xl" | "4xl" | "5xl";
  /** Optional custom class for title text (defaults to font-huglove styling) */
  titleClassName?: string;
}

const WIDTH_CLASS = {
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
} as const;

const FormModal: React.FC<FormModalProps> = ({
  title,
  open,
  onClose,
  children,
  onSubmit,
  maxWidth = "lg",
  titleClassName,
}) => {
  if (!open) return null;

  const content = (
    <div className="max-h-[85vh] overflow-y-auto p-6">
      {onSubmit ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      ) : (
        <div className="space-y-4">{children}</div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className={`relative w-full ${WIDTH_CLASS[maxWidth]} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className={titleClassName ?? "font-huglove text-xl text-gray-800"}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>
        {content}
      </div>
    </div>
  );
};

export default FormModal;
