import React from "react";
import { FaCheckCircle, FaSpinner, FaEdit } from "react-icons/fa";
import type { SocialEvent } from "../../../types/socialEvent";

interface SessionDetailActionsProps {
  event: SocialEvent;
  isFull: boolean;
  isAlreadyRegistered: boolean;
  myRegistrationId?: string;
  myGuestCount: number;
  myWaitlistFriendCount: number;
  eventWaitlistStatusLoading: boolean;
  isOnEventWaitlist: boolean;
  canCancel?: boolean;
  isCancelling?: boolean;
  isInCart: boolean;
  selectedCount: number;
  guestCountToAdd: number;
  setGuestCountToAdd: (n: number) => void;
  addGuestsSubmitting: boolean;
  addGuestsMessage: { type: "success" | "error"; text: string } | null;
  removeGuestsSubmitting: boolean;
  removeGuestsMessage: { type: "success" | "error"; text: string } | null;
  waitlistCountToReduce: number;
  setWaitlistCountToReduce: (n: number) => void;
  reduceWaitlistSubmitting: boolean;
  reduceWaitlistMessage: { type: "success" | "error"; text: string } | null;
  user: { email?: string } | null;
  onAddToCart: (eventId: number) => void;
  onProceedToCheckout: () => void;
  onClose: () => void;
  onAddGuestsClick: () => void;
  onOpenRemoveGuestsModal: () => void;
  onOpenEditGuestsModal: () => void;
  onReduceWaitlistClick: () => void;
  onShowCancelConfirm: () => void;
  onOpenWaitlistForm: () => void;
  onShowWaitlistSignInDialog: () => void;
}

const SessionDetailActions: React.FC<SessionDetailActionsProps> = ({
  event,
  isFull,
  isAlreadyRegistered,
  myRegistrationId,
  myGuestCount,
  myWaitlistFriendCount,
  eventWaitlistStatusLoading,
  isOnEventWaitlist,
  canCancel,
  isCancelling,
  isInCart,
  selectedCount,
  guestCountToAdd,
  setGuestCountToAdd,
  addGuestsSubmitting,
  addGuestsMessage,
  removeGuestsSubmitting,
  removeGuestsMessage,
  waitlistCountToReduce,
  setWaitlistCountToReduce,
  reduceWaitlistSubmitting,
  reduceWaitlistMessage,
  user,
  onAddToCart,
  onProceedToCheckout,
  onClose,
  onAddGuestsClick,
  onOpenRemoveGuestsModal,
  onOpenEditGuestsModal,
  onReduceWaitlistClick,
  onShowCancelConfirm,
  onOpenWaitlistForm,
  onShowWaitlistSignInDialog,
}) => {
  return (
    <div className="flex flex-col gap-3 pt-4">
      {isFull && !isAlreadyRegistered && (
        <p className="text-amber-700 text-sm font-medium bg-amber-50 border border-amber-200 rounded-lg p-3">
          {eventWaitlistStatusLoading
            ? "Checking waitlist status…"
            : isOnEventWaitlist
              ? "You're on the waitlist. We'll email you when a spot opens."
              : "This session is full. Join the waitlist to be notified when a spot opens."}
        </p>
      )}
      {isAlreadyRegistered && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 font-calibri text-sm"
          role="status"
          aria-live="polite"
        >
          <FaCheckCircle size={18} className="flex-shrink-0 text-green-600" />
          <span>You&apos;re already registered for this session.</span>
        </div>
      )}
      {isAlreadyRegistered && myRegistrationId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <span className="text-sm text-gray-700 font-calibri">Add friends (+1 to +10):</span>
          <select
            value={guestCountToAdd}
            onChange={(e) => setGuestCountToAdd(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-calibri"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>
                +{n}
              </option>
            ))}
          </select>
          <button
            onClick={onAddGuestsClick}
            disabled={addGuestsSubmitting}
            className="py-1.5 px-4 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri inline-flex items-center justify-center gap-2"
          >
            {addGuestsSubmitting ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Adding…</span></> : "Add friends"}
          </button>
          {addGuestsMessage && (
            <span className={`text-sm ${addGuestsMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {addGuestsMessage.text}
            </span>
          )}
        </div>
      )}
      {isAlreadyRegistered && myRegistrationId && myGuestCount >= 1 && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700 font-calibri">Manage friends (you have +{myGuestCount}):</span>
            <button
              onClick={onOpenRemoveGuestsModal}
              disabled={removeGuestsSubmitting}
              className="py-1.5 px-4 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri inline-flex items-center justify-center gap-2"
            >
              Remove friends
            </button>
            <button
              onClick={onOpenEditGuestsModal}
              className="text-sm text-rose-600 hover:text-rose-700 font-medium font-calibri inline-flex items-center gap-1.5"
            >
              <FaEdit size={14} />
              Edit friend names
            </button>
            {removeGuestsMessage && (
              <span className={`text-sm w-full ${removeGuestsMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {removeGuestsMessage.text}
              </span>
            )}
          </div>
        </div>
      )}
      {isAlreadyRegistered && myRegistrationId && myWaitlistFriendCount >= 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <span className="text-sm text-gray-700 font-calibri">Friends on waitlist (you have +{myWaitlistFriendCount} waiting):</span>
          <select
            value={waitlistCountToReduce}
            onChange={(e) => setWaitlistCountToReduce(Math.min(Number(e.target.value), myWaitlistFriendCount))}
            className="px-3 py-1.5 border border-amber-300 rounded-lg text-sm font-calibri"
          >
            {Array.from({ length: myWaitlistFriendCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Reduce by {n}
              </option>
            ))}
          </select>
          <button
            onClick={onReduceWaitlistClick}
            disabled={reduceWaitlistSubmitting}
            className="py-1.5 px-4 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-100 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri inline-flex items-center justify-center gap-2"
          >
            {reduceWaitlistSubmitting ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Updating…</span></> : "Update waitlist"}
          </button>
          {reduceWaitlistMessage && (
            <span className={`text-sm ${reduceWaitlistMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {reduceWaitlistMessage.text}
            </span>
          )}
        </div>
      )}
      {isAlreadyRegistered && canCancel && (
        <button
          onClick={onShowCancelConfirm}
          disabled={isCancelling}
          className="w-full py-2.5 px-3 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors font-calibri text-sm sm:text-base inline-flex items-center justify-center gap-2"
        >
          {isCancelling ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Cancelling…</span></> : "Cancel my registration"}
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {!isAlreadyRegistered && !isFull && (
          <button
            onClick={() => onAddToCart(event.id)}
            className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-medium transition-colors font-calibri text-sm sm:text-base"
          >
            {isInCart ? "Remove from selection" : "Add to selection"}
          </button>
        )}
        {!isAlreadyRegistered && isFull && !isOnEventWaitlist && (
          <button
            onClick={() => {
              if (!user) {
                onShowWaitlistSignInDialog();
              } else {
                onOpenWaitlistForm();
              }
            }}
            disabled={eventWaitlistStatusLoading}
            className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium transition-colors font-calibri text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {eventWaitlistStatusLoading ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Loading…</span></> : "Join waitlist"}
          </button>
        )}
        {isAlreadyRegistered && isInCart && (
          <button
            onClick={() => onAddToCart(event.id)}
            className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium transition-colors font-calibri text-sm sm:text-base"
          >
            Remove from selection
          </button>
        )}
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
    </div>
  );
};

export default SessionDetailActions;
