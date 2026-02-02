import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SocialEvent } from "../types/socialEvent";
import type { NewsItem } from "./FeaturedNews";
import RegistrationModal from "./PlayPage/RegistrationModal";
import { FaArrowRight } from "react-icons/fa";
import { apiFetch } from "../utils/api";

type FilterType = "All" | "Latest" | "Info" | "Updates" | "Events";

const FeaturedNewsPage: React.FC = () => {
  useEffect(() => {
    document.title = "ChibiBadminton - Featured News";
  }, []);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);
  const [itemsToShow, setItemsToShow] = useState(6);
  const itemsPerLoad = 6;

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

  const filterOptions: FilterType[] = ["All", "Latest", "Info", "Updates", "Events"];

  const filteredNews = news.filter((item) => {
    if (selectedFilter === "All") return true;
    return item.category === selectedFilter;
  });

  const featuredNews = filteredNews.slice(0, 3);
  const listNews = filteredNews.slice(3);
  const displayedNews = listNews.slice(0, itemsToShow);
  const hasMore = listNews.length > itemsToShow;

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + itemsPerLoad);
  };

  useEffect(() => {
    setItemsToShow(6);
  }, [selectedFilter]);

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
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-huglove text-center">
            Featured News
          </h1>
        </div>

        {loading && (
          <div className="text-center py-8 font-calibri text-gray-600">Loading…</div>
        )}
        {/* Featured Banner - 3 Cards */}
        {!loading && featuredNews.length > 0 && (
          <div className="mb-8 md:mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {featuredNews.map((news) => (
                <div
                  key={news.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
                  onClick={() => handleRegisterClick(news)}
                >
                  {/* Image */}
                  <div className="relative w-full h-48 md:h-56 overflow-hidden bg-gray-100">
                    {news.image ? (
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-contain p-3"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-calibri">No image</div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-base md:text-lg mb-2 font-calibri text-gray-900 line-clamp-2">
                      {news.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-calibri mb-3 line-clamp-2">
                      {news.description ?? ""}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 font-calibri">
                      <span>{news.date ?? ""}</span>
                      <Link
                        to={`/featured-news/${news.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        {news.category ?? ""}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-8 md:mb-10 flex flex-wrap gap-2 md:gap-3 border-b border-gray-200 pb-4">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 text-sm md:text-base font-medium transition-colors duration-200 font-calibri border-b-2 ${selectedFilter === filter
                ? "text-rose-500 border-rose-500"
                : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* News List - Vertical Layout */}
        <div className="space-y-4 md:space-y-6">
          {displayedNews.map((news) => (
            <div
              key={news.id}
              className="flex flex-col md:flex-row gap-4 md:gap-6 pb-4 md:pb-6 border-b border-gray-200 last:border-b-0 hover:bg-white/50 transition-colors duration-200 rounded-lg p-2 md:p-3 -m-2 md:-m-3 bg-white/30"
            >
              {/* Image Section - Smaller, square-like */}
              <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {news.image ? (
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-gray-400 font-calibri">No image</div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1 flex flex-col min-w-0">
                <h3 className="font-bold text-lg md:text-xl mb-2 font-calibri text-gray-900 hover:text-rose-500 transition-colors cursor-pointer">
                  {news.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base font-calibri mb-3 line-clamp-2">
                  {news.description ?? ""}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-calibri mb-3">
                  {news.date && <span>{news.date}</span>}
                </div>
                <div className="mt-auto flex items-center gap-3">
                  <button
                    onClick={() => handleRegisterClick(news)}
                    className="text-rose-500 hover:text-rose-600 font-medium text-sm md:text-base font-calibri transition-colors"
                  >
                    Register Now
                  </button>
                  <span className="text-gray-300">|</span>
                  <Link
                    to={`/featured-news/${news.id}`}
                    className="text-gray-600 hover:text-gray-900 font-medium text-sm md:text-base font-calibri transition-colors"
                  >
                    {news.category ?? ""}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8 md:mt-12">
            <button
              onClick={handleLoadMore}
              className="text-rose-500 hover:text-rose-600 font-medium text-base md:text-lg font-calibri transition-colors font-calibri bg-rose-500 text-white px-4 py-2 rounded-full flex items-center justify-center gap-2"
            >
              <span className="font-calibri text-lg font-bold">Load More</span> <FaArrowRight className="text-lg" />
            </button>
          </div>
        )}
        {/* Show message if only banner items exist */}
        {featuredNews.length > 0 && listNews.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm font-calibri">
              Showing all available news items above.
            </p>
          </div>
        )}
      </div>

      {/* Registration Modal for Wednesday Playtime */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        events={registrationEvents}
        isMultiEvent={registrationEvents.length > 1}
        onSuccess={(_updatedEvents) => {
          // No-op for now; PlayPage handles updates in detail
        }}
      />
    </div>
  );
};

export default FeaturedNewsPage;
