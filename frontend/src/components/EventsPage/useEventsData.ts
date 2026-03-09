import { useState, useEffect } from "react";
import type { EventDisplay } from "../../types/event";
import { apiFetch } from "../../utils/api";

export function useEventsData() {
  const [events, setEvents] = useState<EventDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch("/api/events?category=tournament", { skipAuth: true });
        if (res.ok) {
          const list = await res.json();
          setEvents(Array.isArray(list) ? list : []);
        } else {
          setEvents([]);
        }
      } catch {
        setError("Could not load events.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const completedEvents = [...events]
    .filter((e) => e.status === "completed")
    .sort((a, b) => {
      const da = Date.parse(a.date);
      const db = Date.parse(b.date);

      if (!Number.isNaN(db) && !Number.isNaN(da) && db !== da) {
        // Newest date first
        return db - da;
      }

      // Fallback: higher id treated as newer
      return (b.id ?? 0) - (a.id ?? 0);
    });
  const upcomingEvents = events.filter(
    (e) => e.status === "available" || e.status === "upcoming" || e.status === "full"
  );

  return { events, loading, error, completedEvents, upcomingEvents };
}
