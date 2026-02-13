import React, { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave } from "react-icons/fa";
import type { CartItem } from "./ShopCheckoutPage";
import type { Product } from "./types";

interface PaymentState {
  products?: Product[];
  items?: CartItem[];
}

const ShopPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as PaymentState | null;
  const legacyProducts: Product[] = state?.products ?? [];
  const items: CartItem[] =
    state?.items ?? legacyProducts.map((p) => ({ product: p, quantity: 1, unitPrice: p.price }));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = "Invalid email";
    if (!formData.phone.trim()) err.phone = "Phone is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Mockup: simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus({
        type: "success",
        message: "Order placed successfully! We'll contact you soon to confirm payment and delivery.",
      });
      setTimeout(() => navigate("/shop"), 5000);
    } catch {
      setSubmitStatus({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !submitStatus.type) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-gray-900 font-calibri mb-4">No products selected</h1>
          <p className="text-gray-600 font-calibri mb-6">Please select products from the shop.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-huglove mb-6 text-center">
          Payment
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4 border-b border-gray-200">
            {items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 font-calibri">{item.product.name}</p>
                  <p className="text-rose-600 font-semibold font-calibri">
                    {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
            <p className="text-lg font-bold text-gray-900 font-calibri pt-2">
              Total: ${totalPrice.toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 font-calibri">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-2" size={14} /> Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"}`}
                placeholder="Full name"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-2" size={14} /> Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                placeholder="Email"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <FaPhone className="inline mr-2" size={14} /> Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                placeholder="Phone"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-2">Payment method</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 border-2 border-rose-500 bg-rose-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaMoneyBillWave className="text-rose-500 flex-shrink-0" size={20} />
                  <span className="font-calibri">Card (Stripe) - ${totalPrice.toFixed(2)}</span>
                </div>
                <span className="text-xs text-gray-500 sm:ml-auto">(Mockup – integration coming soon)</span>
              </div>
            </div>

            {submitStatus.type && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                  }`}
              >
                {submitStatus.type === "success" ? (
                  <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} />
                ) : (
                  <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />
                )}
                <div>
                  <p className="font-medium text-sm">{submitStatus.message}</p>
                  {submitStatus.type === "success" && (
                    <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" aria-hidden />
                      Redirecting you to the shop…
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/shop/checkout", { state: { items } })}
                disabled={submitStatus.type === "success"}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-bold font-calibri transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitStatus.type === "success"}
                className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold font-calibri disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Processing…" : "Place order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopPaymentPage;
