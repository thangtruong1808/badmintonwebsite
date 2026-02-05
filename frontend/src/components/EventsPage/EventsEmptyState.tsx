import React from "react";
import { FaCalendarAlt } from "react-icons/fa";

const EventsEmptyState: React.FC = () => (
  <div className="px-4 md:px-8 py-12 md:py-16">
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-20">
        <div className="bg-gradient-to-r from-rose-50 to-rose-100 backdrop-blur-sm rounded-2xl shadow-xl p-12 md:p-16 max-w-2xl mx-auto">
          <FaCalendarAlt className="mx-auto text-gray-400 mb-6" size={64} />
          <h3 className="text-3xl font-bold mb-3 text-gray-800">
            No Battle Royale Events Yet
          </h3>
          <p className="text-gray-600 text-lg">
            Check back soon for upcoming Battle Royale tournaments!
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default EventsEmptyState;
