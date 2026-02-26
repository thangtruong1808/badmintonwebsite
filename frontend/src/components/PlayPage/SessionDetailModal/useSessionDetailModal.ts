import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { API_BASE } from "../../../utils/api";
import { selectUser } from "../../../store/authSlice";
import {
  reserveWaitlistSpot,
  addGuestsToRegistration,
  reserveAddGuestsToRegistration,
  removeGuestsByIdsToRegistration,
  getMyAddGuestsWaitlist,
  getMyEventWaitlistStatus,
  reduceWaitlistFriends,
  getRegistrationGuests,
  putRegistrationGuests,
} from "../../../utils/registrationService";
import type { RegisteredPlayer, WaitlistPlayer, SessionDetailModalProps } from "./types";

export function useSessionDetailModal(props: SessionDetailModalProps) {
  const {
    event,
    onClose,
    onCancelRegistration,
    onGuestsAdded,
    onRefetchRequested,
    onNavigateToAddGuestsPayment,
    onNavigateToWaitlistPayment,
  } = props;

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
  const [showRemoveGuestsModal, setShowRemoveGuestsModal] = useState(false);
  const [removeGuestsList, setRemoveGuestsList] = useState<{ id: number; name: string }[]>([]);
  const [removeGuestsListLoading, setRemoveGuestsListLoading] = useState(false);
  const [removeGuestsSelectedIds, setRemoveGuestsSelectedIds] = useState<Set<number>>(new Set());
  const [myWaitlistFriendCount, setMyWaitlistFriendCount] = useState<number>(0);
  const [isOnEventWaitlist, setIsOnEventWaitlist] = useState<boolean>(false);
  const [eventWaitlistStatusLoading, setEventWaitlistStatusLoading] = useState(false);
  const [reduceWaitlistSubmitting, setReduceWaitlistSubmitting] = useState(false);
  const [reduceWaitlistMessage, setReduceWaitlistMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [waitlistCountToReduce, setWaitlistCountToReduce] = useState<number>(1);
  const [showReduceWaitlistConfirm, setShowReduceWaitlistConfirm] = useState(false);
  const [showEditGuestsModal, setShowEditGuestsModal] = useState(false);
  const [editGuestsList, setEditGuestsList] = useState<{ id?: number; name: string }[]>([]);
  const [editGuestsLoading, setEditGuestsLoading] = useState(false);
  const [editGuestsSubmitting, setEditGuestsSubmitting] = useState(false);
  const [editGuestsMessage, setEditGuestsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showWaitlistSignInDialog, setShowWaitlistSignInDialog] = useState(false);

  const user = useSelector(selectUser);
  const isAlreadyRegistered =
    !!user?.email &&
    players.some((p) => p.email?.toLowerCase() === user.email.toLowerCase());
  const myGuestCount = isAlreadyRegistered
    ? (players.find((p) => p.email?.toLowerCase() === user?.email?.toLowerCase())?.guestCount ?? 0)
    : 0;

  const spotsAvailable = event ? event.maxCapacity - event.currentAttendees : 0;
  const isFull = spotsAvailable <= 0 || event?.status === "full";

  const fetchRegistrations = useCallback(() => {
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

  const fetchWaitlist = useCallback(() => {
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

  const fetchMyWaitlistCount = useCallback(async () => {
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

  const fetchMyEventWaitlistStatus = useCallback(async () => {
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
    // Event full: pay-first flow — reserve then navigate to checkout/payment; after payment user is added to waitlist.
    const result = await reserveWaitlistSpot(event.id, waitlistForm);
    setWaitlistSubmitting(false);
    if (result.success && result.pendingId && onNavigateToWaitlistPayment) {
      onNavigateToWaitlistPayment(event, result.pendingId);
      onClose();
      return;
    }
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

  const doAddGuests = async (registrationId: string, count: number) => {
    setAddGuestsSubmitting(true);
    setAddGuestsMessage(null);
    const result = await addGuestsToRegistration(registrationId, count);
    setAddGuestsSubmitting(false);
    if (result.success) {
      const added = result.added ?? count;
      const waitlisted = result.waitlisted ?? 0;
      const msg = waitlisted > 0
        ? `${added} friend(s) added. ${waitlisted} on the waitlist.`
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

  const handleAddGuestsClick = () => {
    if (!event || !props.myRegistrationId) return;
    const spotsLeft = event.maxCapacity - event.currentAttendees;
    const count = Math.min(Math.max(1, guestCountToAdd), 10);
    if (count <= spotsLeft) {
      if (onNavigateToAddGuestsPayment) {
        onNavigateToAddGuestsPayment(props.myRegistrationId, count, event);
      } else {
        doAddGuests(props.myRegistrationId, count);
      }
    } else {
      const toAdd = spotsLeft;
      const toWaitlist = count - spotsLeft;
      setPendingGuestAdd({ registrationId: props.myRegistrationId, count, toAdd, toWaitlist });
      setShowPartialGuestsConfirm(true);
    }
  };

  const handlePartialGuestsConfirm = async () => {
    if (!pendingGuestAdd) return;
    const { registrationId, toAdd, toWaitlist } = pendingGuestAdd;
    const totalCount = toAdd + toWaitlist;
    setShowPartialGuestsConfirm(false);
    setPendingGuestAdd(null);
    // When any friends go to waitlist (toWaitlist > 0), payment is required — reserve then navigate to checkout/payment.
    // This includes the case toAdd = 0 (all friends go to waitlist) — all must be paid before being added to waitlist.
    if (onNavigateToAddGuestsPayment && toWaitlist > 0 && event) {
      const reserveResult = await reserveAddGuestsToRegistration(registrationId, totalCount);
      if (reserveResult.success && reserveResult.pendingId) {
        onNavigateToAddGuestsPayment(registrationId, toAdd, event, totalCount, reserveResult.pendingId);
        onClose();
      } else {
        setAddGuestsMessage({ type: "error", text: reserveResult.message ?? "Could not reserve. Please try again." });
      }
    } else if (onNavigateToAddGuestsPayment && toAdd > 0 && event) {
      onNavigateToAddGuestsPayment(registrationId, toAdd, event, totalCount);
      onClose();
    } else {
      doAddGuests(registrationId, totalCount);
    }
  };

  const openRemoveGuestsModal = () => {
    if (!props.myRegistrationId || myGuestCount < 1) return;
    setShowRemoveGuestsModal(true);
    setRemoveGuestsList([]);
    setRemoveGuestsSelectedIds(new Set());
    setRemoveGuestsMessage(null);
    setRemoveGuestsListLoading(true);
    getRegistrationGuests(props.myRegistrationId).then((data) => {
      const list = (data.guests ?? []).filter((g) => g.id != null).map((g) => ({ id: g.id as number, name: g.name }));
      setRemoveGuestsList(list);
      setRemoveGuestsListLoading(false);
    }).catch(() => setRemoveGuestsListLoading(false));
  };

  const toggleRemoveGuestSelected = (id: number) => {
    setRemoveGuestsSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRemoveGuestsConfirm = async () => {
    if (!props.myRegistrationId || removeGuestsSelectedIds.size === 0) return;
    setRemoveGuestsSubmitting(true);
    setRemoveGuestsMessage(null);
    const result = await removeGuestsByIdsToRegistration(props.myRegistrationId, Array.from(removeGuestsSelectedIds));
    setRemoveGuestsSubmitting(false);
    if (result.success) {
      const removed = result.removed ?? 0;
      const promoted = result.promoted ?? 0;
      const msg = promoted > 0
        ? `${removed} friend(s) removed. ${promoted} spot(s) offered to the waitlist.`
        : `${removed} friend(s) removed.`;
      setRemoveGuestsMessage({ type: "success", text: msg });
      setShowRemoveGuestsModal(false);
      fetchRegistrations();
      fetchWaitlist();
      onGuestsAdded?.();
    } else {
      setRemoveGuestsMessage({ type: "error", text: result.message ?? "Failed to remove friends." });
    }
  };

  const handleReduceWaitlistClick = () => {
    if (!props.myRegistrationId || myWaitlistFriendCount < 1) return;
    setShowReduceWaitlistConfirm(true);
  };

  const handleReduceWaitlistConfirm = async () => {
    if (!props.myRegistrationId || myWaitlistFriendCount < 1) return;
    setShowReduceWaitlistConfirm(false);
    const count = Math.min(Math.max(1, waitlistCountToReduce), myWaitlistFriendCount);
    setReduceWaitlistSubmitting(true);
    setReduceWaitlistMessage(null);
    const result = await reduceWaitlistFriends(props.myRegistrationId, count);
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

  const openEditGuestsModal = () => {
    if (!props.myRegistrationId) return;
    setShowEditGuestsModal(true);
    setEditGuestsLoading(true);
    setEditGuestsList([]);
    setEditGuestsMessage(null);
    getRegistrationGuests(props.myRegistrationId).then((data) => {
      setEditGuestsList((data.guests ?? []).map((g) => ({ id: g.id, name: g.name })));
      setEditGuestsLoading(false);
    }).catch(() => setEditGuestsLoading(false));
  };

  const handleSaveEditGuests = async () => {
    if (!props.myRegistrationId) return;
    const allFilled = editGuestsList.every((g) => (g.name ?? "").trim());
    if (!allFilled) {
      setEditGuestsMessage({ type: "error", text: "Please enter a name for each friend." });
      return;
    }
    setEditGuestsSubmitting(true);
    setEditGuestsMessage(null);
    const result = await putRegistrationGuests(props.myRegistrationId, editGuestsList.map((g) => ({ id: g.id, name: (g.name ?? "").trim() })));
    setEditGuestsSubmitting(false);
    if (result.success) {
      setEditGuestsMessage({ type: "success", text: "Friend names saved." });
      fetchRegistrations();
      onGuestsAdded?.();
    } else {
      setEditGuestsMessage({ type: "error", text: result.message ?? "Failed to save." });
    }
  };

  const setEditGuestsListUpdate = (updater: (prev: { id?: number; name: string }[]) => { id?: number; name: string }[]) => {
    setEditGuestsList(updater);
  };

  return {
    ...props,
    event,
    user,
    players,
    waitlistPlayers,
    playersLoading,
    waitlistLoading,
    isAlreadyRegistered,
    myGuestCount,
    isFull,
    showCancelConfirm,
    setShowCancelConfirm,
    showWaitlistForm,
    setShowWaitlistForm,
    waitlistForm,
    setWaitlistForm,
    waitlistSubmitting,
    waitlistMessage,
    guestCountToAdd,
    setGuestCountToAdd,
    addGuestsSubmitting,
    addGuestsMessage,
    showPartialGuestsConfirm,
    pendingGuestAdd,
    setShowPartialGuestsConfirm,
    setPendingGuestAdd,
    removeGuestsSubmitting,
    removeGuestsMessage,
    showRemoveGuestsModal,
    setShowRemoveGuestsModal,
    removeGuestsList,
    removeGuestsListLoading,
    removeGuestsSelectedIds,
    setRemoveGuestsMessage,
    myWaitlistFriendCount,
    isOnEventWaitlist,
    eventWaitlistStatusLoading,
    reduceWaitlistSubmitting,
    reduceWaitlistMessage,
    waitlistCountToReduce,
    setWaitlistCountToReduce,
    showReduceWaitlistConfirm,
    setShowReduceWaitlistConfirm,
    showEditGuestsModal,
    setShowEditGuestsModal,
    editGuestsList,
    editGuestsLoading,
    editGuestsSubmitting,
    editGuestsMessage,
    setEditGuestsList: setEditGuestsListUpdate,
    showWaitlistSignInDialog,
    setShowWaitlistSignInDialog,
    handleCancelRegistration,
    openWaitlistForm,
    handleJoinWaitlist,
    handleAddGuestsClick,
    handlePartialGuestsConfirm,
    openRemoveGuestsModal,
    toggleRemoveGuestSelected,
    handleRemoveGuestsConfirm,
    handleReduceWaitlistClick,
    handleReduceWaitlistConfirm,
    openEditGuestsModal,
    handleSaveEditGuests,
  };
}
