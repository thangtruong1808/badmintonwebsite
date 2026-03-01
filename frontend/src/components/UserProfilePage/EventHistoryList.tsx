import React, { useState, useMemo } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaCoins,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaListUl,
  FaUserPlus,
  FaSpinner,
} from "react-icons/fa";
import type { UserEventHistory } from "../../types/user";
import type { RegistrationWithEventDetails, SocialEvent } from "../../types/socialEvent";
import { formatPoints } from "../../utils/rewardPoints";
import { claimPointsForEvent } from "../../utils/rewardPointsService";
import { cancelUserRegistration, type CancellationResult } from "../../utils/registrationService";
import { getCurrentUser } from "../../utils/mockAuth";
import ConfirmDialog from "../Dashboard/Shared/ConfirmDialog";

interface EventHistoryListProps {
  history: UserEventHistory[];
  registrations: RegistrationWithEventDetails[];
  includeCancelled: boolean;
  onToggleIncludeCancelled: () => void;
  onRefetch: () => void;
  onPointsClaimed: () => void;
  /** Navigate to checkout for re-registration (same flow as Play page). */
  onNavigateToReRegisterCheckout?: (event: SocialEvent) => void;
}

const EventHistoryList: React.FC<EventHistoryListProps> = ({
  history,
  registrations,
  includeCancelled,
  onToggleIncludeCancelled,
  onRefetch,
  onPointsClaimed,
  onNavigateToReRegisterCheckout,
}) => {
  const [activeTab, setActiveTab] = useState<
    "all" | "attended" | "upcoming" | "cancelled"
  >("all");
  const [claimingEventId, setClaimingEventId] = useState<number | null>(null);
  const [reRegisteringEventId, setReRegisteringEventId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());
  const [cancelOneReg, setCancelOneReg] = useState<RegistrationWithEventDetails | null>(null);
  const [showCancelSelectedConfirm, setShowCancelSelectedConfirm] = useState(false);
  const [registerAgainReg, setRegisterAgainReg] = useState<RegistrationWithEventDetails | null>(null);
  const [cancellationResultDialog, setCancellationResultDialog] = useState<CancellationResult | null>(null);

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

  const handleCancelOneClick = (reg: RegistrationWithEventDetails) => {
    if (reg.id) setCancelOneReg(reg);
  };

  const handleCancelOneConfirm = async () => {
    const reg = cancelOneReg;
    setCancelOneReg(null);
    if (!reg?.id) return;
    setCancellingIds((prev) => new Set(prev).add(reg.id!));
    try {
      const result = await cancelUserRegistration(reg.id);
      if (result.success) {
        await onRefetch();
        setCancellationResultDialog(result);
      } else {
        setCancellationResultDialog(result);
      }
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(reg.id!);
        return next;
      });
    }
  };

  const handleCancelSelectedClick = () => {
    if (selectedCancelCount > 0) setShowCancelSelectedConfirm(true);
  };

  const handleCancelSelectedConfirm = async () => {
    setShowCancelSelectedConfirm(false);
    const toCancel = canCancelRegs.filter((r) => r.id && selectedIds.has(r.id)).map((r) => r.id as string);
    if (toCancel.length === 0) return;
    setCancellingIds((prev) => new Set([...prev, ...toCancel]));
    let lastResult: CancellationResult | null = null;
    try {
      for (const id of toCancel) {
        lastResult = await cancelUserRegistration(id);
      }
      setSelectedIds(new Set());
      await onRefetch();
      if (lastResult) {
        setCancellationResultDialog({
          success: true,
          refundStatus: lastResult.refundStatus,
          message: `Successfully cancelled ${toCancel.length} registration(s). ${lastResult.refundStatus === 'instant' ? 'Refunds are being processed.' : lastResult.refundStatus === 'pending_review' ? 'Some cancellations are under review.' : ''}`,
        });
      }
    } finally {
      setCancellingIds(new Set());
    }
  };

  const regToSocialEvent = (reg: RegistrationWithEventDetails): SocialEvent => ({
    id: reg.eventId,
    title: reg.eventTitle ?? `Event #${reg.eventId}`,
    date: reg.eventDate ?? "",
    time: reg.eventTime ?? "",
    dayOfWeek: "",
    location: reg.eventLocation ?? "",
    description: "",
    maxCapacity: 0,
    currentAttendees: 0,
    price: reg.eventPrice ?? 0,
    status: "available",
    category: (reg.eventCategory as "regular" | "tournament") ?? "regular",
  });

  const handleRegisterAgainClick = (reg: RegistrationWithEventDetails) => {
    setRegisterAgainReg(reg);
  };

  const handleRegisterAgainConfirm = () => {
    const reg = registerAgainReg;
    setRegisterAgainReg(null);
    if (!reg) return;
    if (onNavigateToReRegisterCheckout) {
      onNavigateToReRegisterCheckout(regToSocialEvent(reg));
    } else {
      handleRegisterAgainDirect(reg);
    }
  };

  const handleRegisterAgainDirect = async (reg: RegistrationWithEventDetails) => {
    const user = getCurrentUser();
    if (!user) return;
    const { registerUserForEventIds } = await import("../../utils/registrationService");
    setReRegisteringEventId(reg.eventId);
    try {
      const formData = {
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        email: user.email,
        phone: user.phone ?? "",
      };
      const result = await registerUserForEventIds([reg.eventId], formData);
      if (result.success) await onRefetch();
    } finally {
      setReRegisteringEventId(null);
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
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-6 font-huglove">
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
                  onClick={handleCancelSelectedClick}
                  disabled={cancellingIds.size > 0}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-calibri text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  {cancellingIds.size > 0 ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Cancelling…</span></> : `Cancel selected (${selectedCancelCount})`}
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
            // Attended tab shows past events only — no cancel/checkbox to avoid confusion
            const isCancelable = reg.id && reg.status !== "cancelled" && activeTab !== "attended";
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
                    {reg.attendanceStatus === "attended" && (reg.pointsEarned ?? 0) > 0 && (
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-green-600 font-semibold font-calibri">
                          +{formatPoints(reg.pointsEarned ?? 0)} points
                        </span>
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
                  {reg.status === "cancelled" && (
                    <button
                      type="button"
                      onClick={() => handleRegisterAgainClick(reg)}
                      disabled={reRegisteringEventId === reg.eventId}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold font-calibri bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 transition-colors"
                    >
                      {reRegisteringEventId === reg.eventId ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Registering…</span></> : <><FaUserPlus size={14} /><span>Register again</span></>}
                    </button>
                  )}
                  {isCancelable && (
                    <button
                      type="button"
                      onClick={() => handleCancelOneClick(reg)}
                      disabled={isCancelling}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold font-calibri bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      {isCancelling ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Cancelling…</span></> : "Cancel registration"}
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
                              className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 font-calibri"
                            >
                              {claimingEventId === event.eventId
                                ? <><FaSpinner className="animate-spin h-3 w-3 flex-shrink-0" /><span>Claiming…</span></>
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

      <ConfirmDialog
        open={!!cancelOneReg}
        title="Cancel registration"
        message={
          cancelOneReg
            ? `Are you sure you want to cancel your registration for "${cancelOneReg.eventTitle ?? `Event #${cancelOneReg.eventId}`}"? Your spot will be released for others. You can register again later if spots are available.`
            : ""
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep registration"
        variant="danger"
        onConfirm={handleCancelOneConfirm}
        onCancel={() => setCancelOneReg(null)}
      />
      <ConfirmDialog
        open={showCancelSelectedConfirm}
        title="Cancel selected registrations"
        message={
          selectedCancelCount > 0
            ? `Are you sure you want to cancel ${selectedCancelCount} registration${selectedCancelCount !== 1 ? "s" : ""}? Your spot${selectedCancelCount !== 1 ? "s will" : " will"} be released for others. You can register again later if spots are available.`
            : ""
        }
        confirmLabel="Yes, cancel"
        cancelLabel="Keep"
        variant="danger"
        onConfirm={handleCancelSelectedConfirm}
        onCancel={() => setShowCancelSelectedConfirm(false)}
      />
      <ConfirmDialog
        open={!!registerAgainReg}
        title="Register again"
        message={
          registerAgainReg
            ? `You’re about to re-register for "${registerAgainReg.eventTitle ?? `Event #${registerAgainReg.eventId}`}". You’ll be taken to the checkout to complete your payment. Ready to continue?`
            : ""
        }
        confirmLabel="Proceed to payment"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleRegisterAgainConfirm}
        onCancel={() => setRegisterAgainReg(null)}
      />
      <ConfirmDialog
        open={!!cancellationResultDialog}
        title={
          cancellationResultDialog?.refundStatus === 'instant'
            ? "Registration Cancelled - Refund Initiated"
            : cancellationResultDialog?.refundStatus === 'pending_review'
            ? "Registration Cancelled - Under Review"
            : cancellationResultDialog?.success
            ? "Registration Cancelled"
            : "Cancellation Failed"
        }
        message={cancellationResultDialog?.message || ""}
        confirmLabel="OK"
        cancelLabel=""
        variant={cancellationResultDialog?.success ? "default" : "danger"}
        onConfirm={() => setCancellationResultDialog(null)}
        onCancel={() => setCancellationResultDialog(null)}
      />
    </div>
  );
};

export default EventHistoryList;
