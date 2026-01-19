import type { SocialEvent, Registration, RegistrationFormData } from "../types/socialEvent";
import { getOrCreateUserId } from "./userStorage";

const EVENTS_STORAGE_KEY = "chibibadminton_social_events";
const REGISTRATIONS_STORAGE_KEY = "chibibadminton_user_registrations";

// Helper to get initial events from data or local storage
export const getInitialEvents = (initialData: SocialEvent[]): SocialEvent[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (storedEvents) {
    return JSON.parse(storedEvents);
  }
  return initialData;
};

// Helper to save events to local storage
const saveEvents = (events: SocialEvent[]): void => {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
};

// Helper to get user's registrations from local storage
export const getUserRegistrations = (userId: string): Registration[] => {
  const storedRegistrations = localStorage.getItem(REGISTRATIONS_STORAGE_KEY);
  if (storedRegistrations) {
    const allRegistrations: Registration[] = JSON.parse(storedRegistrations);
    return allRegistrations.filter(reg => reg.userId === userId);
  }
  return [];
};

// Helper to save all registrations to local storage
const saveAllRegistrations = (registrations: Registration[]): void => {
  localStorage.setItem(REGISTRATIONS_STORAGE_KEY, JSON.stringify(registrations));
};

export const registerUserForEvents = (
  eventsToRegister: SocialEvent[],
  formData: RegistrationFormData,
): { success: boolean; message: string; updatedEvents: SocialEvent[] } => {
  const userId = getOrCreateUserId();
  let allEvents: SocialEvent[] = getInitialEvents([]); // Get current state of events
  let allRegistrations: Registration[] = JSON.parse(localStorage.getItem(REGISTRATIONS_STORAGE_KEY) || "[]");

  const updatedEvents: SocialEvent[] = [...allEvents];
  const newRegistrations: Registration[] = [];

  for (const eventToRegister of eventsToRegister) {
    const eventIndex = updatedEvents.findIndex((e) => e.id === eventToRegister.id);

    if (eventIndex === -1) {
      console.error(`Event with ID ${eventToRegister.id} not found.`);
      continue;
    }

    const event = { ...updatedEvents[eventIndex] }; // Create a copy to modify

    // Check if user is already registered for this specific event
    const isAlreadyRegistered = allRegistrations.some(
      (reg) => reg.userId === userId && reg.eventId === event.id && reg.status === "confirmed"
    );

    if (isAlreadyRegistered) {
      console.warn(`User ${userId} is already registered for event ${event.id}. Skipping.`);
      continue;
    }

    // Check capacity
    if (event.currentAttendees >= event.maxCapacity) {
      return {
        success: false,
        message: `Event '${event.title}' is full.`,
        updatedEvents: allEvents, // Return original events if any event is full
      };
    }

    // Update event attendees and status
    event.currentAttendees += 1;
    if (event.currentAttendees >= event.maxCapacity) {
      event.status = "full";
    }
    updatedEvents[eventIndex] = event; // Update the event in the copied array

    // Create a new registration entry
    const newRegistration: Registration = {
      eventId: event.id,
      userId: userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      registrationDate: new Date().toISOString(),
      status: "confirmed", // Assuming immediate confirmation for frontend demo
    };
    newRegistrations.push(newRegistration);
  }

  // Save updated events and new registrations
  saveEvents(updatedEvents);
  saveAllRegistrations([...allRegistrations, ...newRegistrations]);

  return {
    success: true,
    message: "Registration successful!",
    updatedEvents: updatedEvents,
  };
};

// Function to get a single event by ID
export const getEventById = (eventId: number): SocialEvent | undefined => {
  const allEvents: SocialEvent[] = getInitialEvents([]);
  return allEvents.find(event => event.id === eventId);
};
