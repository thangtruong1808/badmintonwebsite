import { v4 as uuidv4 } from 'uuid';
import type { Registration, RegistrationFormData } from '../types/index.js';
import { createError } from '../middleware/errorHandler.js';
import {
  getEventById,
  incrementEventAttendees,
  decrementEventAttendees,
} from './eventService.js';
import { getUserById } from './userService.js';

// In-memory storage (replace with database later)
let registrations: Registration[] = [];

export const getUserRegistrations = async (userId: string): Promise<Registration[]> => {
  return registrations.filter((reg) => reg.userId === userId && reg.status !== 'cancelled');
};

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  return registrations.filter((reg) => reg.eventId === eventId && reg.status !== 'cancelled');
};

export const registerForEvents = async (
  userId: string,
  eventIds: number[],
  formData: RegistrationFormData
): Promise<{ success: boolean; message: string; registrations: Registration[] }> => {
  // Verify user exists
  const user = await getUserById(userId);
  if (!user) {
    throw createError('User not found', 404);
  }

  const newRegistrations: Registration[] = [];

  // Register for each event
  for (const eventId of eventIds) {
    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw createError(`Event with ID ${eventId} not found`, 404);
    }

    // Check if user is already registered
    const existingRegistration = registrations.find(
      (reg) =>
        reg.userId === userId &&
        reg.eventId === eventId &&
        reg.status === 'confirmed'
    );

    if (existingRegistration) {
      continue; // Skip if already registered
    }

    // Check capacity
    if (event.currentAttendees >= event.maxCapacity) {
      throw createError(`Event '${event.title}' is full`, 400);
    }

    // Create registration
    const registration: Registration = {
      id: uuidv4(),
      eventId,
      userId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      attendanceStatus: 'upcoming',
    };

    registrations.push(registration);
    newRegistrations.push(registration);

    // Increment event attendees
    await incrementEventAttendees(eventId);
  }

  return {
    success: true,
    message: 'Registration successful!',
    registrations: newRegistrations,
  };
};

export const cancelRegistration = async (
  userId: string,
  registrationId: string
): Promise<boolean> => {
  const registrationIndex = registrations.findIndex(
    (reg) => reg.id === registrationId && reg.userId === userId
  );

  if (registrationIndex === -1) {
    return false;
  }

  const registration = registrations[registrationIndex];

  // Decrement event attendees
  await decrementEventAttendees(registration.eventId);

  // Cancel registration
  registration.status = 'cancelled';
  registrations[registrationIndex] = registration;

  return true;
};

export const getRegistrationById = async (registrationId: string): Promise<Registration | null> => {
  const registration = registrations.find((reg) => reg.id === registrationId);
  return registration || null;
};

export const getRegistrationByEventAndUser = async (
  eventId: number,
  userId: string
): Promise<Registration | null> => {
  const registration = registrations.find(
    (reg) => reg.eventId === eventId && reg.userId === userId && reg.status === 'confirmed'
  );
  return registration || null;
};

export const getRegistrationsCount = async (): Promise<number> => {
  return registrations.filter((reg) => reg.status !== 'cancelled').length;
};
