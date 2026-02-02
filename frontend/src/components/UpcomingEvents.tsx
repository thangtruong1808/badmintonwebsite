import React from "react";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import type { EventDisplay } from "../types/event";
import { FaPaperPlane } from "react-icons/fa";

interface UpcomingEventsProps {
  upcomingEvents: EventDisplay[];
  // openRegistrationModal: (event: Event) => void;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({
  upcomingEvents,
  // openRegistrationModal,
}) => {
  return (
    <>
      <div className="bg-gradient-to-r from-rose-50 to-rose-100">
        {upcomingEvents.length > 0 && (
          <section className="pt-8 pb-0">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-md font-semibold mb-4 font-calibri">
                  UPCOMING
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-black drop-shadow-lg">
                  Upcoming Events
                </h2>
                <p className="text-black text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md font-calibri">
                  Don't miss out on these exciting upcoming events!
                </p>
              </div>
              <div className="w-full space-y-8">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 w-full"
                  >
                    <div className="flex flex-col lg:flex-row w-full">
                      <div className="relative w-full lg:w-1/2 h-64 lg:h-auto lg:min-h-[400px] overflow-hidden bg-white">
                        <img
                          src={event.imageUrl ?? ""}
                          alt={event.title}
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-4 left-4 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                          Upcoming
                        </div>
                      </div>
                      {/* Event Details */}
                      <div className="w-full lg:w-1/2 p-8 lg:p-10 flex flex-col justify-between bg-stone-50">
                        <div>
                          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 font-calibri">
                            {event.title}
                          </h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center text-gray-700">
                              <FaCalendarAlt
                                className="mr-3 text-rose-500"
                                size={20}
                              />
                              <span className="text-md font-medium font-calibri">
                                {event.date}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <FaClock
                                className="mr-3 text-rose-500"
                                size={20}
                              />
                              <span className="text-md font-medium font-calibri">
                                {event.time}
                              </span>
                            </div>
                            <div className="flex items-start text-gray-700">
                              <FaMapMarkerAlt
                                className="mr-3 mt-1 text-rose-500 flex-shrink-0"
                                size={20}
                              />
                              <span className="text-md font-medium font-calibri">
                                {event.location}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-gray-700 text-md leading-relaxed whitespace-pre-line font-calibri text-justify">
                              {event.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                          <button
                            // onClick={() => openRegistrationModal(event)}
                            onClick={() =>
                              window.open(
                                "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform",
                                "_blank"
                              )
                            }

                            className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                          >
                            <div className="flex items-center justify-center gap-4">
                              <FaPaperPlane size={18} />
                              <span className="font-calibri text-md font-bold">Register Now</span>
                            </div>
                          </button>
                          <button className="flex-1 bg-white hover:bg-gray-50 text-rose-500 border-2 border-rose-500 font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg hover:shadow-lg font-calibri">
                            <div className="flex items-center justify-center gap-4">
                              <FaInfoCircle size={18} />
                              <span className="font-calibri text-md font-bold">Learn More</span>
                            </div>
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
