import type { FormEvent } from "react";
import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import type { Product, FormData, FormErrors } from "./types";
import ShopContactForm from "./ShopContactForm";

interface ShopContactModalProps {
  open: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: FormErrors;
  submitStatus: { type: "success" | "error" | null; message: string };
  isSubmitting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const ShopContactModal = ({
  open,
  onClose,
  selectedProduct,
  formData,
  onFormChange,
  errors,
  submitStatus,
  isSubmitting,
  onSubmit,
}: ShopContactModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
      aria-hidden="false"
    >
      <div
        className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        aria-describedby={selectedProduct ? "contact-modal-product" : undefined}
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-6 py-4 flex items-center justify-between font-calibri z-10">
          <h2 id="contact-modal-title" className="text-2xl font-bold text-black font-huglove">
            Contact Us
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            aria-label="Close contact form"
          >
            <FaTimes size={24} className="font-calibri" />
          </button>
        </div>

        <div className="p-6">
          {selectedProduct && (
            <div
              id="contact-modal-product"
              className="mb-6 p-4 bg-white/80 rounded-lg border border-rose-100 font-calibri"
            >
              <p className="text-sm text-gray-600 mb-1 font-calibri">Product Inquiry</p>
              <p className="font-semibold text-black font-calibri">{selectedProduct.name}</p>
              <p className="text-rose-600 font-bold font-calibri">
                ${selectedProduct.price.toFixed(2)}
              </p>
            </div>
          )}

          {submitStatus.type && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200 font-calibri text-md"
                  : "bg-red-50 text-red-800 border border-red-200 font-calibri text-md"
              }`}
            >
              {submitStatus.type === "success" ? (
                <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
              )}
              <p className="text-sm font-calibri text-md">{submitStatus.message}</p>
            </div>
          )}

          <ShopContactForm
            formData={formData}
            onFormChange={onFormChange}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default ShopContactModal;
