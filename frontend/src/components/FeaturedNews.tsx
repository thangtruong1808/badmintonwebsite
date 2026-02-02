import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import RegistrationModal from "./PlayPage/RegistrationModal";
import type { SocialEvent } from "../types/socialEvent";
import { apiFetch } from "../utils/api";

export interface NewsItem {
  id: number;
  image: string | null;
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  description: string | null;
  badge: string;
  category: string | null;
  link: string | null;
}

const badgeColor = (badge: string) => {
  switch (badge) {
    case "UPCOMING":
      return "bg-green-500";
    case "REGULAR":
      return "bg-yellow-500";
    case "OPEN":
      return "bg-red-500";
    default:
      return "bg-rose-500";
  }
};


const FeaturedNews: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [newsRes, eventsRes] = await Promise.all([
          apiFetch("/api/news", { skipAuth: true }),
          apiFetch("/api/events", { skipAuth: true }),
        ]);
        if (newsRes.ok) {
          const list = await newsRes.json();
          setNews(Array.isArray(list) ? list : []);
        }
        if (eventsRes.ok) {
          const list = await eventsRes.json();
          setEvents(Array.isArray(list) ? list : []);
        }
      } catch {
        setNews([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const featured = news.slice(0, 3);

  const handleRegisterClick = (newsItem: NewsItem) => {
    if (newsItem.title === "Wednesday Social Playtime" || newsItem.title?.toLowerCase().includes("wednesday")) {
      const wednesdayEvent = events.find(
        (e) => e.dayOfWeek === "Wednesday" || e.title?.toLowerCase().includes("wednesday")
      );
      if (wednesdayEvent) {
        setRegistrationEvents([wednesdayEvent]);
        setIsRegistrationModalOpen(true);
        return;
      }
    }
    if (newsItem.link) {
      window.open(newsItem.link, "_blank");
    }
  };
  return (
    <div className="py-16 bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-huglove">
          Featured News
        </h2>
        {loading && (
          <div className="text-center py-8 font-calibri text-gray-600">Loading…</div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featured.map((newsItem) => (
            <div
              key={newsItem.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center">
                {newsItem.image ? (
                  <img
                    src={newsItem.image}
                    alt={newsItem.title}
                    className="w-full h-full object-contain pt-4"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-calibri">
                    No image
                  </div>
                )}
                <span
                  className={`absolute top-2 right-2 text-white text-md font-bold px-2 py-1 rounded font-calibri ${badgeColor(
                    newsItem.badge
                  )}`}
                >
                  {newsItem.badge}
                </span>
              </div>
              <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-3xl mb-2 font-calibri min-h-[3.5rem]">{newsItem.title}</h3>
                <p className="text-gray-800 text-lg font-calibri text-justify mb-2">{newsItem.description ?? ""}</p>
                <div className="space-y-1 mb-4">
                  {newsItem.date && <p className="text-gray-800 text-lg font-calibri">Date: {newsItem.date}</p>}
                  {newsItem.time && <p className="text-gray-800 text-lg font-calibri">Time: {newsItem.time}</p>}
                  {newsItem.location && <p className="text-gray-800 text-lg font-calibri">Location: {newsItem.location}</p>}
                </div>
              </div>
              <div className="p-4 pt-0 mt-auto">
                <button
                  onClick={() => handleRegisterClick(newsItem)}
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                >
                  <div className="flex items-center justify-center gap-4">
                    <FaPaperPlane size={18} />
                    <span className="font-calibri text-md font-bold">Register Now</span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 ">
          <Link
            to="/featured-news"
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-full hover:bg-rose-600 transition-colors font-calibri"
          >
            View More
          </Link>
        </div>
      </div>
      {/* Registration Modal for Wednesday Playtime */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        events={registrationEvents}
        isMultiEvent={registrationEvents.length > 1}
        onSuccess={(_updatedEvents) => {
          // No-op for now on the homepage; PlayPage handles updates in detail
        }}
      />
    </div>
  );
};

export default FeaturedNews;
