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
