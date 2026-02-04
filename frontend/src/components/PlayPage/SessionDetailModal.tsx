import React, { useState, useEffect } from "react";
import { FaTimes, FaUsers } from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";
import { API_BASE } from "../../utils/api";

interface RegisteredPlayer {
  name: string;
  email?: string;
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
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
              <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {players.map((p, i) => (
                  <li key={i} className="text-sm text-gray-700 flex flex-wrap gap-x-2">
                    <span className="font-medium">{p.name}</span>
                    {p.email && <span className="text-gray-500">{p.email}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {event.status === "available" && (
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => onAddToCart(event.id)}
                className="w-full py-2 px-4 rounded-lg border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-medium transition-colors"
              >
                {isInCart ? "Remove from selection" : "Add to selection"}
              </button>
              {selectedCount > 0 && (
                <button
                  onClick={onProceedToCheckout}
                  className="w-full py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold transition-colors"
                >
                  Proceed to checkout ({selectedCount} session{selectedCount !== 1 ? "s" : ""})
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
