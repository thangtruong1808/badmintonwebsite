import type { SocialEvent } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';

// In-memory storage (replace with database later)
// This should be initialized with data from the frontend's socialEvents.ts
let events: SocialEvent[] = [];

export const initializeEvents = (initialEvents: SocialEvent[]): void => {
  events = [...initialEvents];
};

export const getAllEvents = async (): Promise<SocialEvent[]> => {
  return [...events];
};

export const getEventById = async (eventId: number): Promise<SocialEvent | null> => {
  const event = events.find((e) => e.id === eventId);
  return event || null;
};

export const createEvent = async (eventData: Omit<SocialEvent, 'id'>): Promise<SocialEvent> => {
  const newId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
  const newEvent: SocialEvent = {
    ...eventData,
    id: newId,
  };
  events.push(newEvent);
  return newEvent;
};

export const updateEvent = async (
  eventId: number,
  updates: Partial<SocialEvent>
): Promise<SocialEvent | null> => {
  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) {
    return null;
  }

  events[eventIndex] = { ...events[eventIndex], ...updates };
  
  // Update status based on capacity
  if (events[eventIndex].currentAttendees >= events[eventIndex].maxCapacity) {
    events[eventIndex].status = 'full';
  } else if (events[eventIndex].status === 'full') {
    events[eventIndex].status = 'available';
  }

  return events[eventIndex];
};

export const deleteEvent = async (eventId: number): Promise<boolean> => {
  const eventIndex = events.findIndex((e) => e.id === eventId);
  if (eventIndex === -1) {
    return false;
  }

  events.splice(eventIndex, 1);
  return true;
};

export const incrementEventAttendees = async (eventId: number): Promise<SocialEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) {
    return null;
  }

  if (event.currentAttendees >= event.maxCapacity) {
    throw createError('Event is full', 400);
  }

  return await updateEvent(eventId, {
    currentAttendees: event.currentAttendees + 1,
  });
};

export const decrementEventAttendees = async (eventId: number): Promise<SocialEvent | null> => {
  const event = await getEventById(eventId);
  if (!event) {
    return null;
  }

  if (event.currentAttendees <= 0) {
    return event;
  }

  return await updateEvent(eventId, {
    currentAttendees: event.currentAttendees - 1,
  });
};
