import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";
import type { SocialEvent } from "../types/socialEvent";
import { apiFetch } from "../utils/api";

const BATTLE_ROYALE_REGISTRATION_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatDate(dateStr: string): string {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return dateStr;
  const [, y, mo, d] = m;
  const month = MONTHS[parseInt(mo, 10) - 1] ?? dateStr;
  const day = parseInt(d, 10);
  return `${month} ${day}, ${y}`;
}

type TabKey = "all" | "upcoming" | "completed";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
];

const FeaturedNewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "ChibiBadminton - Battle Royale Events";
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/events?category=tournament", { skipAuth: true });
        if (res.ok) {
          const list = await res.json();
          setEvents(Array.isArray(list) ? list : []);
        } else {
          setEvents([]);
        }
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingEvents = events.filter((e) => e.status === "available" || e.status === "full");
  const completedEvents = events.filter((e) => e.status === "completed");
  const allEvents = [...upcomingEvents, ...completedEvents];

  const filteredEvents =
    activeTab === "all"
      ? allEvents
      : activeTab === "upcoming"
        ? upcomingEvents
        : completedEvents;

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="text-center mb-10 p-12 rounded-lg shadow-xl bg-gradient-to-t from-rose-50 to-rose-100 mt-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 font-huglove text-center">
            Battle Royale Events
          </h1>
          <p className="text-center text-gray-600 font-calibri text-sm sm:text-base">
            All Battle Royale tournaments – upcoming and past
          </p>
        </div>

        {/* Filter tabs - Genshin-style */}
        <nav
          className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-gray-200 pb-2"
          aria-label="Filter events"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm sm:text-base font-calibri font-medium rounded-t transition-colors ${activeTab === tab.key
                ? "text-rose-600 border-b-2 border-rose-600 -mb-[9px] bg-white/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/30"
                }`}
              aria-pressed={activeTab === tab.key}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {loading && (
          <div className="min-h-[40vh] flex items-center justify-center">
            <p className="text-gray-600 font-calibri">Loading…</p>
          </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-12 sm:py-16 font-calibri text-gray-600">
            {activeTab === "all"
              ? "No Battle Royale events at the moment. Check back soon!"
              : activeTab === "upcoming"
                ? "No upcoming Battle Royale events."
                : "No completed Battle Royale events yet."}
          </div>
        )}

        {!loading && filteredEvents.length > 0 && (
          <ul className="space-y-4 sm:space-y-6" role="list">
            {filteredEvents.map((event) => {
              const isUpcoming = event.status === "available" || event.status === "full";
              return (
                <li key={event.id}>
                  <article className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <Link
                      to={`/featured-news/${event.id}`}
                      className="group flex flex-col sm:flex-row sm:min-h-0"
                    >
                      {/* Image - left on desktop, top on mobile */}
                      <div className="relative w-full sm:w-48 lg:w-56 flex-shrink-0 aspect-video sm:aspect-[4/3] overflow-hidden">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-calibri text-sm">
                            No image
                          </div>
                        )}
                        <span
                          className={`absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded font-calibri ${isUpcoming ? "bg-rose-600" : "bg-gray-700"
                            }`}
                        >
                          {isUpcoming ? "Upcoming" : "Completed"}
                        </span>
                      </div>

                      {/* Content - right on desktop */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col sm:justify-between min-w-0">
                        <div>
                          <h2 className="font-bold text-lg sm:text-xl mb-1 font-calibri text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors">
                            {event.title}
                          </h2>
                          <p className="text-gray-600 text-sm font-calibri line-clamp-2 mb-3">
                            {event.description ?? ""}
                          </p>
                          <p className="text-gray-500 text-sm font-calibri">
                            {formatDate(event.date)}
                          </p>
                        </div>
                        {isUpcoming && (
                          <div className="mt-3 sm:mt-4" onClick={(e) => e.preventDefault()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.open(BATTLE_ROYALE_REGISTRATION_LINK, "_blank");
                              }}
                              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 px-4 rounded-lg text-sm font-calibri transition-colors"
                            >
                              <FaPaperPlane size={14} />
                              Register Now
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeaturedNewsPage;
