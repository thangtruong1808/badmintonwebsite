import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaSpinner, FaShoppingBag } from "react-icons/fa";
import { clearShopCart } from "../../utils/shopCartStorage";

const ShopPaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    clearShopCart();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/shop");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-calibri mb-4">
          Order Confirmed
        </h1>

        <p className="text-gray-600 font-calibri mb-6">
          Thank you for your purchase! Your order has been successfully placed.
          We will send you an email confirmation shortly with your order details.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 font-calibri mb-6 break-all">
            Session: {sessionId}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 text-gray-500 font-calibri mb-6">
          <FaSpinner className="animate-spin" size={16} />
          <span>Redirecting to shop in {countdown}s...</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/shop")}
            className="flex-1 bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri inline-flex items-center justify-center gap-2"
          >
            <FaShoppingBag size={16} />
            Continue Shopping
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

export default ShopPaymentSuccessPage;
