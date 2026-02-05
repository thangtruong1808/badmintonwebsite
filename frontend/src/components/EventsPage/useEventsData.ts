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

  const completedEvents = events.filter((e) => e.status === "completed");
  const upcomingEvents = events.filter(
    (e) => e.status === "available" || e.status === "upcoming" || e.status === "full"
  );

  return { events, loading, error, completedEvents, upcomingEvents };
}
