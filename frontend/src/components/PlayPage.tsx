import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PlayCalendar from "./PlayPage/PlayCalendar";
import SessionDetailModal from "./PlayPage/SessionDetailModal";
import { setCartItems, getCartItems, clearCart } from "../utils/cartStorage";
import type { SocialEvent, Registration } from "../types/socialEvent";
import { getCurrentUser } from "../utils/mockAuth";
import { getUserRegistrations, cancelUserRegistration } from "../utils/registrationService";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<SocialEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>(() => getCartItems());
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [cancellingRegistrationId, setCancellingRegistrationId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ChibiBadminton - Play Sessions";
  }, []);

  const fetchMyRegistrations = useCallback(async () => {
    const user = getCurrentUser();
    if (!user?.id) {
      setMyRegistrations([]);
      return;
    }
    const regs = await getUserRegistrations(user.id);
    setMyRegistrations(Array.isArray(regs) ? regs : []);
  }, []);

  // Load current user's registrations so we can support cancel/unregister
  useEffect(() => {
    fetchMyRegistrations();
  }, [fetchMyRegistrations]);

  // Refetch my registrations when opening a session modal so cancel button is up to date
  useEffect(() => {
    if (selectedEvent) fetchMyRegistrations();
  }, [selectedEvent?.id, fetchMyRegistrations]);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const from = new Date();
      const to = new Date();
      to.setFullYear(to.getFullYear() + 1);
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

  // Map eventId -> registration so we know if the current user is registered for a given session
  const eventIdToRegistration = useMemo(() => {
    const map = new Map<number, Registration & { id?: string }>();
    (myRegistrations as (Registration & { id?: string; eventId?: number; event_id?: number })[]).forEach((reg) => {
      const status = reg.status?.toLowerCase?.() ?? reg.status;
      if (status !== "confirmed") return;
      const eventId = reg.eventId ?? (reg as { event_id?: number }).event_id;
      const id = reg.id ?? (reg as { id?: string }).id;
      if (eventId != null && id != null) {
        map.set(Number(eventId), { ...reg, eventId: Number(eventId), id: String(id) });
      }
    });
    return map;
  }, [myRegistrations]);

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

  const handleCancelRegistrationForEvent = async (eventId: number) => {
    const reg = eventIdToRegistration.get(eventId) as (Registration & { id?: string }) | undefined;
    if (!reg || !reg.id) return;

    setCancellingRegistrationId(reg.id);
    const ok = await cancelUserRegistration(reg.id);
    if (ok) {
      // Update local registrations state
      setMyRegistrations((prev) =>
        (prev as (Registration & { id?: string })[]).map((r) =>
          r.id === reg.id ? { ...r, status: "cancelled" } : r
        )
      );
      // Remove this event from local cart selection as well
      setSelectedEventIds((prev) => {
        const next = prev.filter((id) => id !== eventId);
        setCartItems(next);
        return next;
      });
      // Refresh events list so capacities/attendees update
      fetchEvents();
    }
    setCancellingRegistrationId(null);
  };

  const handleProceedToCheckout = () => {
    if (selectedEvents.length === 0) return;
    navigate("/play/checkout", { state: { events: selectedEvents } });
  };

  return (
    <div className="w-full min-h-full overflow-x-hidden bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-12 pb-8">
        {/* Header */}
        <div className="text-center mb-10 p-6 rounded-lg shadow-xl bg-gradient-to-r from-rose-50 to-rose-100">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-huglove">
            Play Sessions
          </h1>
          <p className="text-gray-700 text-base md:text-lg lg:text-xl max-w-3xl mx-auto font-calibri">
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
          </>
        )}

        {(() => {
          const eventId = selectedEvent?.id != null ? Number(selectedEvent.id) : null;
          const regForSelected =
            eventId != null ? eventIdToRegistration.get(eventId) : undefined;
          const regId = (regForSelected as (Registration & { id?: string }) | undefined)?.id;

          return (
            <SessionDetailModal
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onAddToCart={handleSelectEvent}
              onProceedToCheckout={handleProceedToCheckout}
              isInCart={selectedEvent ? selectedEventIds.includes(selectedEvent.id) : false}
              selectedCount={selectedEventIds.length}
              canCancel={!!regId}
              onCancelRegistration={
                regId && selectedEvent
                  ? () => handleCancelRegistrationForEvent(selectedEvent.id)
                  : undefined
              }
              isCancelling={!!regId && regId === cancellingRegistrationId}
            />
          );
        })()}
      </div>
    </div>
  );
};

export default PlayPage;
