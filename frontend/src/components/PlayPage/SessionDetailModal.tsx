import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaTimes, FaUsers, FaCheckCircle, FaList } from "react-icons/fa";
import type { SocialEvent } from "../../types/socialEvent";
import { API_BASE } from "../../utils/api";
import { selectUser } from "../../store/authSlice";
import ConfirmDialog from "../Dashboard/Shared/ConfirmDialog";
import {
  joinWaitlist,
  addGuestsToRegistration,
  removeGuestsToRegistration,
  getMyAddGuestsWaitlist,
  getMyEventWaitlistStatus,
  reduceWaitlistFriends,
} from "../../utils/registrationService";

interface RegisteredPlayer {
  name: string;
  email?: string;
  avatar?: string | null;
  guestCount?: number;
}

interface WaitlistPlayer {
  name: string;
  guestCount: number;
  /** 'new_spot' = waiting for a spot (not registered); 'add_guests' = registered, friends waiting */
  type?: "new_spot" | "add_guests";
}

interface SessionDetailModalProps {
  event: SocialEvent | null;
  onClose: () => void;
  onAddToCart: (eventId: number) => void;
  onProceedToCheckout: () => void;
  isInCart: boolean;
  selectedCount: number;
  /** When true, current user has a registration for this session */
  canCancel?: boolean;
  /** Current user's registration ID (for add-guests) */
  myRegistrationId?: string;
  /** Called when user clicks 'Cancel my registration'. May return a Promise; modal refetches registrations after it resolves. */
  onCancelRegistration?: () => void | Promise<void>;
  /** Called after adding guests (to refetch registrations/events) */
  onGuestsAdded?: () => void | Promise<void>;
  /** Called when spots became available (e.g. waitlist join rejected) to refetch events */
  onRefetchRequested?: () => void | Promise<void>;
  /** Optional loading flag while cancellation is in progress */
  isCancelling?: boolean;
  /** Called when user adds friends - navigate to checkout/payment. guestCountTotal: when partial (some waitlisted), total to add via API. */
  onNavigateToAddGuestsPayment?: (registrationId: string, guestCount: number, event: SocialEvent, guestCountTotal?: number) => void;
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  event,
  onClose,
  onAddToCart,
  onProceedToCheckout,
  isInCart,
  selectedCount,
  canCancel,
  myRegistrationId,
  onCancelRegistration,
  onGuestsAdded,
  onRefetchRequested,
  isCancelling = false,
  onNavigateToAddGuestsPayment,
}) => {
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [waitlistPlayers, setWaitlistPlayers] = useState<WaitlistPlayer[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ name: "", email: "", phone: "" });
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [guestCountToAdd, setGuestCountToAdd] = useState<number>(1);
  const [addGuestsSubmitting, setAddGuestsSubmitting] = useState(false);
  const [addGuestsMessage, setAddGuestsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPartialGuestsConfirm, setShowPartialGuestsConfirm] = useState(false);
  const [pendingGuestAdd, setPendingGuestAdd] = useState<{ registrationId: string; count: number; toAdd: number; toWaitlist: number } | null>(null);
  const [removeGuestsSubmitting, setRemoveGuestsSubmitting] = useState(false);
  const [removeGuestsMessage, setRemoveGuestsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [guestCountToRemove, setGuestCountToRemove] = useState<number>(1);
  const [showRemoveGuestsConfirm, setShowRemoveGuestsConfirm] = useState(false);
  const [myWaitlistFriendCount, setMyWaitlistFriendCount] = useState<number>(0);
  const [isOnEventWaitlist, setIsOnEventWaitlist] = useState<boolean>(false);
  const [eventWaitlistStatusLoading, setEventWaitlistStatusLoading] = useState(false);
  const [reduceWaitlistSubmitting, setReduceWaitlistSubmitting] = useState(false);
  const [reduceWaitlistMessage, setReduceWaitlistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [waitlistCountToReduce, setWaitlistCountToReduce] = useState<number>(1);
  const [showReduceWaitlistConfirm, setShowReduceWaitlistConfirm] = useState(false);

  const user = useSelector(selectUser);
  const isAlreadyRegistered =
    !!user?.email &&
    players.some((p) => p.email?.toLowerCase() === user.email.toLowerCase());
  const myGuestCount = isAlreadyRegistered
    ? (players.find((p) => p.email?.toLowerCase() === user?.email?.toLowerCase())?.guestCount ?? 0)
    : 0;

  const spotsAvailable = event ? event.maxCapacity - event.currentAttendees : 0;
  const isFull = spotsAvailable <= 0 || event?.status === "full";

  const fetchRegistrations = React.useCallback(() => {
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

  const fetchWaitlist = React.useCallback(() => {
    if (!event?.id) {
      setWaitlistPlayers([]);
      return;
    }
    setWaitlistLoading(true);
    fetch(`${API_BASE}/api/events/${event.id}/waitlist`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { waitlist: [] }))
      .then((data) => setWaitlistPlayers(data.waitlist || []))
      .catch(() => setWaitlistPlayers([]))
      .finally(() => setWaitlistLoading(false));
  }, [event?.id]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const fetchMyWaitlistCount = React.useCallback(async () => {
    if (!event?.id || !user?.id) {
      setMyWaitlistFriendCount(0);
      return;
    }
    const data = await getMyAddGuestsWaitlist(event.id);
    setMyWaitlistFriendCount(data.count ?? 0);
  }, [event?.id, user?.id]);

  useEffect(() => {
    if (event?.id && user?.id) {
      fetchMyWaitlistCount();
    } else {
      setMyWaitlistFriendCount(0);
    }
  }, [event?.id, user?.id, fetchMyWaitlistCount]);

  const fetchMyEventWaitlistStatus = React.useCallback(async () => {
    if (!event?.id || !user?.id) {
      setIsOnEventWaitlist(false);
      return;
    }
    setEventWaitlistStatusLoading(true);
    const data = await getMyEventWaitlistStatus(event.id);
    setIsOnEventWaitlist(data.onWaitlist);
    setEventWaitlistStatusLoading(false);
  }, [event?.id, user?.id]);

  useEffect(() => {
    if (event?.id && user?.id && isFull && !isAlreadyRegistered) {
      fetchMyEventWaitlistStatus();
    } else {
      setIsOnEventWaitlist(false);
    }
  }, [event?.id, user?.id, isFull, isAlreadyRegistered, fetchMyEventWaitlistStatus]);

  // Fallback: when API returns 0 but user is registered and waitlist shows add-guests entry for them
  useEffect(() => {
    if (myWaitlistFriendCount >= 1 || !user || !isAlreadyRegistered || waitlistPlayers.length === 0) return;
    const addGuestsOnly = waitlistPlayers.filter((w) => w.type === "add_guests");
    if (addGuestsOnly.length === 0) return;
    const myPlayer = players.find((p) => p.email?.toLowerCase() === user.email?.toLowerCase());
    const myDisplayName =
      myPlayer?.name?.trim() ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (!myDisplayName) return;
    const normalize = (s: string) => (s || "").trim().toLowerCase();
    const myNorm = normalize(myDisplayName);
    const namesToTry = [myNorm];
    if (myPlayer?.name) {
      const parts = myPlayer.name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) namesToTry.push(normalize(`${parts[parts.length - 1]} ${parts[0]}`));
    }
    const match = addGuestsOnly.find((w) => {
      const wn = normalize(w.name);
      return wn && namesToTry.some((n) => n && (wn === n || wn.includes(n) || n.includes(wn)));
    });
    if (match && match.guestCount >= 1) {
      setMyWaitlistFriendCount(match.guestCount);
    }
  }, [
    myWaitlistFriendCount,
    user,
    isAlreadyRegistered,
    players,
    waitlistPlayers,
  ]);

  const handleCancelRegistration = async () => {
    if (!onCancelRegistration) return;
    setShowCancelConfirm(false);
    const result = onCancelRegistration();
    await (result instanceof Promise ? result : Promise.resolve());
    fetchRegistrations();
    fetchWaitlist();
  };

  const openWaitlistForm = () => {
    setWaitlistForm({
      name: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "" : "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    });
    setWaitlistMessage(null);
    setShowWaitlistForm(true);
  };

  const handleJoinWaitlist = async () => {
    if (!event || !waitlistForm.name.trim() || !waitlistForm.email.trim()) {
      setWaitlistMessage({ type: "error", text: "Name and email are required." });
      return;
    }
    setWaitlistSubmitting(true);
    setWaitlistMessage(null);
    const result = await joinWaitlist(event.id, waitlistForm);
    setWaitlistSubmitting(false);
    if (result.success) {
      setWaitlistMessage({ type: "success", text: result.message });
      setIsOnEventWaitlist(true);
      fetchWaitlist();
      setTimeout(() => {
        setShowWaitlistForm(false);
      }, 1500);
    } else {
      const isSpotsAvailable = result.message?.toLowerCase().includes("spots available");
      const displayMessage = isSpotsAvailable
        ? "Spots have opened up. Please add this session to your selection and register normally."
        : result.message;
      setWaitlistMessage({ type: "error", text: displayMessage });
      if (isSpotsAvailable) onRefetchRequested?.();
    }
  };

  const handleAddGuestsClick = () => {
    if (!event || !myRegistrationId) return;
    const spotsLeft = event.maxCapacity - event.currentAttendees;
    const count = Math.min(Math.max(1, guestCountToAdd), 10);
    if (count <= spotsLeft) {
      if (onNavigateToAddGuestsPayment) {
        onNavigateToAddGuestsPayment(myRegistrationId, count, event);
      } else {
        doAddGuests(myRegistrationId, count);
      }
    } else {
      const toAdd = spotsLeft;
      const toWaitlist = count - spotsLeft;
      setPendingGuestAdd({ registrationId: myRegistrationId, count, toAdd, toWaitlist });
      setShowPartialGuestsConfirm(true);
    }
  };

  const doAddGuests = async (registrationId: string, count: number) => {
    setAddGuestsSubmitting(true);
    setAddGuestsMessage(null);
    const result = await addGuestsToRegistration(registrationId, count);
    setAddGuestsSubmitting(false);
    if (result.success) {
      const added = result.added ?? count;
      const waitlisted = result.waitlisted ?? 0;
      const msg = waitlisted > 0
        ? `${added} friend(s) added. ${waitlisted} on the waitlist (no payment required).`
        : `${added} friend(s) added.`;
      setAddGuestsMessage({ type: "success", text: msg });
      fetchRegistrations();
      fetchWaitlist();
      fetchMyWaitlistCount();
      onGuestsAdded?.();
    } else {
      setAddGuestsMessage({ type: "error", text: result.message ?? "Failed to add friends." });
    }
  };

  const handlePartialGuestsConfirm = () => {
    if (!pendingGuestAdd) return;
    const { registrationId, toAdd, toWaitlist } = pendingGuestAdd;
    const totalCount = toAdd + toWaitlist;
    setShowPartialGuestsConfirm(false);
    setPendingGuestAdd(null);
    if (onNavigateToAddGuestsPayment && toAdd > 0 && event) {
      onNavigateToAddGuestsPayment(registrationId, toAdd, event, totalCount);
      onClose();
    } else {
      doAddGuests(registrationId, totalCount);
    }
  };

  const handleRemoveGuestsClick = () => {
    if (!myRegistrationId || myGuestCount < 1) return;
    setShowRemoveGuestsConfirm(true);
  };

  const handleRemoveGuestsConfirm = async () => {
    if (!myRegistrationId || myGuestCount < 1) return;
    setShowRemoveGuestsConfirm(false);
    const count = Math.min(Math.max(1, guestCountToRemove), myGuestCount);
    setRemoveGuestsSubmitting(true);
    setRemoveGuestsMessage(null);
    const result = await removeGuestsToRegistration(myRegistrationId, count);
    setRemoveGuestsSubmitting(false);
    if (result.success) {
      const removed = result.removed ?? count;
      const promoted = result.promoted ?? 0;
      const msg = promoted > 0
        ? `${removed} friend(s) removed. ${promoted} spot(s) offered to the waitlist.`
        : `${removed} friend(s) removed.`;
      setRemoveGuestsMessage({ type: "success", text: msg });
      fetchRegistrations();
      fetchWaitlist();
      onGuestsAdded?.();
      setGuestCountToRemove(1);
    } else {
      setRemoveGuestsMessage({ type: "error", text: result.message ?? "Failed to remove friends." });
    }
  };

  const handleReduceWaitlistClick = () => {
    if (!myRegistrationId || myWaitlistFriendCount < 1) return;
    setShowReduceWaitlistConfirm(true);
  };

  const handleReduceWaitlistConfirm = async () => {
    if (!myRegistrationId || myWaitlistFriendCount < 1) return;
    setShowReduceWaitlistConfirm(false);
    const count = Math.min(Math.max(1, waitlistCountToReduce), myWaitlistFriendCount);
    setReduceWaitlistSubmitting(true);
    setReduceWaitlistMessage(null);
    const result = await reduceWaitlistFriends(myRegistrationId, count);
    setReduceWaitlistSubmitting(false);
    if (result.success) {
      setReduceWaitlistMessage({ type: "success", text: `${result.reduced ?? count} friend(s) removed from the waitlist.` });
      fetchWaitlist();
      fetchMyWaitlistCount();
      setWaitlistCountToReduce(1);
    } else {
      setReduceWaitlistMessage({ type: "error", text: result.message ?? "Failed to update waitlist." });
    }
  };

  if (!event) return null;

  const available = event.maxCapacity - event.currentAttendees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-calibri">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto font-calibri">
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

          <p className="text-gray-600 text-sm font-calibri">{event.description}</p>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-2 font-calibri">
              <FaUsers className="text-rose-500" />
              Registered players ({players.length})
            </h3>
            {playersLoading ? (
              <p className="text-sm text-gray-500 py-2 font-calibri">Loading…</p>
            ) : players.length === 0 ? (
              <p className="text-sm text-gray-500 py-2 font-calibri">No players registered yet.</p>
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
                  const hasGuests = (p.guestCount ?? 0) >= 1;
                  const borderClass = hasGuests ? "ring-2 ring-amber-500" : "";
                  return (
                    <li key={i} className={`flex-shrink-0 rounded-full ${borderClass}`} title={p.name + (hasGuests ? ` (+${p.guestCount} friend${(p.guestCount ?? 0) > 1 ? "s" : ""})` : "")}>
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

            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gray-800 mb-2 font-calibri">
                <FaList className="text-amber-500" />
                Waiting list ({waitlistPlayers.length})
              </h3>
              {waitlistLoading ? (
                <p className="text-sm text-gray-500 py-2 font-calibri">Loading…</p>
              ) : waitlistPlayers.length === 0 ? (
                <p className="text-sm text-gray-500 py-2 font-calibri">No one on the waitlist.</p>
              ) : (
                <ul className="max-h-[min(200px,30vh)] overflow-y-auto pr-1 space-y-1.5">
                  {waitlistPlayers.map((w, i) => {
                    const isAddGuests = w.type === "add_guests";
                    const hasType = w.type != null;
                    const label = hasType
                      ? isAddGuests
                        ? `+${w.guestCount} friend${w.guestCount !== 1 ? "s" : ""} waiting`
                        : "waiting for spot"
                      : `+${w.guestCount}`;
                    return (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-gray-700 font-calibri py-1.5 px-3 rounded-lg bg-amber-50 border border-amber-200"
                      >
                        <span className="font-medium text-gray-900 truncate">{w.name}</span>
                        <span className="text-amber-600 font-medium flex-shrink-0">{label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {(event.status === "available" || event.status === "full") && (
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
                    onClick={handleAddGuestsClick}
                    disabled={addGuestsSubmitting}
                    className="py-1.5 px-4 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri"
                  >
                    {addGuestsSubmitting ? "Adding…" : "Add friends"}
                  </button>
                  {addGuestsMessage && (
                    <span className={`text-sm ${addGuestsMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {addGuestsMessage.text}
                    </span>
                  )}
                </div>
              )}
              {isAlreadyRegistered && myRegistrationId && myGuestCount >= 1 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="text-sm text-gray-700 font-calibri">Manage friends (you have +{myGuestCount}):</span>
                  <select
                    value={guestCountToRemove}
                    onChange={(e) => setGuestCountToRemove(Math.min(Number(e.target.value), myGuestCount))}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-calibri"
                  >
                    {Array.from({ length: myGuestCount }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        Remove {n}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleRemoveGuestsClick}
                    disabled={removeGuestsSubmitting}
                    className="py-1.5 px-4 rounded-lg border-2 border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri"
                  >
                    {removeGuestsSubmitting ? "Removing…" : "Remove friends"}
                  </button>
                  {removeGuestsMessage && (
                    <span className={`text-sm ${removeGuestsMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {removeGuestsMessage.text}
                    </span>
                  )}
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
                    onClick={handleReduceWaitlistClick}
                    disabled={reduceWaitlistSubmitting}
                    className="py-1.5 px-4 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-100 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed font-calibri"
                  >
                    {reduceWaitlistSubmitting ? "Updating…" : "Update waitlist"}
                  </button>
                  {reduceWaitlistMessage && (
                    <span className={`text-sm ${reduceWaitlistMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {reduceWaitlistMessage.text}
                    </span>
                  )}
                </div>
              )}
              {isAlreadyRegistered && canCancel && onCancelRegistration && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isCancelling}
                  className="w-full py-2.5 px-3 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed font-medium transition-colors font-calibri text-sm sm:text-base"
                >
                  {isCancelling ? "Cancelling…" : "Cancel my registration"}
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
                    onClick={openWaitlistForm}
                    disabled={eventWaitlistStatusLoading}
                    className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium transition-colors font-calibri text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {eventWaitlistStatusLoading ? "Loading…" : "Join waitlist"}
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
          )}
        </div>
      </div>
      <ConfirmDialog
        open={showPartialGuestsConfirm}
        title="Partial availability"
        titleClassName="font-calibri text-xl font-bold text-gray-800"
        message={
          pendingGuestAdd
            ? `${pendingGuestAdd.toAdd} friend(s) will be added (payment required). ${pendingGuestAdd.toWaitlist} will be on the waitlist (no payment). Proceed to payment?`
            : ""
        }
        confirmLabel="Proceed to payment"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handlePartialGuestsConfirm}
        onCancel={() => {
          setShowPartialGuestsConfirm(false);
          setPendingGuestAdd(null);
        }}
      />
      <ConfirmDialog
        open={showReduceWaitlistConfirm}
        title="Update waitlist"
        message={
          waitlistCountToReduce >= 1 && myWaitlistFriendCount >= 1
            ? `Remove ${Math.min(waitlistCountToReduce, myWaitlistFriendCount)} friend(s) from the waitlist?`
            : ""
        }
        confirmLabel="Yes, update"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleReduceWaitlistConfirm}
        onCancel={() => setShowReduceWaitlistConfirm(false)}
      />
      <ConfirmDialog
        open={showRemoveGuestsConfirm}
        title="Remove friends"
        message={
          guestCountToRemove >= 1 && myGuestCount >= 1
            ? `Remove ${Math.min(guestCountToRemove, myGuestCount)} friend(s)? Freed spot(s) may be offered to the waitlist.`
            : ""
        }
        confirmLabel="Yes, remove"
        cancelLabel="Cancel"
        variant="default"
        onConfirm={handleRemoveGuestsConfirm}
        onCancel={() => setShowRemoveGuestsConfirm(false)}
      />
      <ConfirmDialog
        open={showCancelConfirm}
        title="Cancel registration"
        message="Are you sure you want to cancel your registration for this session? Your spot will be released for others."
        confirmLabel="Yes, cancel"
        cancelLabel="Keep registration"
        variant="danger"
        onConfirm={handleCancelRegistration}
        onCancel={() => setShowCancelConfirm(false)}
      />

      {showWaitlistForm && event && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 font-calibri mb-4">Join waitlist</h3>
            <p className="text-gray-700 text-lg mb-4 font-calibri">
              This session is full. We&apos;ll email you when a spot opens for &quot;{event.title}&quot;. Please regularly check your email for updates.
            </p>
            <div className="space-y-3 font-calibri">
              <input
                type="text"
                placeholder="Name *"
                value={waitlistForm.name}
                onChange={(e) => setWaitlistForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-md"
              />
              <input
                type="email"
                placeholder="Email *"
                value={waitlistForm.email}
                onChange={(e) => setWaitlistForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-md"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={waitlistForm.phone}
                onChange={(e) => setWaitlistForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-calibri text-md"
              />
            </div>
            {waitlistMessage && (
              <p
                className={`mt-3 text-sm font-calibri ${waitlistMessage.type === "success" ? "text-green-600" : "text-red-600"}`}
              >
                {waitlistMessage.text}
              </p>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWaitlistForm(false)}
                className="flex-1 py-2 px-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium font-calibri text-md"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWaitlist}
                disabled={waitlistSubmitting}
                className="flex-1 py-2 px-3 rounded-lg border-2 border-amber-500 text-amber-700 hover:bg-amber-50 font-medium disabled:opacity-60 disabled:cursor-not-allowed font-calibri text-md hover:text-amber-700"
              >
                {waitlistSubmitting ? "Submitting…" : "Join waitlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailModal;
