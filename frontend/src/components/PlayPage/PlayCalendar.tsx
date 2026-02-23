import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameMonth, isSameWeek, isSameDay, startOfDay, setHours, setMinutes } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { SocialEvent } from "../../types/socialEvent";
import { enAU } from "date-fns/locale";
import { API_BASE } from "../../utils/api";

interface RegisteredPlayer {
  name: string;
  email?: string;
  avatar?: string | null;
  guestCount?: number;
}

const registrationsCache = new Map<number, RegisteredPlayer[]>();

const DEFAULT_MESSAGES: Record<string, string> = { today: "Today", previous: "Back", next: "Next", month: "Month", week: "Week", day: "Day", agenda: "Agenda" };

function PlayCalendarToolbar(props: {
  date: Date;
  view: string;
  label: string;
  onNavigate: (action: string) => void;
  onView: (v: string) => void;
  localizer?: { messages?: Record<string, string> };
  views: string[];
}) {
  const { date, view, label, onNavigate, onView, localizer, views } = props;
  const m: Record<string, string> = { ...DEFAULT_MESSAGES, ...(localizer?.messages || {}) };
  const now = new Date();
  const isOnToday =
    view === "month"
      ? isSameMonth(date, now)
      : view === "week" || view === "work_week"
        ? isSameWeek(date, now, { weekStartsOn: 1 })
        : isSameDay(date, now);

  return (
    <div className="rbc-toolbar flex flex-wrap items-center justify-center gap-2 py-3">
      <span className="rbc-btn-group flex gap-1">
        <button
          type="button"
          onClick={() => onNavigate("TODAY")}
          disabled={isOnToday}
          className={`rbc-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${isOnToday
            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500"
            : "hover:bg-rose-100 text-rose-700"
            }`}
        >
          {m.today}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("PREV")}
          className="rbc-btn px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-100 text-rose-700 transition-colors min-h-[36px]"
        >
          {m.previous}
        </button>
        <button
          type="button"
          onClick={() => onNavigate("NEXT")}
          className="rbc-btn px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-100 text-rose-700 transition-colors min-h-[36px]"
        >
          {m.next}
        </button>
      </span>
      <span className="rbc-toolbar-label font-semibold text-gray-800 order-first w-full text-center sm:order-none sm:w-auto">
        {label}
      </span>
      {views.length > 1 && (
        <span className="rbc-btn-group flex gap-1">
          {views.map((name) => (
            <button
              type="button"
              key={name}
              className={`rbc-btn px-3 py-1.5 rounded-lg text-sm font-medium min-h-[36px] ${view === name ? "rbc-active bg-rose-500 text-white" : "hover:bg-rose-100 text-rose-700"
                }`}
              onClick={() => onView(name)}
            >
              {m[name] ?? name}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: { "en-AU": enAU },
});

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: SocialEvent;
}

function parseTime(dateStr: string, timeStr: string): { start: Date; end: Date } {
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setHours(19, 0, 0, 0);
    const end = new Date(fallback);
    end.setHours(22, 0, 0, 0);
    return { start: fallback, end };
  }
  const match = timeStr?.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi);
  const parsePart = (s: string) => {
    const m = String(s || "").trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!m) return new Date(date);
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12;
    if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0;
    const d = new Date(date);
    d.setHours(h, min, 0, 0);
    return d;
  };
  if (match && match.length >= 2) {
    return { start: parsePart(match[0]), end: parsePart(match[1]) };
  }
  if (match && match.length === 1) {
    const start = parsePart(match[0]);
    const end = new Date(start);
    end.setHours(end.getHours() + 3, end.getMinutes(), 0, 0);
    return { start, end };
  }
  const start = new Date(date);
  start.setHours(19, 0, 0, 0);
  const end = new Date(date);
  end.setHours(22, 0, 0, 0);
  return { start, end };
}

