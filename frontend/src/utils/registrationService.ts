import type {
  SocialEvent,
  RegistrationFormData,
  RegistrationWithEventDetails,
} from "../types/socialEvent";
import { apiFetch } from "./api";

/**
 * Get user's registrations from API with event details (requires auth).
 * When includeCancelled is true, returns all registrations including cancelled.
 * Returns [] if not logged in or on error.
 */
export async function getUserRegistrations(
  userId: string | undefined,
  options?: { includeCancelled?: boolean }
): Promise<RegistrationWithEventDetails[]> {
  if (!userId) return [];
  try {
    const url =
      options?.includeCancelled === true
        ? "/api/registrations/my-registrations?includeCancelled=true"
        : "/api/registrations/my-registrations";
    const res = await apiFetch(url);
    if (res.ok) {
      const list = await res.json();
      return Array.isArray(list) ? list : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Cancel a single registration by ID (requires auth).
 * Returns true on success, false on failure.
 */
export async function cancelUserRegistration(registrationId: string): Promise<boolean> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Register the current user for events via API (requires auth).
 * Returns { success, message }. On 401, message suggests signing in.
 */
export async function registerUserForEvents(
  events: SocialEvent[],
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string; updatedEvents?: SocialEvent[] }> {
  if (events.length === 0) {
    return { success: false, message: "No events selected." };
  }
  try {
    const res = await apiFetch("/api/registrations", {
      method: "POST",
      body: JSON.stringify({
        eventIds: events.map((e) => e.id),
        formData,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        message: data.message ?? "Registration successful!",
        updatedEvents: events,
      };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in to register." : (data.message ?? data.error ?? "Registration failed."),
    };
  } catch {
    return { success: false, message: "Could not submit registration. Please try again." };
  }
}

/**
 * Re-register the current user for one or more event IDs (e.g. after cancelling).
 * Uses the same API as registerUserForEvents. Backend will update existing cancelled row to confirmed.
 */
export async function registerUserForEventIds(
  eventIds: number[],
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string }> {
  if (eventIds.length === 0) {
    return { success: false, message: "No events selected." };
  }
  try {
    const res = await apiFetch("/api/registrations", {
      method: "POST",
      body: JSON.stringify({ eventIds, formData }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, message: data.message ?? "Registration successful!" };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in to register." : (data.message ?? data.error ?? "Registration failed."),
    };
  } catch {
    return { success: false, message: "Could not submit registration. Please try again." };
  }
}

/**
 * Join waitlist when event is full (requires auth).
 */
export async function joinWaitlist(
  eventId: number,
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiFetch("/api/registrations/waitlist", {
      method: "POST",
      body: JSON.stringify({ eventId, formData }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { success: true, message: data.message ?? "You've been added to the waitlist." };
    return {
      success: false,
      message: res.status === 401 ? "Please sign in to join the waitlist." : (data.message ?? data.error ?? "Failed to join waitlist."),
    };
  } catch {
    return { success: false, message: "Could not join waitlist. Please try again." };
  }
}

/**
 * Get user's pending payment registrations (reserved spots awaiting payment).
 */
export async function getMyPendingPayments(
  userId: string | undefined
): Promise<RegistrationWithEventDetails[]> {
  if (!userId) return [];
  try {
    const res = await apiFetch("/api/registrations/my-pending-payments");
    if (res.ok) {
      const list = await res.json();
      return Array.isArray(list) ? list : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Confirm payment for a pending_payment registration (after PayID/Stripe).
 */
export async function confirmPaymentForPendingRegistration(
  registrationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/confirm-payment`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { success: true, message: data.message ?? "Payment confirmed. Your registration is complete." };
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to confirm payment."),
    };
  } catch {
    return { success: false, message: "Could not confirm payment. Please try again." };
  }
}

/**
 * Get guest names for a registration (owner only).
 */
export async function getRegistrationGuests(
  registrationId: string
): Promise<{ guests: { id: number; name: string }[] }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/guests`);
    if (res.ok) {
      const data = await res.json();
      return { guests: data.guests ?? [] };
    }
  } catch {
    // ignore
  }
  return { guests: [] };
}

/**
 * Update guest names for a registration (owner only).
 */
export async function putRegistrationGuests(
  registrationId: string,
  guests: { id?: number; name: string }[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/guests`, {
      method: "PUT",
      body: JSON.stringify({ guests }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { success: true };
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to save."),
    };
  } catch {
    return { success: false, message: "Could not save guest names." };
  }
}

/**
 * Get pending add-guests promotion by ID (for checkout from waitlist promotion email).
 */
export async function getPendingAddGuests(
  pendingId: string
): Promise<{ registrationId: string; guestCount: number; event: { id: number; title: string; date: string; time: string; location: string; price?: number } } | null> {
  try {
    const res = await apiFetch(`/api/registrations/pending-add-guests/${pendingId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

/**
 * Add guests to an existing registration (1–10).
 */
export async function addGuestsToRegistration(
  registrationId: string,
  guestCount: number,
  options?: { pendingAddGuestsId?: string }
): Promise<{ success: boolean; message?: string; added?: number; waitlisted?: number }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/add-guests`, {
      method: "POST",
      body: JSON.stringify({ guestCount, ...(options?.pendingAddGuestsId && { pendingAddGuestsId: options.pendingAddGuestsId }) }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        added: data.added ?? 0,
        waitlisted: data.waitlisted ?? 0,
      };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to add guests."),
    };
  } catch {
    return { success: false, message: "Could not add guests. Please try again." };
  }
}

/**
 * Check if current user is on the event waitlist (new_spot - waiting for a spot).
 * Returns { onWaitlist: boolean }. Use when event is full to disable "Join waitlist" button.
 */
export async function getMyEventWaitlistStatus(eventId: number): Promise<{ onWaitlist: boolean }> {
  try {
    const res = await apiFetch(`/api/registrations/my-event-waitlist?eventId=${eventId}`);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { onWaitlist: !!data.onWaitlist };
    }
  } catch {
    // ignore
  }
  return { onWaitlist: false };
}

/**
 * Get current user's add-guests waitlist count for an event.
 */
export async function getMyAddGuestsWaitlist(eventId: number): Promise<{ count: number; registrationId?: string }> {
  try {
    const res = await apiFetch(`/api/registrations/my-add-guests-waitlist?eventId=${eventId}`);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return { count: data.count ?? 0, registrationId: data.registrationId };
    }
  } catch {
    // ignore
  }
  return { count: 0 };
}

/**
 * Reduce friends from add-guests waitlist (1–10).
 */
export async function reduceWaitlistFriends(
  registrationId: string,
  guestCount: number
): Promise<{ success: boolean; message?: string; reduced?: number }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/reduce-waitlist-friends`, {
      method: "POST",
      body: JSON.stringify({ guestCount }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true, reduced: data.reduced ?? 0 };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to reduce waitlist friends."),
    };
  } catch {
    return { success: false, message: "Could not update waitlist. Please try again." };
  }
}

/**
 * Remove friends from an existing registration by count (1–10).
 */
export async function removeGuestsToRegistration(
  registrationId: string,
  guestCount: number
): Promise<{ success: boolean; message?: string; removed?: number; promoted?: number }> {
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/remove-guests`, {
      method: "POST",
      body: JSON.stringify({ guestCount }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        removed: data.removed ?? 0,
        promoted: data.promoted ?? 0,
      };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to remove friends."),
    };
  } catch {
    return { success: false, message: "Could not remove friends. Please try again." };
  }
}

/**
 * Remove specific friends by guest IDs (e.g. from checkbox selection).
 */
export async function removeGuestsByIdsToRegistration(
  registrationId: string,
  guestIds: number[]
): Promise<{ success: boolean; message?: string; removed?: number; promoted?: number }> {
  if (!guestIds.length) return { success: false, message: "Select at least one friend to remove." };
  try {
    const res = await apiFetch(`/api/registrations/${registrationId}/remove-guests`, {
      method: "POST",
      body: JSON.stringify({ guestIds }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        removed: data.removed ?? 0,
        promoted: data.promoted ?? 0,
      };
    }
    return {
      success: false,
      message: res.status === 401 ? "Please sign in." : (data.message ?? data.error ?? "Failed to remove friends."),
    };
  } catch {
    return { success: false, message: "Could not remove friends. Please try again." };
  }
}

/**
 * Get a single event by ID (caller should use GET /api/events/:id if needed).
 * Kept for backward compatibility; prefer fetching from API in the component.
 */
export async function getEventById(
  _eventId: number
): Promise<SocialEvent | undefined> {
  try {
    const res = await apiFetch(`/api/events/${_eventId}`, { skipAuth: true });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // ignore
  }
  return undefined;
}
