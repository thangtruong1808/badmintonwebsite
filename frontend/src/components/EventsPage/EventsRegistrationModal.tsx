import { useState, useEffect, type FormEvent } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import type { EventDisplay } from "../../types/event";

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export interface EventsRegistrationModalProps {
  event: EventDisplay;
  onClose: () => void;
  /** When true, show only event details and a Close button (e.g. for past/completed events). */
  detailOnly?: boolean;
}

const EventsRegistrationModal: React.FC<EventsRegistrationModalProps> = ({ event, onClose, detailOnly = false }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") emailjs.init(publicKey);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const toEmail = import.meta.env.VITE_EMAIL_TO || "support@chibibadminton.com.au";

    if (!serviceId || !templateId || !publicKey || publicKey === "YOUR_PUBLIC_KEY") {
      const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}\nMessage: ${formData.message}`
      )}`;
      window.location.href = mailtoLink;
      setSubmitStatus({ type: "success", message: "Email client opened. Please send the email." });
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(serviceId, templateId, {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || "Not provided",
        subject: formData.subject,
        message: formData.message,
        to_email: toEmail,
      }, publicKey);
      setSubmitStatus({
        type: "success",
        message: "Your registration has been submitted successfully! We'll contact you soon.",
      });
      setFormData((prev) => ({ ...prev, name: "", email: "", phone: "" }));
      setErrors({});
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Failed to submit registration. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-md ${errors[field] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
    }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
      <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 border-b border-gray-300 px-6 py-4 flex items-center justify-between z-10">
          <h2 id="event-modal-title" className="text-xl md:text-2xl font-bold text-black font-calibri">
            {detailOnly ? event.title : `Register for ${event.title}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 focus:outline-none focus:ring-2 focus:ring-rose-500 rounded" aria-label="Close modal">
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-6 md:p-8">
          {event.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img src={event.imageUrl} alt="" className="w-full h-48 object-cover" />
            </div>
          )}
          <div className="border border-gray-300 rounded-lg p-4 mb-6 font-calibri">
            <h3 className="font-bold text-gray-800 mb-2">Event Details</h3>
            <div className="space-y-1 text-md font-medium text-gray-700">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-rose-500 flex-shrink-0" size={14} />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-rose-500 flex-shrink-0" size={14} />
                <span>{event.time}</span>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-2 text-rose-500 flex-shrink-0 mt-0.5" size={14} />
                <span>{event.location}</span>
              </div>
              {(event.currentAttendees ?? event.attendees) != null && (
                <div className="flex items-center">
                  <FaUsers className="mr-2 text-rose-500 flex-shrink-0" size={14} />
                  <span>{(event.currentAttendees ?? event.attendees ?? 0)} attendees</span>
                </div>
              )}
            </div>
          </div>
          {event.description && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-2 font-calibri">Description</h3>
              <p className="text-gray-700 text-md leading-relaxed whitespace-pre-line font-calibri">{event.description}</p>
            </div>
          )}
          {detailOnly ? (
            <div className="pt-4">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 font-calibri focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
                  <FaUser className="inline mr-2" size={14} />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass("name")} placeholder="Enter your full name" />
                {errors.name && <p className="mt-1 text-sm text-red-500 flex items-center font-calibri"><FaExclamationCircle className="mr-1" size={12} />{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
                  <FaEnvelope className="inline mr-2" size={14} />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass("email")} placeholder="Enter your email address" />
                {errors.email && <p className="mt-1 text-sm text-red-500 flex items-center font-calibri"><FaExclamationCircle className="mr-1" size={12} />{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
                  <FaPhone className="inline mr-2" size={14} />
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClass("phone")} placeholder="Enter your phone number" />
                {errors.phone && <p className="mt-1 text-sm text-red-500 flex items-center font-calibri"><FaExclamationCircle className="mr-1" size={12} />{errors.phone}</p>}
              </div>
              <div>
                <label htmlFor="subject" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} className={inputClass("subject")} placeholder="Subject" />
                {errors.subject && <p className="mt-1 text-sm text-red-500 flex items-center font-calibri"><FaExclamationCircle className="mr-1" size={12} />{errors.subject}</p>}
              </div>
              <div>
                <label htmlFor="message" className="block text-md font-bold text-gray-700 mb-2 font-calibri">
                  Additional Message <span className="text-red-500">*</span>
                </label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={6} className={`${inputClass("message")} resize-none`} placeholder="Enter your message or any additional information" />
                {errors.message && <p className="mt-1 text-sm text-red-500 flex items-center font-calibri"><FaExclamationCircle className="mr-1" size={12} />{errors.message}</p>}
              </div>
              {submitStatus.message && (
                <div className={`p-4 rounded-lg flex items-center font-calibri text-md ${submitStatus.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                  {submitStatus.type === "success" ? <FaCheckCircle className="mr-2 text-green-500" size={20} /> : <FaExclamationCircle className="mr-2 text-red-500" size={20} />}
                  <span className="text-sm font-medium">{submitStatus.message}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button type="submit" disabled={isSubmitting} className={`flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isSubmitting ? <><span className="animate-spin">⏳</span><span>Submitting...</span></> : <><FaPaperPlane size={16} /><span>Submit Registration</span></>}
                </button>
                <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md flex items-center justify-center gap-2">
                  <FaTimes size={16} /><span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsRegistrationModal;
