import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaExclamationCircle, FaUser, FaEnvelope, FaPhone, FaCoins, FaMoneyBillWave, FaExchangeAlt } from "react-icons/fa";
import { getCurrentUser } from "../../utils/mockAuth";
import { registerUserForEvents } from "../../utils/registrationService";
import { canUsePointsForBooking, formatPoints } from "../../utils/rewardPoints";
import { usePointsForBooking } from "../../utils/rewardPointsService";
import { clearCart } from "../../utils/cartStorage";
import type { SocialEvent } from "../../types/socialEvent";

const PlayPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const events: SocialEvent[] = (location.state as { events?: SocialEvent[] })?.events ?? [];
  const user = getCurrentUser();

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "points" | "mixed">("stripe");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`.trim() || prev.name,
        email: user.email ?? prev.email,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [user]);

  const totalPrice = events.reduce((sum, e) => sum + Number(e.price ?? 0), 0);
  const userPoints = user?.rewardPoints ?? 0;
  const canPayWithPoints = canUsePointsForBooking(totalPrice, userPoints);

  if (events.length === 0 && !submitStatus.type) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 font-calibri mb-4">No sessions selected</h1>
          <p className="text-gray-600 font-calibri mb-6">Please select sessions from the play page.</p>
          <button
            onClick={() => navigate("/play")}
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            Back to Play Sessions
          </button>
        </div>
      </div>
    );
  }

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
      if (user && (paymentMethod === "points" || paymentMethod === "mixed")) {
        const pts = paymentMethod === "points" ? totalPrice : pointsToUse;
        if (pts > 0) {
          const ok = await usePointsForBooking(user.id, events[0].id, pts);
          if (!ok) {
            setSubmitStatus({ type: "error", message: "Failed to process points. Please try again." });
            setIsSubmitting(false);
            return;
          }
        }
      }

      const result = await registerUserForEvents(events, formData);
      if (!result.success) {
        setSubmitStatus({ type: "error", message: result.message });
        setIsSubmitting(false);
        return;
      }

      setSubmitStatus({
        type: "success",
        message: `Successfully registered for ${events.length} session${events.length !== 1 ? "s" : ""}!`,
      });
      clearCart();
      setTimeout(() => navigate("/profile"), 2000);
    } catch {
      setSubmitStatus({ type: "error", message: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 font-huglove mb-6 text-center">
          Payment
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4 border-b border-gray-200">
            {events.map((e) => (
              <div key={e.id} className="text-gray-700 font-calibri text-lg">
                <p className="font-medium text-gray-900 font-calibri text-lg">{e.title}</p>
                <p className="text-gray-600 font-calibri text-lg">{formatDate(e.date)} - {e.time} </p>
                <p className="text-gray-600 font-calibri text-lg">{e.location}</p>
                {e.price != null && <p className="text-rose-600 font-calibri text-lg">${e.price}</p>}
              </div>
            ))}
            <p className="text-lg text-gray-900 font-calibri">Total: ${Number(totalPrice).toFixed(2)}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 font-calibri">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                <FaUser className="inline mr-2" size={14} /> Full Name <span className="text-red-500">*</span>
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
              <label className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
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
              <label className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
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

            {totalPrice > 0 && user && (
              <div>
                <label className="block font-medium text-gray-700 mb-2 font-calibri text-lg">Payment method</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("stripe"); setPointsToUse(0); }}
                    className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "stripe" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                  >
                    <FaMoneyBillWave className="text-rose-500" size={20} />
                    <span>Card (Stripe) - ${Number(totalPrice).toFixed(2)}</span>
                  </button>
                  {canPayWithPoints && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("points"); setPointsToUse(totalPrice); }}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "points" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                    >
                      <FaCoins className="text-rose-500" size={20} />
                      <span>Points - {formatPoints(totalPrice)} (You have {formatPoints(userPoints)})</span>
                    </button>
                  )}
                  {userPoints > 0 && userPoints < totalPrice && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("mixed"); setPointsToUse(userPoints); }}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "mixed" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                    >
                      <FaExchangeAlt className="text-rose-500" size={20} />
                      <span>Mixed - {formatPoints(userPoints)} pts + ${Number(totalPrice - userPoints).toFixed(2)} card</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {submitStatus.type && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {submitStatus.type === "success" ? <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} /> : <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />}
                <div>
                  <p className="font-medium text-sm font-calibri">{submitStatus.message}</p>
                  {submitStatus.type === "success" && (
                    <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" aria-hidden />
                      Redirecting you to the play…
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/play/checkout")}
                disabled={submitStatus.type === "success"}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-calibri disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitStatus.type === "success"}
                className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-calibri disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing…" : "Complete registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayPaymentPage;
