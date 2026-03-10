import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaCalendarAlt } from "react-icons/fa";

const NotFoundPage: React.FC = () => {
  useEffect(() => {
    document.title = "Chibi | Page Not Found";
    return () => { document.title = "Chibi | Home"; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-rose-500 font-calibri">404</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-calibri mb-4">
          Page Not Found
        </h1>

        <p className="text-gray-600 font-calibri mb-6">
          Oops! The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-rose-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            <FaHome size={18} />
            Return to Home
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-calibri"
          >
            <FaCalendarAlt size={18} />
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
