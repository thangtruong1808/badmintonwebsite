import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaPaperPlane, FaArrowLeft } from "react-icons/fa";
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

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<SocialEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = event ? `${event.title} - ChibiBadminton` : "Event Details - ChibiBadminton";
    return () => {
      document.title = "ChibiBadminton";
    };
  }, [event]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Invalid event ID");
      return;
    }
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/events/${id}`, { skipAuth: true });
        if (res.ok) {
          const data = await res.json();
          setEvent(data);
        } else if (res.status === 404) {
          setEvent(null);
          setError("Event not found");
        } else {
          setEvent(null);
          setError("Failed to load event");
        }
      } catch {
        setEvent(null);
        setError("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="min-h-[40vh] flex items-center justify-center">
            <p className="text-gray-600 font-calibri">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="text-center py-16">
            <p className="text-gray-600 font-calibri mb-4">{error ?? "Event not found"}</p>
            <Link
              to="/featured-news"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-calibri font-medium"
            >
              <FaArrowLeft size={14} />
              Back to Battle Royale Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = event.status === "available" || event.status === "full";

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="container mx-auto px-4 pt-6 sm:pt-8 pb-12 max-w-3xl">
        <Link
          to="/featured-news"
          className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-calibri text-sm sm:text-base mb-6"
        >
          <FaArrowLeft size={14} />
          Back to Battle Royale Events
        </Link>

        <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          {/* Image */}
          <div className="relative w-full aspect-video sm:aspect-[2/1] bg-gray-100">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-calibri">
                No image
              </div>
            )}
            <span
              className={`absolute top-3 right-3 text-white text-sm font-bold px-3 py-1 rounded font-calibri ${isUpcoming ? "bg-rose-600" : "bg-gray-700"}`}
            >
              {isUpcoming ? "Upcoming" : "Completed"}
            </span>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-huglove mb-4">
              {event.title}
            </h1>

            <dl className="space-y-2 sm:space-y-3 text-gray-600 font-calibri text-sm sm:text-base mb-6">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <dt className="font-semibold text-gray-700">Date:</dt>
                <dd>{formatDate(event.date)}</dd>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <dt className="font-semibold text-gray-700">Time:</dt>
                <dd>{event.time ?? "TBD"}</dd>
                {event.dayOfWeek && (
                  <>
                    <dt className="font-semibold text-gray-700">Day:</dt>
                    <dd>{event.dayOfWeek}</dd>
                  </>
                )}
              </div>
              {event.location && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Location:</dt>
                  <dd>{event.location}</dd>
                </div>
              )}
              {event.maxCapacity != null && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Capacity:</dt>
                  <dd>
                    {event.currentAttendees ?? 0} / {event.maxCapacity} attendees
                  </dd>
                </div>
              )}
              {event.price != null && event.price > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-semibold text-gray-700">Price:</dt>
                  <dd>${event.price.toFixed(2)}</dd>
                </div>
              )}
            </dl>

            {event.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 font-calibri mb-2">
                  Description
                </h2>
                <p className="text-gray-600 font-calibri whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {isUpcoming && (
              <div className="pt-2">
                <a
                  href={BATTLE_ROYALE_REGISTRATION_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 px-5 rounded-lg text-sm sm:text-base font-calibri transition-colors"
                >
                  <FaPaperPlane size={16} />
                  Register Now
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;
