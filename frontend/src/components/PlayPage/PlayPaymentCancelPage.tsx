import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";

const PlayPaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");
  
  const isPaymentFailed = reason === "failed";

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isPaymentFailed ? "bg-red-100" : "bg-gray-100"}`}>
            {isPaymentFailed ? (
              <FaExclamationTriangle className="text-red-500" size={32} />
            ) : (
              <FaTimes className="text-gray-500" size={32} />
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-calibri mb-4">
          {isPaymentFailed ? "Payment Failed" : "Payment Cancelled"}
        </h1>

        {isPaymentFailed ? (
          <>
            <p className="text-gray-600 font-calibri mb-4">
              Unfortunately, your payment could not be processed. This may be due to insufficient funds, 
              an expired card, or other issues with your payment method.
            </p>
            <p className="text-gray-500 font-calibri text-sm mb-6">
              Please check your payment details and try again. If you continue to experience issues, 
              please contact our support team and we'll be happy to help.
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 font-calibri mb-6">
              Your payment was not completed. No charges have been made to your account.
            </p>
            <p className="text-gray-500 font-calibri text-sm mb-6">
              If you experienced any issues or have questions, please contact our support team.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/play")}
            className="flex-1 bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            {isPaymentFailed ? "Try Again" : "Back to Play Sessions"}
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-calibri"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayPaymentCancelPage;
