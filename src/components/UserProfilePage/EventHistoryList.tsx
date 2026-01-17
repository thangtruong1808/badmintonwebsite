import React, { useState, useMemo } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCoins,
  FaMoneyBillWave,
  FaExchangeAlt,
} from "react-icons/fa";
import type { UserEventHistory } from "../../types/user";
import { formatPoints } from "../../utils/rewardPoints";
import { claimPointsForEvent, canClaimPoints } from "../../utils/rewardPointsService";
import { getCurrentUser } from "../../utils/mockAuth";

interface EventHistoryListProps {
  history: UserEventHistory[];
  onPointsClaimed: () => void;
}

const EventHistoryList: React.FC<EventHistoryListProps> = ({
  history,
  onPointsClaimed,
}) => {
  const [activeTab, setActiveTab] = useState<
    "all" | "attended" | "upcoming" | "cancelled"
  >("all");
  const [claimingEventId, setClaimingEventId] = useState<number | null>(null);

  const filteredHistory = useMemo(() => {
    if (activeTab === "all") return history;
    return history.filter((h) => h.attendanceStatus === activeTab);
  }, [history, activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleClaimPoints = async (eventId: number) => {
    const user = getCurrentUser();
    if (!user) return;

    setClaimingEventId(eventId);
    try {
      const success = claimPointsForEvent(user.id, eventId);
      if (success) {
        onPointsClaimed();
      }
    } catch (error) {
      console.error("Error claiming points:", error);
    } finally {
      setClaimingEventId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "attended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold font-calibri">
            <FaCheckCircle size={12} />
            Attended
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold font-calibri">
            <FaClock size={12} />
            Upcoming
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold font-calibri">
            <FaTimesCircle size={12} />
            Cancelled
          </span>
        );
      case "no-show":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold font-calibri">
            <FaTimesCircle size={12} />
            No Show
          </span>
        );
      default:
        return null;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "points":
        return <FaCoins className="text-yellow-600" size={16} />;
      case "cash":
        return <FaMoneyBillWave className="text-green-600" size={16} />;
      case "mixed":
        return <FaExchangeAlt className="text-blue-600" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-100 to-pink-200 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-huglove">
        Events List
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "attended", "upcoming", "cancelled"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors font-calibri capitalize ${activeTab === tab
              ? "bg-rose-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-calibri">
            No events found
          </div>
        ) : (
          filteredHistory.map((event) => {
            const user = getCurrentUser();
            const canClaim = user && canClaimPoints(user.id, event.eventId);

            return (
              <div
                key={event.eventId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 font-calibri">
                        {event.eventTitle}
                      </h3>
                      {getStatusBadge(event.attendanceStatus)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 font-calibri">
                      <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(event.eventDate)} • {event.eventTime}
                      </p>
                      <p>
                        <span className="font-semibold">Location:</span>{" "}
                        {event.location}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span>{" "}
                        <span className="capitalize">{event.category}</span>
                      </p>
                      {event.attendanceStatus === "attended" && (
                        <div className="flex items-center gap-4 mt-2">
                          {event.pointsEarned > 0 && (
                            <span className="text-green-600 font-semibold font-calibri">
                              +{formatPoints(event.pointsEarned)} points
                            </span>
                          )}
                          {event.pointsClaimed ? (
                            <span className="text-xs text-gray-500 font-calibri">
                              Points claimed
                            </span>
                          ) : canClaim ? (
                            <button
                              onClick={() => handleClaimPoints(event.eventId)}
                              disabled={claimingEventId === event.eventId}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 font-calibri"
                            >
                              {claimingEventId === event.eventId
                                ? "Claiming..."
                                : "Claim Points"}
                            </button>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(event.paymentMethod)}
                      <span className="text-sm font-semibold text-gray-700 font-calibri">
                        {event.paymentMethod === "points"
                          ? `Free (${formatPoints(event.pointsUsed || 0)} pts)`
                          : event.paymentMethod === "mixed"
                            ? `$${event.pricePaid} + ${formatPoints(
                              event.pointsUsed || 0
                            )} pts`
                            : `$${event.pricePaid}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EventHistoryList;
