import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUser, FaPhone, FaPaperPlane, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import VICTORYBADMINTONPRO from "../assets/VICTORNCSPRO.jpg";
import VICTORYBADMINTONPRO2 from "../assets/VICTORNCSPRO2.jpg";
import VICTORYBADMINTONPRO3 from "../assets/VICTORNCSPRO3.jpg";


export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Optional array for multiple images
  category: string;
  inStock: boolean;
  description?: string;
}

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

export const products: Product[] = [
  {
    id: 1,
    name: "VICTOR NCS PRO (Synthetic/Carbon)",
    price: 42,
    image: VICTORYBADMINTONPRO,
    images: [
      VICTORYBADMINTONPRO,
      VICTORYBADMINTONPRO2,
      VICTORYBADMINTONPRO3,
    ],
    category: "Shuttlecocks",
    inStock: true,
  },
  {
    id: 2,
    name: "LINGMEI 90 (Goose feather)",
    price: 55,
    image: "https://alphabadminton.com.au/cdn/shop/products/003_1024x_7e3b263c-545c-4775-9553-0033737aee7d.jpg?v=1620527313",
    images: [
      "https://alphabadminton.com.au/cdn/shop/products/003_1024x_7e3b263c-545c-4775-9553-0033737aee7d.jpg?v=1620527313",
      "https://www.spsport.com.au/cdn/shop/files/169528433854595100.jpg?v=1760683258&width=1080",
      "https://www.spsport.com.au/cdn/shop/files/169528434886492400.jpg?v=1760683258&width=1080",
    ],
    category: "Shuttlecocks",
    inStock: true,
  },
  {
    id: 3,
    name: "Yonex Exbolt 65",
    price: 30,
    // originalPrice: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/yonex-exbolt-65-0-65mm-badminton-200m-reel-black__76624_1024x.jpg?v=1695711815",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 4,
    name: "Yonex Exbolt 63",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/exbolt63_white_1024x.jpg?v=1744102637",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 5,
    name: "Yonex BG80 Yellow Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/bg80yellowreel_1024x.webp?v=1755679070",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 6,
    name: "Yonex BG80 Sky Blue Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/bg80reelskyblue_1024x.jpg?v=1724045191",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 7,
    name: "Yonex BG80 Neon Pink Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/BG80-2_NEON-PINK_1_1024x.jpg?v=1755940982",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 8,
    name: "Yonex Exbolt 63 Red Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/exbolt63redreel_1024x.jpg?v=1755942127",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 9,
    name: "Yonex Exbolt 63 Light Pink Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/exbolt_63_light_pink_a0a04d01-5bcc-4524-bb87-197ac7d2dec9_1024x.jpg?v=1755941240",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 10,
    name: "Yonex Exbolt 63 Mint Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/exbolt63_mint_a5c19fd8-9181-4b0a-b419-6b15a737af4b_1024x.jpg?v=1755941284",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 11,
    name: "Yonex BG80 White Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/bg80reelwhite_1024x.jpg?v=1724045059",
    category: "Stringing Services",
    inStock: true,
  },
  {
    id: 12,
    name: "Yonex Exbolt 68 White Reel",
    price: 30,
    image: "https://badmintonclick.com.au/cdn/shop/files/exbolt68whitereel_1024x.jpg?v=1724045586",
    category: "Stringing Services",
    inStock: true,
  },


];

