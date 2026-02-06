import type { FormEvent } from "react";
import { FaEnvelope, FaUser, FaPhone, FaPaperPlane, FaTimes } from "react-icons/fa";
import type { FormData, FormErrors } from "./types";

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-calibri text-md ${
    hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-rose-500"
  }`;

interface ShopContactFormProps {
  formData: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: FormErrors;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const ShopContactForm = ({
  formData,
  onFormChange,
  errors,
  isSubmitting,
  onSubmit,
  onCancel,
}: ShopContactFormProps) => (
  <form onSubmit={onSubmit} className="space-y-6">
    <div>
      <label htmlFor="name" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
        <FaUser className="inline mr-2" size={14} />
        Full Name <span className="text-red-500 font-calibri text-md">*</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={onFormChange}
        className={inputClass(!!errors.name)}
        placeholder="John Doe"
      />
      {errors.name && (
        <p className="mt-1 text-sm text-red-500 font-calibri text-md">{errors.name}</p>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="email" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
          <FaEnvelope className="inline mr-2" size={14} />
          Email Address <span className="text-red-500 font-calibri text-md">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onFormChange}
          className={inputClass(!!errors.email)}
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.email}</p>
        )}
      </div>
      <div>
        <label htmlFor="phone" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
          <FaPhone className="inline mr-2" size={14} />
          Phone Number <span className="text-gray-500 font-calibri text-md">(Optional)</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={onFormChange}
          className={inputClass(!!errors.phone)}
          placeholder="+61 400 000 000"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.phone}</p>
        )}
      </div>
    </div>

    <div>
      <label htmlFor="subject" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
        Subject <span className="text-red-500 font-calibri text-md">*</span>
      </label>
      <input
        type="text"
        id="subject"
        name="subject"
        value={formData.subject}
        onChange={onFormChange}
        className={inputClass(!!errors.subject)}
        placeholder="What is this regarding?"
      />
      {errors.subject && (
        <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.subject}</p>
      )}
    </div>

    <div>
      <label htmlFor="message" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
        Message <span className="text-red-500 font-calibri text-md">*</span>
      </label>
      <textarea
        id="message"
        name="message"
        value={formData.message}
        onChange={onFormChange}
        rows={6}
        className={inputClass(!!errors.message) + " resize-none"}
        placeholder="Tell us more about your inquiry..."
      />
      {errors.message && (
        <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.message}</p>
      )}
    </div>

    <div className="flex gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors font-calibri text-md text-justify"
      >
        <div className="flex items-center justify-center gap-2">
          <FaTimes size={16} />
          <span className="font-calibri text-md">Cancel</span>
        </div>
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg transform hover:-translate-y-0.5"
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="font-calibri text-md">Sending...</span>
          </>
        ) : (
          <>
            <FaPaperPlane size={18} />
            <span className="font-calibri text-md">Send Message</span>
          </>
        )}
      </button>
    </div>
  </form>
);

export default ShopContactForm;
