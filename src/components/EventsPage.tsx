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
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import EventsHistory from "./EventsHistory";
import UpcomingEvents from "./UpcomingEvents";
import type { Event } from "../data/eventData";
import { events } from "../data/eventData";



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

const EventsPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Events";
  }, []);

  const completedEvents = events.filter(
    (event) => event.status === "completed"
  );
  const upcomingEvents = events.filter((event) => event.status === "upcoming");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
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

  // Initialize EmailJS with public key
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init(publicKey);
    }
  }, []);

  const openRegistrationModal = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: `Registration for ${event.title}`,
      message: `I would like to register for ${event.title}.\n\nEvent Details:\n- Date: ${event.date}\n- Time: ${event.time}\n- Location: ${event.location}\n\nPlease confirm my registration.`,
    });
    setIsModalOpen(true);
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
  };

  const closeRegistrationModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const toEmail =
      import.meta.env.VITE_EMAIL_TO || "support@chibibadminton.com.au";

    if (
      !serviceId ||
      !templateId ||
      !publicKey ||
      publicKey === "YOUR_PUBLIC_KEY"
    ) {
      // Fallback to mailto link
      const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(
        formData.subject
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"
        }\nMessage: ${formData.message}`
      )}`;
      window.location.href = mailtoLink;
      setSubmitStatus({
        type: "success",
        message: "Email client opened. Please send the email.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || "Not provided",
          subject: formData.subject,
          message: formData.message,
          to_email: toEmail,
        },
        publicKey
      );
      setSubmitStatus({
        type: "success",
        message:
          "Your registration has been submitted successfully! We'll contact you soon.",
      });
      setFormData((prev) => ({ ...prev, name: "", email: "", phone: "" }));
      setErrors({});
    } catch (error) {
      console.error("Failed to send email:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to submit registration. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden relative ">
      <div className="relative z-10">
        {/* Upcoming Events Section - Full Width */}
        <UpcomingEvents upcomingEvents={upcomingEvents} openRegistrationModal={openRegistrationModal} />

        {/* Events History Section */}
        <EventsHistory completedEvents={completedEvents} />

        {/* Empty State (if no events) */}
        {events.length === 0 && (
          <div className="px-4 md:px-8 py-12 md:py-16">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-20">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 md:p-16 max-w-2xl mx-auto">
                  <FaCalendarAlt className="mx-auto text-gray-400 mb-6" size={64} />
                  <h3 className="text-3xl font-bold mb-3 text-gray-800">
                    No Events Yet
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Check back soon for upcoming events and gatherings!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registration Form Modal */}
        {isModalOpen && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ">
            <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl md:text-2xl font-bold text-black">
                  Register for {selectedEvent.title}
                </h2>
                <button
                  onClick={closeRegistrationModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  aria-label="Close modal"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8">
                {/* Event Info */}
                <div className="bg-stone-50 border border-gray-200 rounded-lg p-4 mb-6 font-calibri">
                  <h3 className="font-bold text-gray-800 mb-2 font-calibri">
                    Event Details:
                  </h3>
                  <div className="space-y-1 text-md font-medium text-gray-700 font-calibri">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-rose-500" size={14} />
                      <span>{selectedEvent.date}</span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="mr-2 text-rose-500" size={14} />
                      <span>{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-rose-500" size={14} />
                      <span>{selectedEvent.location}</span>
                    </div>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      <FaUser className="inline mr-2" size={14} />
                      Full Name <span className="text-red-500 font-calibri text-md">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-md ${errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-md">
                        <FaExclamationCircle className="mr-1 text-red-500 font-calibri text-md" size={12} />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      <FaEnvelope className="inline mr-2" size={14} />
                      Email Address <span className="text-red-500 font-calibri text-md">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-md ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-md">
                        <FaExclamationCircle className="mr-1 text-red-500 font-calibri text-md" size={12} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      <FaPhone className="inline mr-2" size={14} />
                      Phone Number{" "}
                      <span className="text-gray-500 font-calibri text-md">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-md ${errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-md">
                        <FaExclamationCircle className="mr-1 text-red-500 font-calibri text-md" size={12} />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      Subject <span className="text-red-500 font-calibri text-md">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 font-calibri text-md   ${errors.subject
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Subject"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-md">
                        <FaExclamationCircle className="mr-1 text-red-500 font-calibri text-md" size={12} />
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      Additional Message <span className="text-red-500 font-calibri text-md">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 resize-none font-calibri text-md ${errors.message
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="Enter your message or any additional information"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500 flex items-center font-calibri text-md">
                        <FaExclamationCircle className="mr-1 text-red-500 font-calibri text-md" size={12} />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Status */}
                  {submitStatus.message && (
                    <div
                      className={`p-4 rounded-lg flex items-center ${submitStatus.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200 font-calibri text-md"
                        : "bg-red-50 text-red-800 border border-red-200 font-calibri text-md"
                        }`}
                    >
                      {submitStatus.type === "success" ? (
                        <FaCheckCircle className="mr-2 text-green-500 font-calibri text-md" size={20} />
                      ) : (
                        <FaExclamationCircle className="mr-2 text-red-500 font-calibri text-md" size={20} />
                      )}
                      <span className="text-sm font-medium font-calibri text-md">
                        {submitStatus.message}
                      </span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span className="font-calibri text-md">Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaPaperPlane size={16} />
                          <span className="font-calibri text-md">Submit Registration</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeRegistrationModal}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <FaTimes size={16} />
                        <span className="font-calibri text-md">Cancel</span>
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
