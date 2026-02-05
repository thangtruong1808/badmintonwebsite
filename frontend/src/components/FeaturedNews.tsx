import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import RegistrationModal from "./PlayPage/RegistrationModal";
import type { SocialEvent } from "../types/socialEvent";
import { apiFetch } from "../utils/api";

const BATTLE_ROYALE_REGISTRATION_LINK =
  "https://docs.google.com/forms/d/e/1FAIpQLSc-JLX4pyrKoz8-G0CUKdFDrorKanOHJ_d1XmRB7TZoYS1ozQ/viewform";

export interface PlaySlot {
  id: number;
  dayOfWeek: string;
  time: string;
  location: string;
  title: string;
  description: string | null;
  price: number;
  maxCapacity: number;
  imageUrl?: string | null;
  isActive: boolean;
}

export type FeaturedItem =
  | { type: "event"; data: SocialEvent }
  | { type: "playSlot"; data: PlaySlot };

const badgeColor = (badge: string) => {
  switch (badge) {
    case "WEDNESDAY":
      return "bg-green-500";
    case "FRIDAY":
      return "bg-blue-500";
    case "UPCOMING":
      return "bg-rose-600";
    default:
      return "bg-rose-500";
  }
};

const FeaturedNews: React.FC = () => {
  const [battleRoyaleEvents, setBattleRoyaleEvents] = useState<SocialEvent[]>([]);
  const [playSlots, setPlaySlots] = useState<PlaySlot[]>([]);
  const [socialEvents, setSocialEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationEvents, setRegistrationEvents] = useState<SocialEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [battleRoyaleRes, playSlotsRes, eventsRes] = await Promise.all([
          apiFetch("/api/events?category=tournament", { skipAuth: true }),
          apiFetch("/api/play-slots?active=true", { skipAuth: true }),
          apiFetch("/api/events", { skipAuth: true }),
        ]);
        if (battleRoyaleRes.ok) {
          const list = await battleRoyaleRes.json();
          setBattleRoyaleEvents(Array.isArray(list) ? list : []);
        }
        if (playSlotsRes.ok) {
          const list = await playSlotsRes.json();
          setPlaySlots(Array.isArray(list) ? list : []);
        }
        if (eventsRes.ok) {
          const list = await eventsRes.json();
          setSocialEvents(Array.isArray(list) ? list : []);
        }
      } catch {
        setBattleRoyaleEvents([]);
        setPlaySlots([]);
        setSocialEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingBattleRoyale = battleRoyaleEvents.filter(
    (e) => e.status === "available" || e.status === "full"
  );
  const wednesdaySlot = playSlots.find((s) => s.dayOfWeek === "Wednesday");
  const fridaySlot = playSlots.find((s) => s.dayOfWeek === "Friday");

  const featuredItems: FeaturedItem[] = [];
  if (upcomingBattleRoyale[0]) featuredItems.push({ type: "event", data: upcomingBattleRoyale[0] });
  if (wednesdaySlot) featuredItems.push({ type: "playSlot", data: wednesdaySlot });
  if (fridaySlot) featuredItems.push({ type: "playSlot", data: fridaySlot });

  const handleRegisterClick = (item: FeaturedItem) => {
    if (item.type === "event") {
      window.open(BATTLE_ROYALE_REGISTRATION_LINK, "_blank");
      return;
    }
    const slot = item.data;
    const matchingEvent = socialEvents.find(
      (e) => e.dayOfWeek === slot.dayOfWeek || e.title?.toLowerCase().includes(slot.dayOfWeek.toLowerCase())
    );
    if (matchingEvent) {
      setRegistrationEvents([matchingEvent]);
      setIsRegistrationModalOpen(true);
    } else {
      window.location.href = "/play";
    }
  };
  return (
    <div className="py-16 bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 font-huglove">
          Featured News
        </h2>
        {loading && (
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 min-h-[40vh] flex items-center justify-center">
            <div className="text-center py-8 font-calibri text-gray-600">Loading…</div>
          </div>
        )}
        {!loading && featuredItems.length === 0 && (
          <div className="text-center py-12 font-calibri text-gray-600">
            No featured content at the moment. Check back soon!
          </div>
        )}
        {!loading && featuredItems.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => {
              const isEvent = item.type === "event";
              const isPlaySlot = item.type === "playSlot";
              const title = item.data.title;
              const image = isEvent ? (item.data as SocialEvent).imageUrl : (item.data as PlaySlot).imageUrl ?? undefined;
              const description = item.data.description ?? "";
              const date = isEvent ? (item.data as SocialEvent).date : (isPlaySlot ? `Every ${(item.data as PlaySlot).dayOfWeek}` : null);
              const time = item.data.time ?? null;
              const location = item.data.location ?? null;
              const badge = isEvent ? "UPCOMING" : (item.data as PlaySlot).dayOfWeek.toUpperCase();
              const key = isEvent ? `event-${(item.data as SocialEvent).id}` : `slot-${(item.data as PlaySlot).id}`;

              return (
                <div
                  key={key}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
                >
                  <div className="relative h-64 overflow-hidden bg-white flex items-center justify-center">
                    {image ? (
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-contain pt-4"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-calibri">
                        No image
                      </div>
                    )}
                    <span
                      className={`absolute top-2 right-2 text-white text-md font-bold px-2 py-1 rounded font-calibri ${badgeColor(badge)}`}
                    >
                      {isEvent ? "UPCOMING" : `${(item.data as PlaySlot).dayOfWeek} PLAY`}
                    </span>
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-3xl mb-2 font-calibri min-h-[3.5rem]">{title}</h3>
                    <p className="text-gray-800 text-lg font-calibri text-justify mb-2 line-clamp-3">{description}</p>
                    <div className="space-y-1 mb-4">
                      {date && <p className="text-gray-800 text-lg font-calibri">Date: {date}</p>}
                      {time && <p className="text-gray-800 text-lg font-calibri">Time: {time}</p>}
                      {location && <p className="text-gray-800 text-lg font-calibri">Location: {location}</p>}
                    </div>
                  </div>
                  <div className="p-4 pt-0 mt-auto">
                    <button
                      onClick={() => handleRegisterClick(item)}
                      className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 font-calibri"
                    >
                      <div className="flex items-center justify-center gap-4">
                        <FaPaperPlane size={18} />
                        <span className="font-calibri text-md font-bold">Register Now</span>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="text-center mt-8">
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
