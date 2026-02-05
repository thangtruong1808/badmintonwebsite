import React, { useState, useEffect } from "react";
import { FaTimes, FaUsers } from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";
import { API_BASE } from "../../utils/api";

interface RegisteredPlayer {
  name: string;
  email?: string;
  avatar?: string | null;
}

interface SessionDetailModalProps {
  event: SocialEvent | null;
  onClose: () => void;
  onAddToCart: (eventId: number) => void;
  onProceedToCheckout: () => void;
  isInCart: boolean;
  selectedCount: number;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  event,
  onClose,
  onAddToCart,
  onProceedToCheckout,
  isInCart,
  selectedCount,
}) => {
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);

  useEffect(() => {
    if (!event?.id) {
      setPlayers([]);
      return;
    }
    setPlayersLoading(true);
    fetch(`${API_BASE}/api/events/${event.id}/registrations`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { registrations: [] }))
      .then((data) => setPlayers(data.registrations || []))
      .catch(() => setPlayers([]))
      .finally(() => setPlayersLoading(false));
  }, [event?.id]);

  if (!event) return null;

  const available = event.maxCapacity - event.currentAttendees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 font-calibri">{event.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <FaTimes size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4 font-calibri">
          <p className="text-gray-700">
            <strong>Date:</strong>{" "}
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-gray-700">
            <strong>Time:</strong> {event.time}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong> {event.location}
          </p>
          <p className="text-gray-700">
            <strong>Spots:</strong> {available} available / {event.maxCapacity} total spots
          </p>
          {event.price != null && (
            <p className="text-gray-700">
              <strong>Price:</strong> ${event.price}
            </p>
          )}

          <p className="text-gray-600 text-sm">{event.description}</p>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-2">
              <FaUsers className="text-rose-500" />
              Registered players ({players.length})
            </h3>
            {playersLoading ? (
              <p className="text-sm text-gray-500 py-2">Loading…</p>
            ) : players.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No players registered yet.</p>
            ) : (
              <ul className="max-h-[min(360px,55vh)] overflow-y-auto pr-1 flex flex-wrap gap-2" title={players.map((p) => p.name).join(", ")}>
                {players.map((p, i) => {
                  const parts = (p.name || "").trim().split(/\s+/);
                  const initials =
                    parts.length === 0 || !parts[0]
                      ? "?"
                      : parts.length === 1
                        ? parts[0].charAt(0).toUpperCase()
                        : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                  return (
                    <li key={i} className="flex-shrink-0" title={p.name}>
                      {p.avatar && String(p.avatar).trim() ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {initials}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {event.status === "available" && (
            <div className="flex flex-wrap gap-2 pt-4">
              <button
                onClick={() => onAddToCart(event.id)}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-medium transition-colors font-calibri text-sm sm:text-base"
              >
                {isInCart ? "Remove from selection" : "Add to selection"}
              </button>
              <button
                onClick={onClose}
                className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors font-calibri text-sm sm:text-base"
              >
                Continue to shop
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={onProceedToCheckout}
                  className="flex-1 min-w-[120px] py-2.5 px-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold transition-colors font-calibri text-sm sm:text-base"
                >
                  Checkout ({selectedCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
