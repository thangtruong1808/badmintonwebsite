import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

const PlayPaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/profile");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const getMessage = () => {
    switch (type) {
      case "waitlist":
        return "You have been added to the waitlist. We will notify you when a spot becomes available.";
      case "addGuests":
        return "Your friends have been successfully added to your registration.";
      default:
        return "Your registration has been confirmed. Check your email for details.";
    }
  };

  const getTitle = () => {
    switch (type) {
      case "waitlist":
        return "Waitlist Joined";
      case "addGuests":
        return "Friends Added";
      default:
        return "Payment Successful";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-calibri mb-4">
          {getTitle()}
        </h1>

        <p className="text-gray-600 font-calibri mb-6">{getMessage()}</p>

        {sessionId && (
          <p className="text-xs text-gray-400 font-calibri mb-6 break-all">
            Session: {sessionId}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-gray-500 font-calibri mb-6">
          <FaSpinner className="animate-spin" size={16} />
          <span>Redirecting to your profile in {countdown}s...</span>
        </div>

        <button
          onClick={() => navigate("/profile")}
          className="w-full bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
        >
          Go to Profile Now
        </button>
      </div>
    </div>
  );
};

export default PlayPaymentSuccessPage;
