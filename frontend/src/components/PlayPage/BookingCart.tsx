import React from "react";
import { FaShoppingCart, FaTimes, FaCheck } from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";

interface BookingCartProps {
  selectedEvents: SocialEvent[];
  onRemoveEvent: (eventId: number) => void;
  onBookAll: () => void;
  onClearCart: () => void;
}

const BookingCart: React.FC<BookingCartProps> = ({
  selectedEvents,
  onRemoveEvent,
  onBookAll,
  onClearCart,
}) => {
  const totalPrice = selectedEvents.reduce(
    (sum, event) => sum + (event.price || 0),
    0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (selectedEvents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
        <div className="flex items-center gap-2 mb-4">
          <FaShoppingCart className="text-rose-500" size={20} />
          <h3 className="font-bold text-lg text-gray-900">Booking Cart</h3>
        </div>
        <p className="text-gray-500 text-sm">No events selected</p>
        <p className="text-gray-400 text-xs mt-2">
          Select events to register for multiple sessions at once
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaShoppingCart className="text-rose-500" size={20} />
          <h3 className="font-bold text-lg text-gray-900">
            Booking Cart ({selectedEvents.length})
          </h3>
        </div>
        <button
          onClick={onClearCart}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3 mb-4">
        {selectedEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                {event.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(event.date)} • {event.time}
              </p>
              {event.price && (
                <p className="text-xs font-semibold text-rose-500 mt-1">
                  ${event.price}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemoveEvent(event.id)}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              aria-label={`Remove ${event.title}`}
            >
              <FaTimes size={16} />
            </button>
          </div>
        ))}
      </div>

      {totalPrice > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-lg text-rose-500">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={onBookAll}
        className="w-full bg-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
      >
        <FaCheck />
        Book All ({selectedEvents.length})
      </button>
    </div>
  );
};

export default BookingCart;
