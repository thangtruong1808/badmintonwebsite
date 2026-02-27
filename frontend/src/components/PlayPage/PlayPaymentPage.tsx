import React, { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaCheckCircle, FaExclamationCircle, FaUser, FaEnvelope, FaPhone, FaCoins, FaMoneyBillWave, FaExchangeAlt, FaSpinner } from "react-icons/fa";
import { getCurrentUser } from "../../utils/mockAuth";
import { registerUserForEvents, getMyPendingPayments, confirmPaymentForPendingRegistration, addGuestsToRegistration, confirmWaitlistPayment } from "../../utils/registrationService";
import { selectAuthInitialized } from "../../store/authSlice";
import { canUsePointsForBooking, formatPoints } from "../../utils/rewardPoints";
import { usePointsForBooking } from "../../utils/rewardPointsService";
import { clearCart } from "../../utils/cartStorage";
import {
  createPlayCheckoutSession,
  createAddGuestsCheckoutSession,
  createWaitlistCheckoutSession,
  redirectToStripeCheckout,
} from "../../utils/paymentService";
import { isStripeConfigured } from "../../utils/stripe";
import type { SocialEvent } from "../../types/socialEvent";

const PlayPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const pendingId = searchParams.get("pending") ?? undefined;
  const state = location.state as {
    events?: SocialEvent[];
    addGuestsContext?: {
      registrationId: string;
      guestCount: number;
      event: SocialEvent;
      guestCountTotal?: number;
      pendingAddGuestsId?: string;
    };
    waitlistContext?: { event: SocialEvent; pendingId: string };
  } | null;
  const addGuestsContext = state?.addGuestsContext;
  const waitlistContext = state?.waitlistContext;
  const eventsFromState: SocialEvent[] = state?.events ?? [];
  const user = getCurrentUser();
  const authInitialized = useSelector(selectAuthInitialized);

  const [pendingRegistration, setPendingRegistration] = useState<{
    id: string;
    eventId: number;
    eventTitle: string;
    eventDate: string;
    eventTime?: string;
    eventLocation?: string;
    price?: number;
  } | null>(null);
  const [pendingLoading, setPendingLoading] = useState(!!pendingId);

  useEffect(() => {
    if (!pendingId) {
      setPendingLoading(false);
      return;
    }
    if (!authInitialized) return;
    if (!user?.id) {
      setPendingLoading(false);
      navigate("/signin", { state: { from: `/play/payment?pending=${pendingId}` } });
      return;
    }
    getMyPendingPayments(user.id).then((list) => {
      const found = list.find((r) => r.id === pendingId);
      if (found && found.eventId && found.eventTitle && found.eventDate) {
        setPendingRegistration({
          id: found.id!,
          eventId: found.eventId,
          eventTitle: found.eventTitle,
          eventDate: found.eventDate,
          eventTime: found.eventTime ?? undefined,
          eventLocation: found.eventLocation ?? undefined,
          price: (found as { eventPrice?: number }).eventPrice,
        });
      }
      setPendingLoading(false);
    }).catch(() => setPendingLoading(false));
  }, [pendingId, user?.id, authInitialized, navigate]);

  const events: SocialEvent[] = waitlistContext
    ? [waitlistContext.event]
    : pendingRegistration
      ? [{
          id: pendingRegistration.eventId,
          title: pendingRegistration.eventTitle,
          date: pendingRegistration.eventDate,
          time: pendingRegistration.eventTime ?? "",
          dayOfWeek: "",
          location: pendingRegistration.eventLocation ?? "",
          description: "",
          maxCapacity: 0,
          currentAttendees: 0,
          price: pendingRegistration.price,
          status: "available",
          category: "regular",
        } as SocialEvent]
      : addGuestsContext
        ? (() => {
            const e = addGuestsContext.event;
            const pricePer = Number(e.price ?? 0);
            const totalToCharge = addGuestsContext.guestCountTotal ?? addGuestsContext.guestCount;
            return Array.from({ length: totalToCharge }, () => ({
              ...e,
              id: e.id,
              title: e.title,
              price: pricePer,
            })) as SocialEvent[];
          })()
        : eventsFromState;

  const [formData, setFormData] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "points" | "mixed">("stripe");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: `${user.firstName} ${user.lastName}`.trim() || prev.name,
        email: user.email ?? prev.email,
        phone: user.phone ?? prev.phone,
      }));
    }
  }, [user]);

  const totalPrice = events.reduce((sum, e) => sum + Number(e.price ?? 0), 0);
  const userPoints = user?.rewardPoints ?? 0;
  const canPayWithPoints = canUsePointsForBooking(totalPrice, userPoints);

  if (pendingLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent" />
          <p className="text-gray-600 font-calibri">Loading…</p>
        </div>
      </div>
    );
  }

  if (events.length === 0 && !addGuestsContext && !waitlistContext && !submitStatus.type) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 font-calibri mb-4">No sessions selected</h1>
          <p className="text-gray-600 font-calibri mb-6">Please select sessions from the play page or use the payment link from your profile.</p>
          <button
            onClick={() => navigate("/play")}
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            Back to Play Sessions
          </button>
        </div>
      </div>
    );
  }

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) err.email = "Invalid email";
    if (!formData.phone.trim()) err.phone = "Phone is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (user) {
        setSubmitStatus({ type: "error", message: "Your profile is missing name, email or phone. Please update your profile." });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const isAddGuestsFlow = !!addGuestsContext;
      const isWaitlistFlow = !!waitlistContext;

      // Handle Stripe payment - redirect to Stripe Checkout
      if (paymentMethod === "stripe" && isStripeConfigured()) {
        if (isWaitlistFlow && waitlistContext) {
          const result = await createWaitlistCheckoutSession({
            pendingWaitlistId: waitlistContext.pendingId,
            eventId: waitlistContext.event.id,
            eventTitle: waitlistContext.event.title,
            price: Number(waitlistContext.event.price ?? 0),
          });
          redirectToStripeCheckout(result.checkoutUrl);
          return;
        } else if (isAddGuestsFlow && addGuestsContext) {
          const result = await createAddGuestsCheckoutSession({
            registrationId: addGuestsContext.registrationId,
            eventId: addGuestsContext.event.id,
            eventTitle: addGuestsContext.event.title,
            guestCount: addGuestsContext.guestCountTotal ?? addGuestsContext.guestCount,
            pricePerGuest: Number(addGuestsContext.event.price ?? 0),
            pendingAddGuestsId: addGuestsContext.pendingAddGuestsId,
          });
          redirectToStripeCheckout(result.checkoutUrl);
          return;
        } else if (pendingRegistration) {
          const result = await createPlayCheckoutSession(
            [{
              eventId: pendingRegistration.eventId,
              eventTitle: pendingRegistration.eventTitle,
              price: pendingRegistration.price ?? 0,
            }],
            [pendingRegistration.id]
          );
          redirectToStripeCheckout(result.checkoutUrl);
          return;
        } else {
          const items = events.map((ev) => ({
            eventId: ev.id,
            eventTitle: ev.title,
            price: Number(ev.price ?? 0),
          }));
          const result = await createPlayCheckoutSession(items);
          redirectToStripeCheckout(result.checkoutUrl);
          return;
        }
      }

      // Handle points or mixed payment
      if (!pendingRegistration && !isWaitlistFlow && user && (paymentMethod === "points" || paymentMethod === "mixed")) {
        const pts = paymentMethod === "points" ? totalPrice : pointsToUse;
        const eventId = isAddGuestsFlow ? addGuestsContext!.event.id : events[0].id;
        if (pts > 0) {
          const ok = await usePointsForBooking(user.id, eventId, pts);
          if (!ok) {
            setSubmitStatus({ type: "error", message: "Failed to process points. Please try again." });
            setIsSubmitting(false);
            return;
          }
        }
      }

      if (isWaitlistFlow && waitlistContext) {
        const result = await confirmWaitlistPayment(waitlistContext.pendingId);
        if (!result.success) {
          setSubmitStatus({ type: "error", message: result.message ?? "Failed to join waitlist. Please try again." });
          setIsSubmitting(false);
          return;
        }
        setSubmitStatus({
          type: "success",
          message: result.message ?? "You've been added to the waitlist. We'll notify you when a spot opens!",
        });
      } else if (isAddGuestsFlow && addGuestsContext) {
        const totalToAdd = addGuestsContext.guestCountTotal ?? addGuestsContext.guestCount;
        const result = await addGuestsToRegistration(addGuestsContext.registrationId, totalToAdd, {
          pendingAddGuestsId: addGuestsContext.pendingAddGuestsId,
        });
        if (!result.success) {
          setSubmitStatus({ type: "error", message: result.message ?? "Failed to add friends. Please try again." });
          setIsSubmitting(false);
          return;
        }
        const added = result.added ?? 0;
        const waitlisted = result.waitlisted ?? 0;
        const msg =
          added > 0 && waitlisted > 0
            ? `${added} friend${added !== 1 ? "s" : ""} added to your registration. ${waitlisted} friend${waitlisted !== 1 ? "s" : ""} on the waitlist. We'll notify you when a spot opens!`
            : added > 0
              ? `Successfully added ${added} friend${added !== 1 ? "s" : ""} to your registration!`
              : waitlisted > 0
                ? `${waitlisted} friend${waitlisted !== 1 ? "s" : ""} added to the waitlist. We'll notify you when a spot opens!`
                : "Done.";
        setSubmitStatus({ type: "success", message: msg });
      } else if (pendingRegistration) {
        const result = await confirmPaymentForPendingRegistration(pendingRegistration.id);
        if (!result.success) {
          setSubmitStatus({ type: "error", message: result.message });
          setIsSubmitting(false);
          return;
        }
        setSubmitStatus({
          type: "success",
          message: "Payment confirmed! Your registration is complete.",
        });
      } else {
        const result = await registerUserForEvents(events, formData);
        if (!result.success) {
          setSubmitStatus({ type: "error", message: result.message });
          setIsSubmitting(false);
          return;
        }

        setSubmitStatus({
          type: "success",
          message: `Successfully registered for ${events.length} session${events.length !== 1 ? "s" : ""}!`,
        });
      }
      clearCart();
      setTimeout(() => navigate("/profile"), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitStatus({ type: "error", message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-gray-900 font-huglove mb-6 text-center">
          Payment
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {waitlistContext && (
            <div className="p-4 bg-rose-50 border-b border-rose-200">
              <p className="text-rose-800 font-calibri text-sm font-medium">
                Complete payment to join the waitlist. You will be added to the waitlist and we will notify you when a spot opens.
              </p>
            </div>
          )}
          {addGuestsContext && (
            <div className="p-4 bg-rose-50 border-b border-rose-200">
              <p className="text-rose-800 font-calibri text-sm font-medium">
                Adding {addGuestsContext.guestCount} friend{addGuestsContext.guestCount !== 1 ? "s" : ""} to your registration.
              </p>
            </div>
          )}
          {pendingRegistration && !addGuestsContext && !waitlistContext && (
            <div className="p-4 bg-amber-50 border-b border-amber-200">
              <p className="text-amber-800 font-calibri text-sm font-medium">
                A spot opened for you! Complete payment within 24 hours to confirm your registration.
              </p>
            </div>
          )}
          <div className="p-6 space-y-4 border-b border-gray-200">
            {events.map((e, i) => (
              <div key={addGuestsContext ? `add-guest-${e.id}-${i}` : e.id} className="text-gray-700 font-calibri text-lg">
                <p className="font-medium text-gray-900 font-calibri text-lg">{e.title}</p>
                <p className="text-gray-600 font-calibri text-lg">{formatDate(e.date)} - {e.time} </p>
                <p className="text-gray-600 font-calibri text-lg">{e.location}</p>
                {e.price != null && <p className="text-rose-600 font-calibri text-lg">${e.price}</p>}
              </div>
            ))}
            <p className="text-lg text-gray-900 font-calibri">Total: ${Number(totalPrice).toFixed(2)}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 font-calibri">
            {user ? (
              <div className="space-y-4">
                <div>
                  <p className="block font-medium text-gray-700 mb-1">
                    <FaUser className="inline mr-2" size={14} /> Full Name
                  </p>
                  <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{formData.name || "—"}</p>
                </div>
                <div>
                  <p className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
                    <FaEnvelope className="inline mr-2" size={14} /> Email
                  </p>
                  <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{formData.email || "—"}</p>
                </div>
                <div>
                  <p className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
                    <FaPhone className="inline mr-2" size={14} /> Phone
                  </p>
                  <p className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{formData.phone || "—"}</p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    <FaUser className="inline mr-2" size={14} /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Full name"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
                    <FaEnvelope className="inline mr-2" size={14} /> Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Email"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1 font-calibri text-lg">
                    <FaPhone className="inline mr-2" size={14} /> Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? "border-red-500" : "border-gray-300"}`}
                    placeholder="Phone"
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                </div>
              </>
            )}

            {totalPrice > 0 && user && (
              <div>
                <label className="block font-medium text-gray-700 mb-2 font-calibri text-lg">Payment method</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod("stripe"); setPointsToUse(0); }}
                    className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "stripe" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                  >
                    <FaMoneyBillWave className="text-rose-500" size={20} />
                    <span>Card (Stripe) - ${Number(totalPrice).toFixed(2)}</span>
                  </button>
                  {canPayWithPoints && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("points"); setPointsToUse(totalPrice); }}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "points" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                    >
                      <FaCoins className="text-rose-500" size={20} />
                      <span>Points - {formatPoints(totalPrice)} (You have {formatPoints(userPoints)})</span>
                    </button>
                  )}
                  {userPoints > 0 && userPoints < totalPrice && (
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod("mixed"); setPointsToUse(userPoints); }}
                      className={`w-full flex items-center gap-3 p-3 border-2 rounded-lg text-left ${paymentMethod === "mixed" ? "border-rose-500 bg-rose-50" : "border-gray-300"}`}
                    >
                      <FaExchangeAlt className="text-rose-500" size={20} />
                      <span>Mixed - {formatPoints(userPoints)} pts + ${Number(totalPrice - userPoints).toFixed(2)} card</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {submitStatus.type && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                {submitStatus.type === "success" ? <FaCheckCircle className="flex-shrink-0 mt-0.5" size={20} /> : <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={20} />}
                <div>
                  <p className="font-medium text-sm font-calibri">{submitStatus.message}</p>
                  {submitStatus.type === "success" && (
                    <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full" aria-hidden />
                      Redirecting you to the play…
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (pendingRegistration) navigate("/profile");
                  else if (waitlistContext) navigate(`/play/checkout?pendingWaitlist=${waitlistContext.pendingId}`, { state: { waitlistContext, events } });
                  else if (addGuestsContext) navigate("/play/checkout", { state: { addGuestsContext, events } });
                  else navigate("/play/checkout", { state: { events } });
                }}
                disabled={submitStatus.type === "success"}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 font-calibri disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || submitStatus.type === "success"}
                className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-calibri disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><FaSpinner className="animate-spin h-4 w-4 flex-shrink-0" /><span>Processing…</span></> : pendingRegistration ? "Confirm payment" : waitlistContext ? "Join waitlist and pay" : addGuestsContext ? "Add friends and complete" : "Complete registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlayPaymentPage;
