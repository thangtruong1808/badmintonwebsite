import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import ChibiBattleRoyal from "../assets/ChibiBattleRoyal.png";
import ChibiBattleRoyale2 from "../assets/ChibiBattle Royale2.png";
import BannerMain from "../assets/BannerMain.png";
import Banner from "../assets/banner.png";
import ChibiBattleRoyalBG from "../assets/ChibiBattleRoyalBG.png";

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  imageUrl: string;
  status: "completed" | "upcoming";
}

const events: Event[] = [
  {
    id: 1,
    title: "Chibi Battle Royale #1",
    date: "November 11, 2023",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The first ever ChibiBadminton Battle Royale. 56 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 56,
    imageUrl: ChibiBattleRoyal as string,
    status: "completed",
  },
  {
    id: 2,
    title: "Chibi Battle Royale #2",
    date: "December 16, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The second ever ChibiBadminton Battle Royale. 104 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 68,
    imageUrl: ChibiBattleRoyale2 as string,
    status: "completed",
  },
  {
    id: 3,
    title: "Chibi Battle Royale #3",
    date: "November 12, 2025",
    time: "9:00 AM - 5:00 PM",
    location: "Altona Meadows Badminton Club",
    description:
      "The third ever ChibiBadminton Battle Royale. 104 players competed for the title of ChibiBadminton Champion. The event was a success and we are looking forward to the next one!",
    attendees: 68,
    imageUrl: BannerMain as string,
    status: "completed",
  },
  {
    id: 4,
    title: "Chibi Battle Royale #4",
    date: "Expected date: December 2026",
    time: "Expected time: 9:00 AM - 5:00 PM",
    location:
      "Expected location: Krisna Badminton Club and Stomers Badminton Club",
    description:
      "Expected description: The fourth ever ChibiBadminton Battle Royale is officially in the works!\n\nThe event is planned to open in December 2026, bringing together many players to compete for the title of ChibiBadminton Champion. We're excited to build on the success of previous tournaments and deliver the biggest Battle Royale yet. More information will be released soon.",
    attendees: 0,
    imageUrl: Banner as string,
    status: "upcoming",
  },
];

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
      import.meta.env.VITE_EMAIL_TO || "help@ChibiBadminton.com.au";

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
    <div
      className="w-full overflow-x-hidden min-h-screen"
      style={{
        backgroundImage: `url(${ChibiBattleRoyalBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full">
        {/* Upcoming Events Section - Full Width */}
        {upcomingEvents.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                UPCOMING
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
                Upcoming Events
              </h2>
              <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                Don't miss out on these exciting upcoming events!
              </p>
            </div>
            <div className="w-full space-y-8">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-500/50 w-full"
                >
                  <div className="flex flex-col md:flex-row w-full">
                    <div className="relative w-full md:w-1/2 h-64 md:h-auto md:min-h-[400px] overflow-hidden bg-white">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                        Upcoming
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white/95">
                      <div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                          {event.title}
                        </h3>
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center text-gray-700">
                            <FaCalendarAlt
                              className="mr-3 text-green-600"
                              size={20}
                            />
                            <span className="text-base font-medium">{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <FaClock
                              className="mr-3 text-green-600"
                              size={20}
                            />
                            <span className="text-base font-medium">{event.time}</span>
                          </div>
                          <div className="flex items-start text-gray-700">
                            <FaMapMarkerAlt
                              className="mr-3 mt-1 text-green-600 flex-shrink-0"
                              size={20}
                            />
                            <span className="text-base font-medium">{event.location}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openRegistrationModal(event)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Register Now
                        </button>
                        <button className="flex-1 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg hover:shadow-lg">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Events History Section */}
        <section className="pt-8 pb-4">
          <div className="text-center mb-12">
            <div className="inline-block bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              PAST EVENTS
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Events History
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
              Take a look back at our amazing past events and gatherings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {completedEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                    Completed
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 bg-white/95">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      <FaCalendarAlt
                        className="mr-3 text-green-600 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-sm font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaClock className="mr-3 text-green-600 flex-shrink-0" size={16} />
                      <span className="text-sm font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <FaMapMarkerAlt
                        className="mr-3 mt-1 text-green-600 flex-shrink-0"
                        size={16}
                      />
                      <span className="text-sm font-medium line-clamp-2">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaUsers className="mr-3 text-green-600 flex-shrink-0" size={16} />
                      <span className="text-sm font-medium">
                        {event.attendees} Attendees
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <button className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Empty State (if no events) */}
        {events.length === 0 && (
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
        )}
      </div>

      {/* Registration Form Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">
                  Event Details:
                </h3>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2" size={14} />
                    <span>{selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="mr-2" size={14} />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-2" size={14} />
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
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <FaUser className="inline mr-2" size={14} />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <FaEnvelope className="inline mr-2" size={14} />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <FaPhone className="inline mr-2" size={14} />
                    Phone Number{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${errors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 ${errors.subject
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Subject"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {errors.subject}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Additional Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300 resize-none ${errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Enter your message or any additional information"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500 flex items-center">
                      <FaExclamationCircle className="mr-1" size={12} />
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Status */}
                {submitStatus.message && (
                  <div
                    className={`p-4 rounded-lg flex items-center ${submitStatus.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                  >
                    {submitStatus.type === "success" ? (
                      <FaCheckCircle className="mr-2" size={20} />
                    ) : (
                      <FaExclamationCircle className="mr-2" size={20} />
                    )}
                    <span className="text-sm font-medium">
                      {submitStatus.message}
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane size={16} />
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeRegistrationModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
