import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import emailjs from "@emailjs/browser";
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import Banner from "../assets/BannerMain.png";

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

const ContactUsPage = () => {
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

    try {
      // EmailJS service configuration
      // To set up EmailJS:
      // 1. Sign up at https://www.emailjs.com/
      // 2. Create an email service (Gmail, Outlook, etc.)
      // 3. Create an email template with these variables: {{from_name}}, {{from_email}}, {{phone}}, {{subject}}, {{message}}
      // 4. Get your Service ID, Template ID, and Public Key
      // 5. Add them to your .env file or replace the values below:

      const serviceId =
        import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId =
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey =
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

      // Check if EmailJS is configured
      if (
        serviceId === "YOUR_SERVICE_ID" ||
        templateId === "YOUR_TEMPLATE_ID" ||
        publicKey === "YOUR_PUBLIC_KEY"
      ) {
        // Fallback: Open mailto link if EmailJS is not configured
        const mailtoLink = `mailto:help@ChibiBadminton.com.au?subject=${encodeURIComponent(
          formData.subject
        )}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${
            formData.phone || "Not provided"
          }\n\nMessage:\n${formData.message}`
        )}`;
        window.location.href = mailtoLink;
        setSubmitStatus({
          type: "success",
          message:
            "Opening your email client. If it doesn't open, please send an email to help@ChibiBadminton.com.au",
        });
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setIsSubmitting(false);
        return;
      }

      // Using EmailJS to send email
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || "Not provided",
          subject: formData.subject,
          message: formData.message,
          to_email: "help@ChibiBadminton.com.au",
        },
        publicKey
      );

      setSubmitStatus({
        type: "success",
        message:
          "Thank you! Your message has been sent successfully. We'll get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Oops! Something went wrong. Please try again or contact us directly at help@ChibiBadminton.com.au",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Banner Section - Entirely below navbar */}
      <div className="relative w-full mb-12 overflow-hidden pt-16 md:pt-16">
        <div className="relative w-full h-[30vh] md:h-[30vh] lg:h-[30vh]">
          <img
            src={Banner}
            alt="ChibiBadminton Banner"
            className="w-full h-full object-contain"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40 opacity-50"></div>

          {/* Header Text Over Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
              Contact Us
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
              Have a question or want to join our badminton community? We'd love
              to hear from you!
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-7xl mx-auto min-h-full">
        {/* Subtitle Section */}
        <div className="text-center mb-12">
          <p className="text-xl lg:text-2xl text-gray-700 max-w-2xl mx-auto">
            Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-2">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-slate-50 rounded-lg p-6 md:p-8 shadow-lg h-full border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Get In Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <FaEnvelope className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-1">Email</h3>
                    <a
                      href="mailto:help@ChibiBadminton.com.au"
                      className="text-gray-600 hover:text-green-600 transition-colors break-all"
                    >
                      help@ChibiBadminton.com.au
                    </a>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Our team typically responds within 24-48 hours. For urgent
                    matters, please reach out directly via email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-lg border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Send Us a Message
              </h2>

              {/* Status Messages */}
              {submitStatus.type && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                    submitStatus.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <FaExclamationCircle
                      className="flex-shrink-0 mt-0.5"
                      size={20}
                    />
                  )}
                  <p className="text-sm">{submitStatus.message}</p>
                </div>
              )}

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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500"
                      }`}
                      placeholder="Your email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">
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
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-green-500"
                      }`}
                      placeholder="+61 400 000 000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone}
                      </p>
                    )}
                  </div>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.subject
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">
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
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
                      errors.message
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold p-3 px-8 rounded-lg text-lg transition duration-300 ${
                    isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={18} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
