import React from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";

interface EventCardProps {
  event: SocialEvent;
  isSelected: boolean;
  onSelect: (eventId: number) => void;
  onRegister: (event: SocialEvent) => void;
  onViewDetails: (event: SocialEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  isSelected,
  onSelect,
  onRegister,
  onViewDetails,
}) => {
  const spotsAvailable = event.maxCapacity - event.currentAttendees;
  const isFull = event.status === "full";
  const isCompleted = event.status === "completed";
  const isCancelled = event.status === "cancelled";

  const getStatusBadge = () => {
    if (isCancelled) {
      return (
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
          CANCELLED
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded">
          COMPLETED
        </span>
      );
    }
    if (isFull) {
      return (
        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
          FULL
        </span>
      );
    }
    return (
      <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
        AVAILABLE
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${isSelected
          ? "ring-4 ring-rose-500 border-2 border-rose-500"
          : "border border-gray-200"
        } ${isCompleted || isCancelled ? "opacity-75" : ""}`}
    >
      {/* Content Section */}
      <div className="p-4 flex-grow flex flex-col relative">
        {/* Status Badge and Checkbox */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 flex-1 pr-2">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge()}
            {!isCompleted && !isCancelled && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(event.id)}
                className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                aria-label={`Select ${event.title}`}
              />
            )}
          </div>
        </div>

        <div className="space-y-2 mb-3 flex-grow">
          <div className="flex items-center text-gray-700 text-sm">
            <FaCalendarAlt className="mr-2 text-green-600 flex-shrink-0" size={14} />
            <span className="font-medium">{formatDate(event.date)}</span>
            <span className="ml-2 text-gray-500">({event.dayOfWeek})</span>
          </div>
          <div className="flex items-center text-gray-700 text-sm">
            <FaClock className="mr-2 text-green-600 flex-shrink-0" size={14} />
            <span className="font-medium">{event.time}</span>
          </div>
          <div className="flex items-start text-gray-700 text-sm">
            <FaMapMarkerAlt
              className="mr-2 mt-0.5 text-green-600 flex-shrink-0"
              size={14}
            />
            <span className="font-medium line-clamp-2">{event.location}</span>
          </div>
          <div className="flex items-center text-gray-700 text-sm">
            <FaUsers className="mr-2 text-green-600 flex-shrink-0" size={14} />
            <span className="font-medium">
              {spotsAvailable} of {event.maxCapacity} spots available
            </span>
          </div>
          {event.price && (
            <div className="flex items-center text-gray-700 text-sm">
              <FaDollarSign className="mr-2 text-green-600 flex-shrink-0" size={14} />
              <span className="font-medium">${event.price}</span>
            </div>
          )}
        </div>

        <p className="text-gray-600 text-xs mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {!isCompleted && !isCancelled && (
            <button
              onClick={() => onRegister(event)}
              disabled={isFull}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${isFull
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-rose-500 text-white hover:bg-rose-600"
                }`}
            >
              {isFull ? "Full" : "Register"}
            </button>
          )}
          <button
            onClick={() => onViewDetails(event)}
            className="flex-1 py-2 px-4 rounded-lg font-semibold text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
