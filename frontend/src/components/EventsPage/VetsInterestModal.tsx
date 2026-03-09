import React, { useState, useEffect } from "react";
import { FaTimes, FaSpinner, FaCheck } from "react-icons/fa";
import { apiFetch } from "../../utils/api";
import type { User } from "../../types/user";

interface VetsEvent {
  id: number;
  title: string;
  location: string;
  eventDate: string;
  description: string | null;
  isActive: boolean;
}

interface VetsInterestModalProps {
  onClose: () => void;
  user?: User | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  playerRating: string;
  eventIds: number[];
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  eventIds?: string;
  submit?: string;
}

const VetsInterestModal: React.FC<VetsInterestModalProps> = ({ onClose, user }) => {
  const [events, setEvents] = useState<VetsEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => ({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    playerRating: "",
    eventIds: [],
  }));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiFetch("/api/vets/events", { skipAuth: true });
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch VETS events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.eventIds.length === 0) {
      newErrors.eventIds = "Please select at least one event";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleEventToggle = (eventId: number) => {
    setFormData((prev) => {
      const newEventIds = prev.eventIds.includes(eventId)
        ? prev.eventIds.filter((id) => id !== eventId)
        : [...prev.eventIds, eventId];
      return { ...prev, eventIds: newEventIds };
    });
    if (errors.eventIds) {
      setErrors((prev) => ({ ...prev, eventIds: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await apiFetch("/api/vets/interests", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || "Failed to submit. Please try again." });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-green-600 text-3xl" />
          </div>
          <h3 className="font-huglove text-2xl text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="font-calibri text-gray-700 mb-6">
            Your interest has been registered successfully. We'll be in touch with more
            information about the VETS events you've selected.
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 font-calibri"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-rose-200">
          <h2 className="font-huglove text-2xl md:text-3xl text-gray-900">
            Register Interest
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
            aria-label="Close modal"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-calibri font-semibold text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                readOnly={!!user}
                className={`w-full px-4 py-3 border rounded-lg font-calibri focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                } ${user ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder={user ? undefined : "Enter your first name"}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1 font-calibri">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block font-calibri font-semibold text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                readOnly={!!user}
                className={`w-full px-4 py-3 border rounded-lg font-calibri focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                } ${user ? "bg-gray-100 cursor-not-allowed" : ""}`}
                placeholder={user ? undefined : "Enter your last name"}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1 font-calibri">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block font-calibri font-semibold text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!!user}
              className={`w-full px-4 py-3 border rounded-lg font-calibri focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              } ${user ? "bg-gray-100 cursor-not-allowed" : ""}`}
              placeholder={user ? undefined : "Enter your email address"}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 font-calibri">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-calibri font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-calibri focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your phone number (optional)"
            />
          </div>

          <div>
            <label className="block font-calibri font-semibold text-gray-700 mb-1">
              Player Rating
            </label>
            <textarea
              name="playerRating"
              value={formData.playerRating}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-calibri focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Describe your skill level (e.g., A, B, C or D Grade player)"
            />
          </div>

          <div>
            <label className="block font-calibri font-semibold text-gray-700 mb-2">
              Select Events <span className="text-red-500">*</span>
            </label>
            {loadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-green-600 text-2xl mr-2" />
                <span className="font-calibri text-gray-600">Loading events...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="font-calibri text-gray-600">
                  No VETS events are currently available. Please check back later.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {events.map((event) => (
                  <label
                    key={event.id}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.eventIds.includes(event.id)
                        ? "bg-green-50 border-2 border-green-500"
                        : "bg-white border-2 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.eventIds.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                      className="mt-1 mr-3 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <span className="font-calibri font-semibold text-gray-800">
                        {event.title}
                      </span>
                      <div className="font-calibri text-sm text-gray-600">
                        {event.location} • {formatDate(event.eventDate)}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {errors.eventIds && (
              <p className="text-red-500 text-sm mt-1 font-calibri">{errors.eventIds}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-calibri">
              {errors.submit}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-all duration-300 font-calibri"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingEvents || events.length === 0}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 font-calibri flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Interest"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VetsInterestModal;
