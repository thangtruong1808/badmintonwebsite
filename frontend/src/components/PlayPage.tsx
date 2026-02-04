import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PlayCalendar from "./PlayPage/PlayCalendar";
import SessionDetailModal from "./PlayPage/SessionDetailModal";
import { setCartItems, getCartItems, clearCart } from "../utils/cartStorage";
import type { SocialEvent } from "../types/socialEvent";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<SocialEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>(() => getCartItems());
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);

  useEffect(() => {
    document.title = "ChibiBadminton - Play Sessions";
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const from = new Date();
      const to = new Date();
      to.setMonth(to.getMonth() + 3);
      const fromStr = from.toISOString().slice(0, 10);
      const toStr = to.toISOString().slice(0, 10);
      const res = await fetch(
        `${API_BASE}/api/events?from=${fromStr}&to=${toStr}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const list = await res.json();
        setAllEvents(Array.isArray(list) ? list : []);
      } else {
        setAllEvents([]);
      }
    } catch {
      setAllEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvents = allEvents.filter((e) => selectedEventIds.includes(e.id));

  const handleSelectEvent = (eventId: number) => {
    setSelectedEventIds((prev) => {
      const newIds = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      setCartItems(newIds);
      return newIds;
    });
  };

  const handleViewSession = (event: SocialEvent) => {
    setSelectedEvent(event);
  };

  const handleProceedToCheckout = () => {
    if (selectedEvents.length === 0) return;
    navigate("/play/checkout", { state: { events: selectedEvents } });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-huglove">
            Play Sessions
          </h1>
          <p className="text-gray-600 text-base md:text-lg lg:text-xl max-w-3xl mx-auto font-calibri">
            Join our social badminton sessions! We currently host sessions on Wednesdays and Fridays.
            You are welcome to register for one or multiple sessions in advance.
          </p>
        </div>

        {/* Cart bar */}
        {selectedEventIds.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl shadow-md p-4">
            <span className="font-calibri text-gray-700">
              {selectedEventIds.length} session{selectedEventIds.length !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleProceedToCheckout}
                className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
              >
                Proceed to checkout
              </button>
              <button
                onClick={() => {
                  setSelectedEventIds([]);
                  clearCart();
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-calibri"
              >
                Clear selection
              </button>
            </div>
          </div>
        )}

        {eventsLoading && (
          <div className="text-center py-12 font-calibri text-gray-600">
            Loading sessions…
          </div>
        )}

        {!eventsLoading && (
          <>
            <PlayCalendar
              events={allEvents}
              selectedEventIds={selectedEventIds}
              onSelectEvent={handleSelectEvent}
              onViewSession={handleViewSession}
            />

            {/* Sessions list with View registered players links */}
            {/* {allEvents.filter((e) => e.status === "available" || e.status === "full").length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-4 md:p-6 font-calibri">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming sessions</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {allEvents
                    .filter((e) => e.status === "available" || e.status === "full")
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 12)
                    .map((e) => (
                      <div
                        key={e.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-rose-200 transition-colors"
                      >
                        <p className="font-semibold text-gray-900">{e.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} • {e.time}
                        </p>
                        <p className="text-sm text-gray-600">{e.location}</p>
                        <p className="text-sm text-gray-700 mt-1">
                          {e.maxCapacity - e.currentAttendees} / {e.maxCapacity} spots
                        </p>
                        <a
                          href={`/play/session/${e.id}/registrations`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-2 text-rose-600 hover:text-rose-700 text-sm font-medium"
                        >
                          View registered players
                          <span className="text-xs">↗</span>
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )} */}
          </>
        )}

        <SessionDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onAddToCart={handleSelectEvent}
          onProceedToCheckout={handleProceedToCheckout}
          isInCart={selectedEvent ? selectedEventIds.includes(selectedEvent.id) : false}
          selectedCount={selectedEventIds.length}
        />
      </div>
    </div>
  );
};

export default PlayPage;
