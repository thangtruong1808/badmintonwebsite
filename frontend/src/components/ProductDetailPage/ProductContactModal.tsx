import type { FormEvent } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import type { Product } from "../ShopPage";
import type { FormData, FormErrors } from "./types";

interface ProductContactModalProps {
  open: boolean;
  product: Product;
  priceDisplay: string;
  formData: FormData;
  errors: FormErrors;
  submitStatus: { type: "success" | "error" | null; message: string };
  isSubmitting: boolean;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
    hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
  }`;

const ProductContactModal = ({
  open,
  product,
  priceDisplay,
  formData,
  errors,
  submitStatus,
  isSubmitting,
  onClose,
  onChange,
  onSubmit,
}: ProductContactModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-t from-pink-100 to-pink-200 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black font-calibri text-2xl">Contact Us</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="p-6 font-calibri text-lg">
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1 font-calibri text-lg">Product Inquiry:</p>
            <p className="font-semibold text-black font-calibri text-lg">{product.name}</p>
            <p className="text-green-600 font-bold font-calibri text-lg">{priceDisplay}</p>
          </div>

          {submitStatus.type && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                submitStatus.type === "success"
                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {submitStatus.type === "success" ? (
                <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
              )}
              <p className="text-md font-calibri text-lg">{submitStatus.message}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-md font-semibold text-gray-700 mb-2 font-calibri text-lg">
                <FaUser className="inline mr-2" size={14} />
                Full Name <span className="text-red-500 font-calibri text-lg">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={onChange}
                className={inputClass(!!errors.name)}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="mt-1 text-red-500 font-calibri text-lg">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-md font-semibold text-gray-700 mb-2 font-calibri text-lg">
                  <FaEnvelope className="inline mr-2" size={14} />
                  Email Address <span className="text-red-500 font-calibri text-lg">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className={inputClass(!!errors.email)}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="mt-1 text-red-500 font-calibri text-lg">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-md font-semibold text-gray-700 mb-2 font-calibri text-lg">
                  <FaPhone className="inline mr-2" size={14} />
                  Phone Number <span className="text-gray-400 font-calibri text-lg">(Optional)</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  className={inputClass(!!errors.phone)}
                  placeholder="+61 400 000 000"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="subject" className="block text-md font-semibold text-gray-700 mb-2 font-calibri text-lg">
                Subject <span className="text-red-500 font-calibri text-lg">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={onChange}
                className={inputClass(!!errors.subject)}
                placeholder="Enter the subject of your inquiry"
              />
              {errors.subject && <p className="mt-1 text-red-500 font-calibri text-lg">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-md font-semibold text-gray-700 mb-2 font-calibri text-lg">
                Message <span className="text-red-500 font-calibri text-lg">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={onChange}
                rows={6}
                className={inputClass(!!errors.message) + " resize-none"}
                placeholder="Enter your message"
              />
              {errors.message && <p className="mt-1 text-red-500 font-calibri text-lg">{errors.message}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors font-calibri text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-lg ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="font-calibri text-lg">Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={18} />
                    <span className="font-calibri text-lg">Send Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductContactModal;
