import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameMonth, isSameWeek, isSameDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { SocialEvent } from "../../types/socialEvent";
import { enAU } from "date-fns/locale";

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
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi);
  if (match && match.length >= 2) {
    const [startPart, endPart] = match;
    const parsePart = (s: string) => {
      const m = s.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (!m) return date;
      let h = parseInt(m[1], 10);
      const min = parseInt(m[2], 10);
      if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12;
      if (m[3]?.toUpperCase() === "AM" && h === 12) h = 0;
      const d = new Date(date);
      d.setHours(h, min, 0, 0);
      return d;
    };
    return { start: parsePart(startPart), end: parsePart(endPart) };
  }
  const start = new Date(date);
  start.setHours(19, 0, 0, 0);
  const end = new Date(date);
  end.setHours(22, 0, 0, 0);
  return { start, end };
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

  const calendarEvents: CalendarEvent[] = events
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
    });

  return (
    <div className="play-calendar-wrapper bg-white rounded-xl shadow-lg p-4 md:p-6 font-calibri">
      <style>{`
        .play-calendar-wrapper .rbc-off-range-bg {
          background: #fff;
        }
        .play-calendar-wrapper .rbc-off-range {
          color: #9ca3af;
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        date={date}
        view={view}
        onNavigate={(_newDate: Date) => setDate(_newDate)}
        onView={(newView: CalendarView) => setView(newView)}
        components={{ toolbar: PlayCalendarToolbar as React.ComponentType<unknown> }}
        style={{ height: 800, minHeight: 400 }}
        onSelectEvent={(evt: unknown) => onViewSession((evt as { resource: SocialEvent }).resource)}
        eventPropGetter={(evt: unknown) => {
          const e = (evt as { resource: SocialEvent }).resource;
          const isSelected = selectedEventIds.includes(e.id);
          return {
            style: {
              backgroundColor: isSelected ? "#be123c" : e.status === "full" ? "#9ca3af" : "#e11d48",
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
