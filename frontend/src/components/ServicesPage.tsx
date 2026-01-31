import { useState, useEffect, type FormEvent } from "react";
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
} from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";

interface FormData {
  name: string;
  email: string;
  phone: string;
  racketBrand: string;
  racketModel: string;
  string: string;
  colour: string;
  tension: string;
  stencil: boolean;
  grip: boolean;
  grommetReplacement: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  racketBrand?: string;
  racketModel?: string;
  string?: string;
  colour?: string;
  tension?: string;
}


// String options with their available colors
const stringOptions: Record<string, string[]> = {
  "Yonex Exbolt 65": ["Black", "White"],
  "Yonex Exbolt 63": ["White", "Red", "Light Pink", "Mint"],
  "Yonex BG80": ["Yellow", "Sky Blue", "Neon Pink", "White"],
  "Yonex Exbolt 68": ["White"],
  "Yonex BG66 Ultimax": ["Yellow", "White"],
  "Yonex BG65": ["White", "Yellow"],
  "Victor VBS-66N": ["White", "Yellow"],
  "Victor VBS-68": ["White"],
  "Li-Ning No.1": ["White", "Yellow"],
  Other: ["Please specify in message"],
};

const tensionOptions = [
  "20 lbs",
  "21 lbs",
  "22 lbs",
  "23 lbs",
  "24 lbs",
  "25 lbs",
  "26 lbs",
  "27 lbs",
  "28 lbs",
  "29 lbs",
  "30 lbs",
  "31 lbs",
  "32 lbs",
];

const ServicesPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    racketBrand: "",
    racketModel: "",
    string: "",
    colour: "",
    tension: "",
    stencil: false,
    grip: false,
    grommetReplacement: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Initialize EmailJS
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (publicKey && publicKey !== "YOUR_PUBLIC_KEY") {
      emailjs.init(publicKey);
    }
  }, []);

  useEffect(() => {
    document.title = "ChibiBadminton - Stringing Services";
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.racketBrand) {
      newErrors.racketBrand = "Racket brand is required";
    }

    if (!formData.racketModel) {
      newErrors.racketModel = "Racket model is required";
    }

    if (!formData.string) {
      newErrors.string = "String selection is required";
    }

    if (formData.string && formData.string !== "Other") {
      if (!formData.colour) {
        newErrors.colour = "Colour selection is required";
      }
    }

    if (!formData.tension) {
      newErrors.tension = "Tension is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const buildServiceDetails = () => {
    let details = "Stringing Service Request:\n\n";
    details += `Racket Brand: ${formData.racketBrand}\n`;
    details += `Racket Model: ${formData.racketModel}\n`;
    details += `String: ${formData.string}\n`;
    if (formData.colour) {
      details += `Colour: ${formData.colour}\n`;
    }
    details += `Tension: ${formData.tension}\n\n`;

    details += "Additional Services:\n";
    if (formData.stencil) {
      details += "- Stencil: Yes\n";
    }
    if (formData.grip) {
      details += "- Grip: Yes\n";
    }
    if (formData.grommetReplacement) {
      details += `- Grommet Replacement: ${formData.grommetReplacement}\n`;
    }

    if (formData.message.trim()) {
      details += `\nAdditional Notes:\n${formData.message}`;
    }

    return details;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
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
        const serviceDetails = buildServiceDetails();
        const mailtoLink = `mailto:support@chibibadminton.com.au?subject=${encodeURIComponent(
          "Stringing Service Request"
        )}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\n${serviceDetails}`
        )}`;
        window.location.href = mailtoLink;
        setSubmitStatus({
          type: "success",
          message:
            "Opening your email client. If it doesn't open, please send an email to support@chibibadminton.com.au",
        });
        setTimeout(() => {
          setFormData({
            name: "",
            email: "",
            phone: "",
            racketBrand: "",
            racketModel: "",
            string: "",
            colour: "",
            tension: "",
            stencil: false,
            grip: false,
            grommetReplacement: "",
            message: "",
          });
        }, 2000);
        setIsSubmitting(false);
        return;
      }

      // Using EmailJS to send email
      const serviceDetails = buildServiceDetails();
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone,
          subject: "Stringing Service Request",
          message: serviceDetails,
          to_email: "support@chibibadminton.com.au",
        },
        publicKey
      );

      setSubmitStatus({
        type: "success",
        message:
          "Thank you! Your stringing service request has been submitted successfully. We'll contact you soon to confirm!",
      });
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          racketBrand: "",
          racketModel: "",
          string: "",
          colour: "",
          tension: "",
          stencil: false,
          grip: false,
          grommetReplacement: "",
          message: "",
        });
        setSubmitStatus({ type: null, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message:
          "Oops! Something went wrong. Please try again or contact us directly at support@chibibadminton.com.au",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="w-full overflow-x-hidden min-h-screen font-calibri text-lg bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-700 hover:text-rose-600 mb-6 transition-colors font-calibri"
        >
          <FaArrowLeft size={18} />
          <span>Back to Home</span>
        </button>

        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4 font-huglove">
            Stringing Services
          </h1>
          <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-7xl mx-auto font-calibri">
            Book your racket stringing service. Fill out the form below with your
            racket and string preferences.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-xl shadow-2xl overflow-hidden max-w-7xl mx-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Personal Information Section */}
              <div className="border-b border-gray-200 pb-4 md:pb-5">
                <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-3 md:mb-4 font-calibri">
                  Your Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      <FaUser className="inline mr-2" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      <FaEnvelope className="inline mr-2" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label
                      htmlFor="phone"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      <FaPhone className="inline mr-2" />
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="+61 400 000 000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Racket & String Information Section - Combined */}
              <div className="border-b border-gray-200 pb-4 md:pb-5">
                <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-3 md:mb-4 font-calibri">
                  Racket & String Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {/* Racket Brand */}
                  <div>
                    <label
                      htmlFor="racketBrand"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      Racket Brand <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="racketBrand"
                      name="racketBrand"
                      value={formData.racketBrand}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.racketBrand
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="Enter racket brand (e.g., Yonex, Victor)"
                    />
                    {errors.racketBrand && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.racketBrand}
                      </p>
                    )}
                  </div>

                  {/* Racket Model */}
                  <div>
                    <label
                      htmlFor="racketModel"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      Racket Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="racketModel"
                      name="racketModel"
                      value={formData.racketModel}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.racketModel
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="Enter racket model"
                    />
                    {errors.racketModel && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.racketModel}
                      </p>
                    )}
                  </div>

                  {/* String */}
                  <div>
                    <label
                      htmlFor="string"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      String <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="string"
                      name="string"
                      value={formData.string}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.string
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                    >
                      <option value="">Select string</option>
                      {Object.keys(stringOptions).map((string) => (
                        <option key={string} value={string}>
                          {string}
                        </option>
                      ))}
                    </select>
                    {errors.string && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.string}
                      </p>
                    )}
                  </div>

                  {/* Colour */}
                  <div>
                    <label
                      htmlFor="colour"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      Colour{" "}
                      {formData.string && formData.string !== "Other" && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      id="colour"
                      name="colour"
                      value={formData.colour}
                      onChange={handleChange}
                      disabled={!formData.string || formData.string === "Other"}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.colour
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        } ${!formData.string || formData.string === "Other"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                        }`}
                      placeholder={
                        !formData.string
                          ? "Select string first"
                          : formData.string === "Other"
                            ? "N/A for Other"
                            : "Enter colour (e.g., White, Red, Yellow)"
                      }
                    />
                    {errors.colour && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.colour}
                      </p>
                    )}
                  </div>

                  {/* Tension */}
                  <div>
                    <label
                      htmlFor="tension"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      Tension <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tension"
                      name="tension"
                      value={formData.tension}
                      onChange={handleChange}
                      className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 font-calibri text-sm md:text-lg ${errors.tension
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                    >
                      <option value="">Select tension</option>
                      {tensionOptions.map((tension) => (
                        <option key={tension} value={tension}>
                          {tension}
                        </option>
                      ))}
                    </select>
                    {errors.tension && (
                      <p className="mt-1 text-xs md:text-sm text-red-600 font-calibri">
                        {errors.tension}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services Section - More Compact */}
              <div className="border-b border-gray-200 pb-4 md:pb-5">
                <h2 className="text-xl md:text-2xl font-medium text-gray-900 mb-3 md:mb-4 font-calibri">
                  Additional Services
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {/* Stencil */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="stencil"
                      name="stencil"
                      checked={formData.stencil}
                      onChange={handleChange}
                      className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <label
                      htmlFor="stencil"
                      className="ml-3 text-sm md:text-lg font-medium text-gray-700 font-calibri"
                    >
                      Stencil
                    </label>
                  </div>

                  {/* Grip */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="grip"
                      name="grip"
                      checked={formData.grip}
                      onChange={handleChange}
                      className="w-5 h-5 text-rose-500 border-gray-300 rounded focus:ring-rose-500"
                    />
                    <label
                      htmlFor="grip"
                      className="ml-3 text-sm md:text-lg font-medium text-gray-700 font-calibri"
                    >
                      Grip
                    </label>
                  </div>

                  {/* Grommet Replacement */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label
                      htmlFor="grommetReplacement"
                      className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                    >
                      Grommet Replacement (10+)
                    </label>
                    <input
                      type="text"
                      id="grommetReplacement"
                      name="grommetReplacement"
                      value={formData.grommetReplacement}
                      onChange={handleChange}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm md:text-lg"
                      placeholder="e.g., 10, 12, 15"
                    />
                    <p className="mt-1 text-md text-justify text-gray-500 font-calibri">
                      More info coming soon
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm md:text-lg font-medium text-gray-700 mb-1.5 md:mb-2 font-calibri"
                >
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm md:text-lg"
                  placeholder="Any additional information or special requests..."
                />
              </div>

              {/* Status Message */}
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg flex items-start gap-3 font-calibri ${submitStatus.type === "success"
                    ? "bg-green-50 border border-green-200"
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

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold font-calibri"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg transition-all duration-300 font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-calibri shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={18} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
