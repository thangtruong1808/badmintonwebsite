import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const PlayPaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <FaTimes className="text-gray-500" size={32} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-calibri mb-4">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 font-calibri mb-6">
          Your payment was not completed. No charges have been made to your account.
        </p>

        <p className="text-gray-500 font-calibri text-sm mb-6">
          If you experienced any issues or have questions, please contact our support team.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/play")}
            className="flex-1 bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            Back to Play Sessions
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-calibri"
          >
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayPaymentCancelPage;
