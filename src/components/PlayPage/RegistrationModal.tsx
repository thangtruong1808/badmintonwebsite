import React, { useState, useEffect, useMemo, type FormEvent } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPaperPlane,
  FaCoins,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import type { SocialEvent } from "../../types/socialEvent";
import type { RegistrationFormData, FormErrors } from "../../types/socialEvent";
import { registerUserForEvents } from "../../utils/registrationService";
import { getCurrentUser } from "../../utils/mockAuth";
import { canUsePointsForBooking, formatPoints } from "../../utils/rewardPoints";
import { usePointsForBooking } from "../../utils/rewardPointsService";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SocialEvent[];
  isMultiEvent: boolean;
  onSuccess: (updatedEvents: SocialEvent[]) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  events,
  isMultiEvent,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "points" | "mixed">("cash");
  const [pointsToUse, setPointsToUse] = useState<number>(0);
  const [user, setUser] = useState(() => getCurrentUser());

  // Update user when modal opens (only once)
  useEffect(() => {
    if (isOpen) {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    }
  }, [isOpen]);

  const totalPrice = useMemo(() => events.reduce((sum, e) => sum + (e.price || 0), 0), [events]);
  const userPoints = user?.rewardPoints || 0;
  const canPayWithPoints = canUsePointsForBooking(totalPrice, userPoints);

  // Initialize EmailJS
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init(publicKey);
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", phone: "" });
      setErrors({});
      setSubmitStatus({ type: null, message: "" });
      setPaymentMethod("cash");
      setPointsToUse(0);
      return;
    }

    // Auto-select points if user has enough (only when modal first opens)
    if (user && canPayWithPoints && paymentMethod === "cash") {
      setPaymentMethod("points");
      setPointsToUse(totalPrice);
    }
  }, [isOpen]); // Only depend on isOpen to prevent infinite loops

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const buildEventDetails = () => {
    if (events.length === 1) {
      const event = events[0];
      return `Event Details:
- Title: ${event.title}
- Date: ${formatDate(event.date)} (${event.dayOfWeek})
- Time: ${event.time}
- Location: ${event.location}
- Price: ${event.price ? `$${event.price}` : "Free"}`;
    } else {
      let details = `I would like to register for ${events.length} events:\n\n`;
      events.forEach((event, index) => {
        details += `${index + 1}. ${event.title}\n`;
        details += `   Date: ${formatDate(event.date)} (${event.dayOfWeek})\n`;
        details += `   Time: ${event.time}\n`;
        details += `   Location: ${event.location}\n`;
        details += `   Price: ${event.price ? `$${event.price}` : "Free"}\n\n`;
      });
      const totalPrice = events.reduce((sum, e) => sum + (e.price || 0), 0);
      if (totalPrice > 0) {
        details += `Total: $${totalPrice.toFixed(2)}`;
      }
      return details;
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

    const subject = isMultiEvent
      ? `Registration for ${events.length} Play Sessions`
      : `Registration for ${events[0].title}`;

    const message = `I would like to register for the following play session(s):\n\n${buildEventDetails()}\n\nMy Details:\n- Name: ${formData.name}\n- Email: ${formData.email}\n- Phone: ${formData.phone || "Not provided"}\n\nPlease confirm my registration.`;

    if (
      !serviceId ||
      !templateId ||
      !publicKey ||
      publicKey === "YOUR_PUBLIC_KEY"
    ) {
      // Fallback to mailto link
      const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
      setSubmitStatus({
        type: "success",
        message:
          "Opening your email client. Please send the pre-filled email to complete registration.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Use points if payment method is points or mixed
      if (user && (paymentMethod === "points" || paymentMethod === "mixed")) {
        const pointsNeeded = paymentMethod === "points" ? totalPrice : pointsToUse;
        if (pointsNeeded > 0) {
          const success = usePointsForBooking(user.id, events[0].id, pointsNeeded);
          if (!success) {
            setSubmitStatus({
              type: "error",
              message: "Failed to process points payment. Please try again.",
            });
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Step 2: Register the user for events locally
      const registrationResult = registerUserForEvents(events, formData);

      if (!registrationResult.success) {
        setSubmitStatus({
          type: "error",
          message: registrationResult.message,
        });
        setIsSubmitting(false);
        return;
      }

      const templateParams = {
        to_email: toEmail,
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || "Not provided",
        subject: subject,
        message: message,
      };

      await emailjs.send(serviceId, templateId, templateParams);

      setSubmitStatus({
        type: "success",
        message: isMultiEvent
          ? `Successfully registered for ${events.length} events! We'll confirm your registration via email.`
          : "Registration submitted successfully! We'll confirm your registration via email.",
      });

      // Reset form after success
      setTimeout(() => {
        setFormData({ name: "", email: "", phone: "" });
        onSuccess(registrationResult.updatedEvents);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Failed to send registration. Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isMultiEvent
              ? `Register for ${events.length} Events`
              : `Register for ${events[0]?.title}`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Event Summary */}
        <div className="p-6 bg-gradient-to-r from-pink-100 to-pink-200 border-b border-gray-200 font-calibri">
          <h3 className="font-bold text-gray-900 mb-3">Selected Events:</h3>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-3 rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(event.date)} • {event.time}
                </p>
                {event.price && (
                  <p className="text-sm font-bold text-rose-500">
                    ${event.price}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 font-calibri bg-gradient-to-r from-pink-100 to-pink-200">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-md font-bold text-gray-700 mb-2 font-calibri"
              >
                <FaUser className="inline mr-2" />
                <span className="text-md">Full Name</span> <span className="text-red-500 font-calibri text-md">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-md ${errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-rose-500"
                  }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 font-calibri text-md">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-md font-bold text-gray-700 mb-2 font-calibri"
              >
                <FaEnvelope className="inline mr-2" />
                <span className="text-md font-bold">Email Address</span> <span className="text-red-500 font-calibri text-md font-bold">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-md ${errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-rose-500"
                  }`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 font-calibri text-md">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label
                htmlFor="phone"
                className="block text-md font-bold text-gray-700 mb-2 font-calibri"
              >
                <FaPhone className="inline mr-2" />
                <span className="text-md">Phone Number</span> <span className="text-gray-500 font-calibri text-md font-medium">(Required)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-md ${errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-rose-500"
                  }`}
                placeholder="+61 400 000 000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 font-calibri text-md">{errors.phone}</p>
              )}
            </div>

            {/* Payment Method Selection */}
            {user && totalPrice > 0 && (
              <div>
                <label className="block text-md font-bold text-gray-700 mb-3 font-calibri">
                  <span className="text-md">Payment Method</span>
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod("cash");
                      setPointsToUse(0);
                    }}
                    className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-colors font-calibri text-md ${paymentMethod === "cash"
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave className="text-rose-500" size={20} />
                      <div className="text-left">
                        <div className="font-bold text-gray-900">Pay via PayID</div>
                        <div className="text-sm text-gray-600 font-calibri text-md">${totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                    {paymentMethod === "cash" && (
                      <FaCheckCircle className="text-rose-500" size={20} />
                    )}
                  </button>

                  {canPayWithPoints && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("points");
                        setPointsToUse(totalPrice);
                      }}
                      className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-colors ${paymentMethod === "points"
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaCoins className="text-rose-500" size={20} />
                        <div className="text-left">
                          <div className="font-bold text-gray-900 font-calibri text-md">Pay with Points</div>
                          <div className="text-sm text-gray-600 font-calibri text-md">
                            {formatPoints(totalPrice)} points (You have {formatPoints(userPoints)})
                          </div>
                        </div>
                      </div>
                      {paymentMethod === "points" && (
                        <FaCheckCircle className="text-rose-500" size={20} />
                      )}
                    </button>
                  )}

                  {userPoints > 0 && userPoints < totalPrice && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod("mixed");
                        setPointsToUse(userPoints);
                      }}
                      className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-colors ${paymentMethod === "mixed"
                        ? "border-rose-500 bg-rose-50 font-calibri text-md"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <FaExchangeAlt className="text-rose-500" size={20} />
                        <div className="text-left">
                          <div className="font-bold text-gray-900 font-calibri text-md">Mixed Payment</div>
                          <div className="text-sm text-gray-600 font-calibri text-md text-left">
                            {formatPoints(userPoints)} points + ${(totalPrice - userPoints).toFixed(2)} cash
                          </div>
                        </div>
                      </div>
                      {paymentMethod === "mixed" && (
                        <FaCheckCircle className="text-rose-500" size={20} />
                      )}
                    </button>
                  )}
                </div>
                {paymentMethod === "points" && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg font-calibri text-md text-left">
                    <p className="text-md font-medium text-green-800 font-calibri text-left">
                      ✓ You have enough points! This booking will be free.
                    </p>
                  </div>
                )}
                {paymentMethod === "mixed" && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg font-calibri text-md text-left">
                    <p className="text-md font-medium text-blue-800 font-calibri text-left">
                      Using {formatPoints(pointsToUse)} points, remaining ${(totalPrice - pointsToUse).toFixed(2)} will be paid in cash.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Message */}
          {submitStatus.type && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-start gap-3 font-calibri text-md text-left ${submitStatus.type === "success"
                ? "bg-green-50 border border-green-200 text-left"
                : "bg-red-50 border border-red-200"
                }`}
            >
              {submitStatus.type === "success" ? (
                <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <FaExclamationCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p
                className={`text-md font-medium ${submitStatus.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
                  }`}
              >
                {submitStatus.message}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold font-calibri text-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-calibri text-md"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span className="font-calibri text-md">Submitting...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane size={18} />
                  <span className="font-calibri text-md font-bold">Submit Registration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
