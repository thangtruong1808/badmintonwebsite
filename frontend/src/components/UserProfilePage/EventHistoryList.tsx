import React, { useState, useMemo } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCoins,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaListUl,
} from "react-icons/fa";
import type { UserEventHistory } from "../../types/user";
import type { RegistrationWithEventDetails } from "../../types/socialEvent";
import { formatPoints } from "../../utils/rewardPoints";
import { claimPointsForEvent } from "../../utils/rewardPointsService";
import { cancelUserRegistration } from "../../utils/registrationService";
import { getCurrentUser } from "../../utils/mockAuth";

interface EventHistoryListProps {
  history: UserEventHistory[];
  registrations: RegistrationWithEventDetails[];
  includeCancelled: boolean;
  onToggleIncludeCancelled: () => void;
  onRefetch: () => void;
  onPointsClaimed: () => void;
}

const EventHistoryList: React.FC<EventHistoryListProps> = ({
  history,
  registrations,
  includeCancelled,
  onToggleIncludeCancelled,
  onRefetch,
  onPointsClaimed,
}) => {
  const [activeTab, setActiveTab] = useState<
    "all" | "attended" | "upcoming" | "cancelled"
  >("all");
  const [claimingEventId, setClaimingEventId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  const filteredByTab = useMemo(() => {
    if (activeTab === "all") {
      return includeCancelled ? registrations : registrations.filter((r) => r.status !== "cancelled");
    }
    if (activeTab === "cancelled") return registrations.filter((r) => r.status === "cancelled");
    if (activeTab === "upcoming") return registrations.filter((r) => r.status !== "cancelled" && (r.attendanceStatus === "upcoming" || !r.attendanceStatus));
    if (activeTab === "attended") return registrations.filter((r) => r.attendanceStatus === "attended");
    return registrations;
  }, [registrations, activeTab, includeCancelled]);

  const canCancelRegs = useMemo(
    () => filteredByTab.filter((r) => r.id && r.status !== "cancelled"),
    [filteredByTab]
  );
  const selectedCancelCount = useMemo(
    () => canCancelRegs.filter((r) => r.id && selectedIds.has(r.id)).length,
    [canCancelRegs, selectedIds]
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCancelable = () => {
    const ids = canCancelRegs.map((r) => r.id).filter(Boolean) as string[];
    setSelectedIds((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  };

  const handleCancelOne = async (registrationId: string) => {
    setCancellingIds((prev) => new Set(prev).add(registrationId));
    try {
      const ok = await cancelUserRegistration(registrationId);
      if (ok) await onRefetch();
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(registrationId);
        return next;
      });
    }
  };

  const handleCancelSelected = async () => {
    const toCancel = canCancelRegs.filter((r) => r.id && selectedIds.has(r.id)).map((r) => r.id as string);
    if (toCancel.length === 0) return;
    setCancellingIds((prev) => new Set([...prev, ...toCancel]));
    try {
      for (const id of toCancel) {
        await cancelUserRegistration(id);
      }
      setSelectedIds(new Set());
      await onRefetch();
    } finally {
      setCancellingIds(new Set());
    }
  };

  const filteredHistory = useMemo(() => {
    if (activeTab === "all") return history;
    return history.filter((h) => h.attendanceStatus === activeTab);
  }, [history, activeTab]);

  const hasRegistrations = registrations.length > 0;
  // Attended tab: show attended from BOTH registrations and event history (dedupe by eventId)
  const attendedEventIdsFromRegs = useMemo(
    () =>
      hasRegistrations && activeTab === "attended"
        ? new Set(filteredByTab.map((r) => r.eventId))
        : new Set<number>(),
    [hasRegistrations, activeTab, filteredByTab]
  );
  const displayItems = hasRegistrations ? filteredByTab : [];
  const displayHistory =
    !hasRegistrations
      ? filteredHistory
      : activeTab === "attended"
        ? filteredHistory.filter((h) => !attendedEventIdsFromRegs.has(h.eventId))
        : [];

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
      const success = await claimPointsForEvent(user.id, eventId);
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
      case "stripe":
        return <FaMoneyBillWave className="text-green-600" size={16} />;
      case "mixed":
        return <FaExchangeAlt className="text-blue-600" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-huglove">
        Events List
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
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

      {/* Show all (including cancelled) and Select all - only when All tab is active */}
      {hasRegistrations && activeTab === "all" && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleIncludeCancelled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-calibri font-medium transition-colors bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 shadow-sm"
            aria-pressed={includeCancelled}
          >
            <FaListUl className="shrink-0" />
            {includeCancelled ? "Show upcoming only" : "Show all (including cancelled)"}
          </button>
          {canCancelRegs.length > 0 && (
            <>
              <button
                type="button"
                onClick={selectAllCancelable}
                className="text-sm font-calibri text-rose-600 hover:underline"
              >
                {selectedIds.size === canCancelRegs.length ? "Deselect all" : "Select all"}
              </button>
              {selectedCancelCount > 0 && (
                <button
                  type="button"
                  onClick={handleCancelSelected}
                  disabled={cancellingIds.size > 0}
                  className="px-3 py-1.5 rounded-lg font-calibri text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {cancellingIds.size > 0 ? "Cancelling…" : `Cancel selected (${selectedCancelCount})`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Event List */}
      <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
        {displayItems.length > 0 &&
          displayItems.map((reg) => {
            const status = reg.status === "cancelled" ? "cancelled" : (reg.attendanceStatus ?? "upcoming");
            const isCancelable = reg.id && reg.status !== "cancelled";
            const isCancelling = reg.id ? cancellingIds.has(reg.id) : false;
            const isSelected = reg.id ? selectedIds.has(reg.id) : false;
            const title = reg.eventTitle ?? `Event #${reg.eventId}`;
            const eventDate = reg.eventDate ?? "";
            const eventTime = reg.eventTime ?? "";
            const location = reg.eventLocation ?? "";
            const category = reg.eventCategory ?? "regular";

            return (
              <div
                key={reg.id ?? `${reg.eventId}-${reg.registrationDate}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-wrap items-start gap-3"
              >
                {isCancelable && (
                  <label className="flex items-center gap-2 shrink-0 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => reg.id && toggleSelect(reg.id)}
                      className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                      aria-label={`Select ${title} for cancel`}
                    />
                  </label>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 font-calibri">
                      {title}
                    </h3>
                    {getStatusBadge(status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 font-calibri">
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {eventDate ? formatDate(eventDate) : "—"} • {eventTime || "—"}
                    </p>
                    {location && (
                      <p>
                        <span className="font-semibold">Location:</span> {location}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">Category:</span>{" "}
                      <span className="capitalize">{category}</span>
                    </p>
                    {reg.attendanceStatus === "attended" && (
                      <div className="flex items-center gap-4 mt-2">
                        {(reg.pointsEarned ?? 0) > 0 && (
                          <span className="text-green-600 font-semibold font-calibri">
                            +{formatPoints(reg.pointsEarned ?? 0)} points
                          </span>
                        )}
                        {reg.paymentMethod && getPaymentIcon(reg.paymentMethod)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {reg.paymentMethod && (
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(reg.paymentMethod)}
                      <span className="text-sm font-semibold text-gray-700 font-calibri">
                        {reg.paymentMethod === "points"
                          ? `Free (${formatPoints(reg.pointsUsed || 0)} pts)`
                          : reg.paymentMethod === "mixed"
                            ? `$${reg.pointsUsed ?? 0} + pts`
                            : "Paid"}
                      </span>
                    </div>
                  )}
                  {isCancelable && (
                    <button
                      type="button"
                      onClick={() => reg.id && handleCancelOne(reg.id)}
                      disabled={isCancelling}
                      className="px-3 py-1.5 rounded-lg text-sm font-semibold font-calibri bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {isCancelling ? "Cancelling…" : "Cancel registration"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {displayHistory.length > 0 &&
          displayHistory.map((event) => {
            const user = getCurrentUser();
            const canClaim = user && event.attendanceStatus === "attended" && !event.pointsClaimed;

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
          })}

        {displayItems.length === 0 && displayHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500 font-calibri">
            No events found
          </div>
        )}
      </div>
    </div>
  );
};

export default EventHistoryList;
