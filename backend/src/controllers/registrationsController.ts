import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getUserRegistrations as getUserRegistrationsService,
  getRegistrationsWithEventDetails,
  registerForEvents as registerForEventsService,
  cancelRegistration as cancelRegistrationService,
  getEventRegistrations as getEventRegistrationsService,
  getMyPendingPaymentRegistrations,
  confirmPaymentForPendingRegistration,
  getPendingAddGuestsById,
  addGuestsToRegistration as addGuestsToRegistrationService,
  removeGuestsFromRegistration as removeGuestsFromRegistrationService,
} from '../services/registrationService.js';
import {
  joinWaitlist as joinWaitlistService,
  getMyAddGuestsWaitlistEntry,
  getMyEventWaitlistStatus as getMyEventWaitlistStatusService,
  reduceAddGuestsWaitlist as reduceAddGuestsWaitlistService,
} from '../services/waitlistService.js';
import {
  getRegistrationByEventAndUser,
  getRegistrationById,
} from '../services/registrationService.js';
import { getEventById } from '../services/eventService.js';
import { sendWaitlistFriendsUpdateConfirmationEmail, sendRemoveGuestsConfirmationEmail } from '../utils/email.js';
import { createError } from '../middleware/errorHandler.js';
import type { RegistrationFormData } from '../types/index.js';

export const getUserRegistrations = async (
  req: AuthRequest<object, object, object, { includeCancelled?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const includeCancelled = req.query.includeCancelled === 'true';
    const registrations = includeCancelled
      ? await getRegistrationsWithEventDetails(req.userId, true)
      : await getRegistrationsWithEventDetails(req.userId, false);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (
  req: AuthRequest<{ eventId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      throw createError('Invalid event ID', 400);
    }

    const registrations = await getEventRegistrationsService(eventId);
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const registerForEvents = async (
  req: AuthRequest<{}, {}, { eventIds: number[]; formData: RegistrationFormData; guestCount?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { eventIds, formData, guestCount } = req.body;

    if (!eventIds || !Array.isArray(eventIds) || eventIds.length === 0) {
      throw createError('Event IDs are required', 400);
    }

    const result = await registerForEventsService(req.userId, eventIds, formData, { guestCount });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (
  req: AuthRequest<{ registrationId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { registrationId } = req.params;
    const success = await cancelRegistrationService(req.userId, registrationId);

    if (!success) {
      throw createError('Registration not found or unauthorized', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const joinWaitlist = async (
  req: AuthRequest<{}, {}, { eventId: number; formData: RegistrationFormData }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const { eventId, formData } = req.body;
    if (!eventId || !formData) {
      throw createError('eventId and formData are required', 400);
    }

    const result = await joinWaitlistService(req.userId, eventId, formData);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyPendingPayments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const list = await getMyPendingPaymentRegistrations(req.userId);
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getPendingAddGuests = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const pendingId = req.params.id;
    if (!pendingId) {
      throw createError('Pending ID is required', 400);
    }

    const details = await getPendingAddGuestsById(req.userId, pendingId);
    if (!details) {
      throw createError('Pending add-guests not found or expired', 404);
    }

    res.json(details);
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const registrationId = req.params.id;
    const success = await confirmPaymentForPendingRegistration(registrationId);

    if (!success) {
      throw createError('Registration not found or already confirmed', 404);
    }

    res.json({ success: true, message: 'Payment confirmed. Your registration is complete.' });
  } catch (error) {
    next(error);
  }
};

export const addGuestsToRegistration = async (
  req: AuthRequest<{ id: string }, {}, { guestCount: number; pendingAddGuestsId?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const registrationId = req.params.id;
    const guestCount = req.body?.guestCount ?? 0;
    const pendingAddGuestsId = req.body?.pendingAddGuestsId;

    if (!registrationId || guestCount < 1 || guestCount > 10) {
      throw createError('Valid registration ID and guestCount (1-10) are required', 400);
    }

    const result = await addGuestsToRegistrationService(req.userId, registrationId, guestCount, {
      pendingAddGuestsId: pendingAddGuestsId || undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const removeGuestsFromRegistration = async (
  req: AuthRequest<{ id: string }, {}, { guestCount: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const registrationId = req.params.id;
    const guestCount = req.body?.guestCount ?? 0;

    if (!registrationId || guestCount < 1 || guestCount > 10) {
      throw createError('Valid registration ID and guestCount (1-10) are required', 400);
    }

    const result = await removeGuestsFromRegistrationService(req.userId, registrationId, guestCount);
    const registration = await getRegistrationById(registrationId);
    if (registration?.email && result.removed) {
      const event = await getEventById(registration.eventId);
      if (event) {
        await sendRemoveGuestsConfirmationEmail(
          registration.email,
          event.title,
          `${event.date} ${event.time}`,
          result.removed,
          result.promoted ?? 0,
          registration.name
        );
      }
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyAddGuestsWaitlist = async (
  req: AuthRequest<object, object, object, { eventId?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const eventId = parseInt(req.query.eventId as string);
    if (isNaN(eventId)) {
      throw createError('Valid eventId is required', 400);
    }

    const reg = await getRegistrationByEventAndUser(eventId, req.userId);
    if (!reg || !reg.id) {
      res.json({ count: 0 });
      return;
    }

    const entry = await getMyAddGuestsWaitlistEntry(req.userId, eventId, reg.id);
    if (!entry) {
      res.json({ count: 0 });
      return;
    }

    res.json({ count: entry.count, registrationId: reg.id });
  } catch (error) {
    next(error);
  }
};

export const getMyEventWaitlistStatus = async (
  req: AuthRequest<object, object, object, { eventId?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const eventId = parseInt(req.query.eventId as string);
    if (isNaN(eventId)) {
      throw createError('Valid eventId is required', 400);
    }

    const onWaitlist = await getMyEventWaitlistStatusService(req.userId, eventId);
    res.json({ onWaitlist });
  } catch (error) {
    next(error);
  }
};

export const reduceWaitlistFriends = async (
  req: AuthRequest<{ id: string }, {}, { guestCount: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      throw createError('User ID not found', 401);
    }

    const registrationId = req.params.id;
    const guestCount = req.body?.guestCount ?? 0;

    if (!registrationId || guestCount < 1 || guestCount > 10) {
      throw createError('Valid registration ID and guestCount (1-10) are required', 400);
    }

    const registration = await getRegistrationById(registrationId);
    if (!registration || registration.userId !== req.userId) {
      throw createError('Registration not found or unauthorized', 404);
    }

    const result = await reduceAddGuestsWaitlistService(
      req.userId,
      registrationId,
      registration.eventId,
      guestCount
    );
    const event = await getEventById(registration.eventId);
    if (event && registration.email && result.reduced) {
      await sendWaitlistFriendsUpdateConfirmationEmail(
        registration.email,
        event.title,
        `${event.date} ${event.time}`,
        result.reduced,
        registration.name
      );
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};