const ShopPage = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Shop";
  }, []);

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    type: null as "success" | "error" | null,
    message: "",
  });

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
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

      // Check if EmailJS is configured
      if (serviceId === "YOUR_SERVICE_ID" || templateId === "YOUR_TEMPLATE_ID" || publicKey === "YOUR_PUBLIC_KEY") {
        // Fallback: Open mailto link if EmailJS is not configured
        const productInfo = selectedProduct ? `\n\nProduct Inquiry: ${selectedProduct.name} ($${selectedProduct.price.toFixed(2)})` : "";
        const mailtoLink = `mailto:support@chibibadminton.com.au?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
          `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone || "Not provided"}${productInfo}\n\nMessage:\n${formData.message}`
        )}`;
        window.location.href = mailtoLink;
        setSubmitStatus({
          type: "success",
          message: "Opening your email client. If it doesn't open, please send an email to support@chibibadminton.com.au",
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
          setSelectedProduct(null);
        }, 2000);
        setIsSubmitting(false);
        return;
      }

      // Using EmailJS to send email
      const productInfo = selectedProduct ? `Product Inquiry: ${selectedProduct.name} ($${selectedProduct.price.toFixed(2)})` : "";
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          phone: formData.phone || "Not provided",
          subject: formData.subject,
          message: `${productInfo ? productInfo + "\n\n" : ""}${formData.message}`,
          to_email: "support@chibibadminton.com.au",
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
        setSelectedProduct(null);
        setSubmitStatus({ type: null, message: "" });
      }, 2000);
    } catch (error) {
      console.error("Error sending email:", error);
      setSubmitStatus({
        type: "error",
        message: "Oops! Something went wrong. Please try again or contact us directly at support@chibibadminton.com.au",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openContactModal = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      subject: `Inquiry about ${product.name}`,
      message: `I'm interested in purchasing: ${product.name} ($${product.price.toFixed(2)})

`,
    }));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
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
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-b from-pink-100 to-pink-200">
      <div className="px-4 md:px-8 py-8 md:py-16 max-w-7xl mx-auto min-h-full">
        {/* Products Grid - 5 columns */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black text-left font-huglove lg:text-center">
            Featured Services/Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 font-calibri text-lg">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/shop/product/${product.id}`)}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer flex flex-col border border-slate-100"
              >
                {/* Product Image */}
                <div className="relative w-full h-60 md:h-60 overflow-hidden bg-white flex-shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain  border-b border-slate-100"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">Out of Stock</span>
                    </div>
                  )}
                </div>

                {/* Product Info - Name and Price in same row */}
                <div className="p-3 md:p-4 flex-1 flex flex-col">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-calibri text-lg">
                    {product.category}
                  </p>

                  {/* Name and Price in same row */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-sm md:text-base font-semibold text-black line-clamp-2 flex-1 font-calibri text-lg">
                      {product.name}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-base md:text-lg font-bold text-green-600 whitespace-nowrap font-calibri text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through font-calibri text-lg">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Us Button */}
                  <button
                    onClick={(e) => openContactModal(product, e)}
                    disabled={!product.inStock}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold text-xs md:text-sm transition duration-300 mt-auto font-calibri text-lg ${product.inStock
                      ? "bg-rose-500 hover:bg-rose-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                  >
                    <FaEnvelope size={14} />
                    {product.inStock ? "Contact Us" : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mt-12 bg-gradient-to-b from-pink-100 to-pink-200 shadow-xl">
          <h3 className="text-2xl font-bold mb-4 text-black text-center font-calibri text-lg">
            Why Shop with ChibiBadminton !
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h4 className="font-semibold text-black mb-2 font-calibri text-md">Quality Guaranteed</h4>
              <p className="text-sm text-gray-800 font-calibri text-lg">
                All products are carefully selected for quality and performance
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-2 font-calibri text-md">Fast Shipping</h4>
              <p className="text-sm text-gray-800 font-calibri text-lg">
                Quick and reliable delivery to get your gear fast
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-black mb-2 font-calibri text-md">Expert Service</h4>
              <p className="text-sm text-gray-800 font-calibri text-lg">
                Professional stringing and equipment services available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between font-calibri">
              <h2 className="text-2xl font-bold text-black font-huglove text-2xl">Contact Us</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes size={24} className="text-gray-500 font-calibri text-md" />
              </button>
            </div>

            <div className="p-6">
              {selectedProduct && (
                <div className="mb-6 p-4 bg-stone-50 rounded-lg font-calibri text-md">
                  <p className="text-md text-gray-600 mb-1 font-calibri text-md">Product Inquiry:</p>
                  <p className="font-semibold text-black font-calibri text-md">{selectedProduct.name}</p>
                  <p className="text-rose-500 font-bold font-calibri text-md">${selectedProduct.price.toFixed(2)}</p>
                </div>
              )}

              {/* Status Messages */}
              {submitStatus.type && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${submitStatus.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200 font-calibri text-md"
                    : "bg-red-50 text-red-800 border border-red-200 font-calibri text-md"
                    }`}
                >
                  {submitStatus.type === "success" ? (
                    <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                  ) : (
                    <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
                  )}
                  <p className="text-sm font-calibri text-md">{submitStatus.message}</p>
                </div>
              )}

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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-calibri text-md ${errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-rose-500"
                      }`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 font-calibri text-md">{errors.name}</p>
                  )}
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-calibri text-md ${errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                    >
                      <FaPhone className="inline mr-2" size={14} />
                      Phone Number <span className="text-gray-500 font-calibri text-md">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-calibri text-md ${errors.phone
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-rose-500"
                        }`}
                      placeholder="+61 400 000 000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.phone}</p>
                    )}
                  </div>
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
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all font-calibri text-md ${errors.subject
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-rose-500"
                      }`}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.subject}</p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-md font-bold text-gray-700 mb-2 font-calibri"
                  >
                    Message <span className="text-red-500 font-calibri text-md">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none font-calibri text-md ${errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-rose-500"
                      }`}
                    placeholder="Tell us more about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500 font-calibri text-md text-justify">{errors.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={closeModal}
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
                    className={`flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 font-calibri text-md ${isSubmitting
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-lg transform hover:-translate-y-0.5"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
