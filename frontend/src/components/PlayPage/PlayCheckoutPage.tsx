import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../utils/mockAuth";
import type { SocialEvent } from "../../types/socialEvent";

const PlayCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { events?: SocialEvent[]; checkoutState?: { events?: SocialEvent[] } } | null;
  const events: SocialEvent[] = state?.events ?? state?.checkoutState?.events ?? [];
  const user = getCurrentUser();

  const totalPrice = events.reduce((sum, e) => sum + (e.price ?? 0), 0);

  const handleContinueToPayment = () => {
    if (!user) {
      navigate("/signin", { state: { from: "/play/checkout", checkoutState: { events } } });
      return;
    }
    navigate("/play/payment", { state: { events } });
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

            <div className="pt-4 border-t-2 border-gray-200">
              <p className="text-lg font-bold text-gray-900 font-calibri">
                Total: ${totalPrice.toFixed(2)}
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
    </div>
  );
};

export default PlayCheckoutPage;
