import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaPhone, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaTimes, FaArrowLeft, FaCheck, FaTruck, FaShieldAlt } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import Banner from "../assets/BannerMain.png";
import { products } from "./MarketplacePage";

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

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === Number(id));
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Pre-fill form when product is available
  useEffect(() => {
    if (product) {
      setFormData((prev) => ({
        ...prev,
        subject: `Inquiry about ${product.name}`,
        message: `I'm interested in purchasing: ${product.name} ($${product.price.toFixed(2)})\n\n`,
      }));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">Product Not Found</h1>
          <button
            onClick={() => navigate("/marketplace")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

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
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

      // Check if EmailJS is configured
      if (serviceId === "YOUR_SERVICE_ID" || templateId === "YOUR_TEMPLATE_ID" || publicKey === "YOUR_PUBLIC_KEY") {
        // Fallback: Open mailto link if EmailJS is not configured
        const productInfo = `\n\nProduct Inquiry: ${product.name} ($${product.price.toFixed(2)})`;
        const mailtoLink = `mailto:help@ChibiBadminton.com.au?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}${productInfo}\n\nMessage:\n${formData.message}`
        )}`;
        window.location.href = mailtoLink;
        setSubmitStatus({
          type: "success",
          message: "Opening your email client. If it doesn't open, please send an email to help@ChibiBadminton.com.au",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
          });
        }, 2000);
        setIsSubmitting(false);
        return;
      }

      // Using EmailJS to send email
      const productInfo = `Product Inquiry: ${product.name} ($${product.price.toFixed(2)})`;
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || "Not provided",
          subject: formData.subject,
          message: `${productInfo}\n\n${formData.message}`,
          to_email: "help@ChibiBadminton.com.au",
        },
        publicKey
      );

      setSubmitStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon!",
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setSubmitStatus({ type: null, message: "" });
      }, 2000);
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message: "Oops! Something went wrong. Please try again or contact us directly at help@ChibiBadminton.com.au",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
    setErrors({});
    setSubmitStatus({ type: null, message: "" });
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>

          {/* Header Text Over Banner */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
              Product Details
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-white max-w-3xl mx-auto drop-shadow-md font-medium">
              {product.name}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full">
        {/* Back Button */}
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors duration-300"
        >
          <FaArrowLeft size={18} />
          <span className="font-medium">Back to Marketplace</span>
        </button>

        {/* Product Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-2 rounded">
                  SALE
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              {product.name}
            </h2>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-4xl md:text-5xl font-bold text-green-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <div className="flex flex-col">
                    <span className="text-xl text-gray-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-red-600 font-semibold">
                      Save ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <FaCheck size={20} />
                  <span>In Stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 font-semibold">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-black">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description ||
                  `High-quality ${product.name.toLowerCase()} perfect for badminton enthusiasts. This product is carefully selected to meet the needs of players at all skill levels. Whether you're a beginner or a professional, this item will enhance your badminton experience.`}
              </p>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-black">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700">
                  <FaCheck className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <span>Premium quality materials</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <FaCheck className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <span>Durable and long-lasting</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <FaCheck className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <span>Perfect for all skill levels</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <FaCheck className="text-green-600 mt-1 flex-shrink-0" size={16} />
                  <span>Warranty included</span>
                </li>
              </ul>
            </div>

            {/* Contact Us Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!product.inStock}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-lg font-bold text-lg transition duration-300 mb-4 ${product.inStock
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              <FaEnvelope size={20} />
              {product.inStock ? "Contact Us" : "Out of Stock"}
            </button>

            {/* Shipping & Guarantee Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <FaTruck className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-black">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-green-600" size={24} />
                <div>
                  <p className="font-semibold text-black">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/marketplace/product/${relatedProduct.id}`)}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer border border-slate-100"
                >
                  <div className="relative h-60 md:h-60 overflow-hidden bg-white border-b border-slate-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-black mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ${relatedProduct.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">Contact Us</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Product Inquiry:</p>
                <p className="font-semibold text-black">{product.name}</p>
                <p className="text-green-600 font-bold">${product.price.toFixed(2)}</p>
              </div>

              {/* Status Messages */}
              {submitStatus.type && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${submitStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                  {submitStatus.type === "success" ? (
                    <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="John Doe"
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      <FaPhone className="inline mr-2" size={14} />
                      Phone Number <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                        }`}
                      placeholder="+61 400 000 000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.subject
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-green-500"
                      }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ${isSubmitting
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
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