function getInitials(name: string): string {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function PlayCalendarEvent(props: {
  event: { id: number; title: string; resource: SocialEvent };
  view?: string;
  [key: string]: unknown;
}) {
  const { event, view } = props;
  const socialEvent = event.resource;
  const showPlayers = view === "week" || view === "day" || view === "work_week";
  const [players, setPlayers] = useState<RegisteredPlayer[]>(() =>
    registrationsCache.get(socialEvent.id) ?? []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showPlayers || !socialEvent?.id) return;
    const cached = registrationsCache.get(socialEvent.id);
    if (cached) {
      setPlayers(cached);
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/events/${socialEvent.id}/registrations`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { registrations: [] }))
      .then((data) => {
        const list = Array.isArray(data?.registrations) ? data.registrations : [];
        registrationsCache.set(socialEvent.id, list);
        setPlayers(list);
      })
      .catch(() => {
        setPlayers([]);
      })
      .finally(() => setLoading(false));
  }, [showPlayers, socialEvent?.id]);

  if (!showPlayers) {
    return <span className="rbc-event-label">{event.title}</span>;
  }

  return (
    <div className="rbc-event-content flex flex-col gap-1 overflow-hidden h-full">
      <span className="rbc-event-label font-medium truncate flex-shrink-0">{event.title}</span>
      {(loading || players.length > 0) && (
        <div className="flex flex-wrap gap-1 items-center flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <span className="text-xs opacity-90">Loading…</span>
          ) : (
            players.slice(0, 8).map((p, i) => {
              const hasGuests = (p.guestCount ?? 0) >= 1;
              const borderClass = hasGuests ? "ring-1 ring-amber-400" : "";
              return (
                <span key={i} title={p.name + (hasGuests ? ` (+${p.guestCount} friend${(p.guestCount ?? 0) > 1 ? "s" : ""})` : "")} className={`flex-shrink-0 rounded-full ${borderClass}`}>
                  {p.avatar && String(p.avatar).trim() ? (
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[10px] font-bold">
                      {getInitials(p.name)}
                    </span>
                  )}
                </span>
              );
            })
          )}
          {!loading && players.length > 8 && (
            <span className="text-[10px] opacity-90">+{players.length - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}

interface PlayCalendarProps {
  events: SocialEvent[];
  selectedEventIds: number[];
  onSelectEvent: (eventId: number) => void;
  onViewSession: (event: SocialEvent) => void;
}

type CalendarView = "month" | "week" | "day" | "agenda";

const PlayCalendar: React.FC<PlayCalendarProps> = ({
  events,
  selectedEventIds,
  onViewSession,
}) => {
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<CalendarView>("month");

  const calendarEvents: CalendarEvent[] = React.useMemo(
    () =>
      events
        .filter((e) => e.status === "available" || e.status === "full")
        .map((e) => {
          const { start, end } = parseTime(e.date, e.time);
          return {
            id: e.id,
            title: `${e.title} (${e.currentAttendees}/${e.maxCapacity})`,
            start,
            end,
            resource: e,
          };
        }),
    [events]
  );

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
    if ((newView === "week" || newView === "day") && calendarEvents.length > 0) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const rangeStart = newView === "week" ? weekStart : startOfDay(date);
      const rangeEnd = new Date(rangeStart);
      rangeEnd.setDate(rangeEnd.getDate() + (newView === "week" ? 7 : 1));
      const hasEventInRange = calendarEvents.some(
        (ev) => ev.start >= rangeStart && ev.start < rangeEnd
      );
      if (!hasEventInRange) {
        setDate(calendarEvents[0].start);
      }
    }
  };

  const timeMin = React.useMemo(() => setMinutes(setHours(startOfDay(new Date()), 6), 0), []);
  const timeMax = React.useMemo(() => setMinutes(setHours(startOfDay(new Date()), 23), 0), []);
  const scrollToTime = React.useMemo(() => {
    if ((view !== "week" && view !== "day") || calendarEvents.length === 0) return timeMin;
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const rangeStart = view === "week" ? weekStart : startOfDay(date);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeEnd.getDate() + (view === "week" ? 7 : 1));
    const eventsInRange = calendarEvents
      .filter((ev) => ev.start >= rangeStart && ev.start < rangeEnd)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    return eventsInRange.length > 0 ? eventsInRange[0].start : timeMin;
  }, [view, date, calendarEvents, timeMin]);

  return (
    <div className="play-calendar-wrapper bg-white rounded-xl shadow-lg p-4 md:p-6 font-calibri">
      <style>{`
        .play-calendar-wrapper .rbc-off-range-bg {
          background: #fff;
        }
        .play-calendar-wrapper .rbc-off-range {
          color: #9ca3af;
        }
        .play-calendar-wrapper .rbc-event .rbc-event-content {
          padding: 2px 4px;
        }
        .play-calendar-wrapper .rbc-day-slot .rbc-event .rbc-event-content {
          padding: 4px 6px;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        date={date}
        view={view}
        min={timeMin}
        max={timeMax}
        scrollToTime={scrollToTime}
        onNavigate={(_newDate: Date) => setDate(_newDate)}
        onView={(newView: CalendarView) => handleViewChange(newView)}
        components={{
          toolbar: PlayCalendarToolbar as React.ComponentType<unknown>,
          event: ((props: unknown) => (
            <PlayCalendarEvent {...(props as { event: { id: number; title: string; resource: SocialEvent }; [key: string]: unknown })} view={view} />
          )) as React.ComponentType<unknown>,
          week: {
            event: ((props: unknown) => (
              <PlayCalendarEvent {...(props as { event: { id: number; title: string; resource: SocialEvent }; [key: string]: unknown })} view="week" />
            )) as React.ComponentType<unknown>,
          },
          day: {
            event: ((props: unknown) => (
              <PlayCalendarEvent {...(props as { event: { id: number; title: string; resource: SocialEvent }; [key: string]: unknown })} view="day" />
            )) as React.ComponentType<unknown>,
          },
          work_week: {
            event: ((props: unknown) => (
              <PlayCalendarEvent {...(props as { event: { id: number; title: string; resource: SocialEvent }; [key: string]: unknown })} view="work_week" />
            )) as React.ComponentType<unknown>,
          },
        }}
        style={{ height: "min(560px, 100vh)", minHeight: 800 }}
        onSelectEvent={(evt: unknown) => onViewSession((evt as { resource: SocialEvent }).resource)}
        eventPropGetter={(evt: unknown) => {
          const e = (evt as { resource: SocialEvent }).resource;
          const isSelected = selectedEventIds.includes(e.id);
          const isFull = (e.currentAttendees ?? 0) >= (e.maxCapacity ?? 0);
          return {
            style: {
              backgroundColor: isSelected ? "#be123c" : isFull ? "#9ca3af" : "#e11d48",
              color: "white",
              borderRadius: "4px",
              border: "none",
            },
          };
        }}
      />
    </div>
  );
};

export default PlayCalendar;
