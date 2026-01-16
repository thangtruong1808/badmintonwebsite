import React from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import type { Event } from "../data/eventData";

interface UpcomingEventsProps {
  upcomingEvents: Event[];
  openRegistrationModal: (event: Event) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  upcomingEvents,
  openRegistrationModal,
}) => {
  return (
    <>
      <div className="bg-gradient-to-b from-pink-100 to-pink-300">
        {upcomingEvents.length > 0 && (
          <section className="pt-8 pb-0">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  UPCOMING
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black drop-shadow-lg">
                  Upcoming Events
                </h2>
                <p className="text-black text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
                  Don't miss out on these exciting upcoming events!
                </p>
              </div>
              <div className="w-full space-y-8">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-green-500/50 w-full"
                  >
                    <div className="flex flex-col md:flex-row w-full">
                      <div className="relative w-full md:w-1/2 h-64 md:h-auto md:min-h-[400px] overflow-hidden bg-white">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                          Upcoming
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between bg-white/95">
                        <div>
                          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 font-calibri">
                            {event.title}
                          </h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-700">
                              <FaCalendarAlt
                                className="mr-3 text-green-600"
                                size={20}
                              />
                              <span className="text-base font-medium font-calibri">
                                {event.date}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FaClock
                                className="mr-3 text-green-600"
                                size={20}
                              />
                              <span className="text-base font-medium font-calibri">
                                {event.time}
                              </span>
                            </div>
                            <div className="flex items-start text-gray-700">
                              <FaMapMarkerAlt
                                className="mr-3 mt-1 text-green-600 flex-shrink-0"
                                size={20}
                              />
                              <span className="text-base font-medium font-calibri">
                                {event.location}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line font-calibri">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => openRegistrationModal(event)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                          >
                            Register Now
                          </button>
                          <button className="flex-1 bg-white hover:bg-gray-50 text-green-600 border-2 border-green-600 font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg hover:shadow-lg font-calibri">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default UpcomingEvents;
