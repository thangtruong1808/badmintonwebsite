import React from "react";

const EventsLoadingState: React.FC = () => (
  <div className="bg-gradient-to-r from-rose-50 to-rose-100 min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
      <span className="font-calibri text-gray-600">Loading events…</span>
    </div>
  </div>
);

export default EventsLoadingState;
