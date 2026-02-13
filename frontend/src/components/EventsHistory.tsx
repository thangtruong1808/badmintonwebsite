import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import type { EventDisplay } from "../types/event";

interface EventsHistoryProps {
  completedEvents: EventDisplay[];
  onViewDetails?: (event: EventDisplay) => void;
}

const EventsHistory: React.FC<EventsHistoryProps> = ({ completedEvents, onViewDetails }) => {
  return (
    <>
      <div className="bg-gradient-to-r from-rose-50 to-rose-100">
        {/* Events History Section */}
        <section className="pt-16 pb-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-block bg-gray-700 text-white px-4 py-2 rounded-full text-md font-semibold mb-4 font-calibri">
                PAST EVENTS
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black drop-shadow-lg">
                Battle Royale History
              </h2>
              <p className="text-black text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md font-calibri">
                Take a look back at our amazing past Battle Royale tournaments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {completedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <img
                      src={event.imageUrl ?? ""}
                      alt={event.title}
                      className="w-full h-full object-fit"
                    />
                    <div className="absolute top-4 left-4 bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg font-calibri">
                      Completed
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6 bg-white/95">
                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 line-clamp-2 font-calibri">
                      {event.title}
                    </h3>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-gray-700">
                        <FaCalendarAlt
                          className="mr-3 text-green-600 flex-shrink-0"
                          size={16}
                        />
                        <span className="text-sm font-medium font-calibri">{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaClock
                          className="mr-3 text-green-600 flex-shrink-0"
                          size={16}
                        />
                        <span className="text-sm font-medium font-calibri">{event.time}</span>
                      </div>
                      <div className="flex items-start text-gray-700">
                        <FaMapMarkerAlt
                          className="mr-3 mt-1 text-green-600 flex-shrink-0"
                          size={16}
                        />
                        <span className="text-sm font-medium line-clamp-2 font-calibri">
                          {event.location}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaUsers
                          className="mr-3 text-green-600 flex-shrink-0"
                          size={16}
                        />
                        <span className="text-sm font-medium font-calibri">
                          {(event.currentAttendees ?? event.attendees ?? 0)} Attendees
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed font-calibri">
                      {event.description}
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => onViewDetails?.(event)}
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-calibri focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        aria-label={`View details for ${event.title}`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default EventsHistory;
