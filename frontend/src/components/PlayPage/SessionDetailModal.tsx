import React from "react";
import { FaTimes } from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";

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
