import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaEnvelope, FaCheckCircle, FaSpinner } from "react-icons/fa";
import ChibiLogo from "../assets/ChibiLogo.png";
import { apiFetch } from "../utils/api";

const NewsletterPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const hasSubscribedInSession = useRef(false);

  useEffect(() => {
    if (hasSubscribedInSession.current) return;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const res = await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
        skipAuth: true,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (res.status === 201 || data.alreadySubscribed)) {
        hasSubscribedInSession.current = true;
        setSubmitStatus({
          type: "success",
          message: data.message || "Thank you for subscribing!",
        });
        setTimeout(() => {
          setIsVisible(false);
        }, 10000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.message || "Something went wrong. Please try again later.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-w-lg w-full">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 text-rose-400 hover:text-roé-600 transition-colors p-1 rounded-full hover:bg-rose-100"
          aria-label="Close newsletter popup"
        >
          <FaTimes size={20} />
        </button>

        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="w-full sm:w-1/3 bg-gradient-to-b from-pink-100 to-pink-200 p-4 flex items-center justify-center">
            <img
              src={ChibiLogo}
              alt="ChibiBadminton Logo"
              className="w-full h-auto max-w-32 object-contain"
            />
          </div>

          {/* Information Section */}
          <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-900 font-calibri text-lg xl:text-2xl mb-2 font-huglove">
                Stay Updated!
              </h3>
              <p className="text-gray-700 mb-4 font-calibri text-sm font-medium">
                Subscribe to our newsletter and never miss out on events, tournaments, and special offers!
              </p>
            </div>

            {/* Form */}
            {submitStatus.type === "success" ? (
              <div className="flex items-center gap-2 text-green-600 font-calibri">
                <FaCheckCircle size={20} />
                <span className="text-sm font-medium">{submitStatus.message}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-calibri"
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-calibri text-base xl:text-lg py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Subscribing…</span></> : "Subscribe"}
                  </button>
                </div>
                {submitStatus.type === "error" && (
                  <p className="text-xs text-red-600 font-calibri">{submitStatus.message}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
