import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserPlus, FaSignInAlt, FaTimes } from "react-icons/fa";
import { getCurrentUser } from "../../utils/mockAuth";
import type { SocialEvent } from "../../types/socialEvent";

const PlayCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { events?: SocialEvent[]; checkoutState?: { events?: SocialEvent[] } } | null;
  const events: SocialEvent[] = state?.events ?? state?.checkoutState?.events ?? [];
  const user = getCurrentUser();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const totalPrice = events.reduce((sum, e) => sum + Number(e.price ?? 0), 0);

  const handleContinueToPayment = () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    navigate("/play/payment", { state: { events } });
  };

  const handleGoToSignIn = () => {
    setShowAuthDialog(false);
    navigate("/signin", { state: { from: "/play/checkout", checkoutState: { events } } });
  };

  const handleGoToRegister = () => {
    setShowAuthDialog(false);
    navigate("/register", { state: { from: "/play/checkout", checkoutState: { events } } });
  };

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 font-calibri mb-4">
            No sessions selected
          </h1>
          <p className="text-gray-600 font-calibri mb-6">
            Please go back and select one or more play sessions to register.
          </p>
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

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-huglove mb-6 text-center">
          Review your selection
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {events.map((e) => (
              <div
                key={e.id}
                className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <p className="font-bold text-gray-900 font-calibri">{e.title}</p>
                <p className="text-sm text-gray-600 font-calibri">
                  {formatDate(e.date)} • {e.time}
                </p>
                <p className="text-sm text-gray-600 font-calibri">{e.location}</p>
                <p className="text-sm text-gray-700 font-calibri">
                  {e.maxCapacity - e.currentAttendees} spots available / {e.maxCapacity} total
                </p>
                {e.price != null && (
                  <p className="text-rose-600 font-semibold font-calibri">${e.price}</p>
                )}
              </div>
            ))}

            <div className="pt-2 ">
              <p className="text-lg font-bold text-gray-900 font-calibri ">
                Total: <span className="text-rose-600">${Number(totalPrice).toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/play")}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold font-calibri transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinueToPayment}
              className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold font-calibri transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>

        {!user && (
          <p className="mt-4 text-center text-sm text-gray-600 font-calibri">
            You will need to sign in to complete payment.
          </p>
        )}
      </div>

      {showAuthDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-dialog-title"
          aria-describedby="auth-dialog-desc"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 id="auth-dialog-title" className="text-xl md:text-2xl font-bold text-gray-900 font-calibri">
                  Sign in to continue
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAuthDialog(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  aria-label="Close"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <p id="auth-dialog-desc" className="text-gray-600 font-calibri text-sm md:text-base leading-relaxed mb-6">
                To complete your play session booking, please sign in to your account or create a new one. We’ll bring you right back here after you’re done.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleGoToSignIn}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold font-calibri transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  <FaSignInAlt size={18} />
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleGoToRegister}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-2 border-rose-500 text-rose-600 rounded-lg hover:bg-rose-50 font-bold font-calibri transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                >
                  <FaUserPlus size={18} />
                  Create account
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthDialog(false)}
                className="w-full mt-3 py-2.5 text-gray-600 hover:text-gray-800 font-calibri text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayCheckoutPage;
