/**
 * Payment controller for Stripe checkout sessions and payment CRUD.
 */
import type { Request, Response, NextFunction } from 'express';
import {
  createPlayCheckoutSession,
  createAddGuestsCheckoutSession,
  createWaitlistCheckoutSession,
  createShopCheckoutSession,
  type PlayCheckoutItem,
  type ShopCheckoutItem,
} from '../services/stripeService.js';
import {
  findAll,
  findById,
  updateStatus,
  deletePayment,
  type PaymentStatus,
} from '../services/paymentService.js';
import { createError } from '../middleware/errorHandler.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export const createPlayCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw createError('Authentication required', 401);
    }

    const { items, pendingRegistrationIds } = req.body as {
      items: PlayCheckoutItem[];
      pendingRegistrationIds?: string[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError('Items are required', 400);
    }

    const result = await createPlayCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      items,
      pendingRegistrationIds,
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddGuestsCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw createError('Authentication required', 401);
    }

    const { registrationId, eventId, eventTitle, guestCount, pricePerGuest, pendingAddGuestsId } = req.body;

    if (!registrationId || !eventId || !eventTitle || !guestCount || pricePerGuest === undefined) {
      throw createError('Missing required fields', 400);
    }

    const result = await createAddGuestsCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      data: {
        registrationId,
        eventId: Number(eventId),
        eventTitle,
        guestCount: Number(guestCount),
        pricePerGuest: Number(pricePerGuest),
        pendingAddGuestsId,
      },
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

export const createWaitlistCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw createError('Authentication required', 401);
    }

    const { pendingWaitlistId, eventId, eventTitle, price } = req.body;

    if (!pendingWaitlistId || !eventId || !eventTitle || price === undefined) {
      throw createError('Missing required fields', 400);
    }

    const result = await createWaitlistCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      data: {
        pendingWaitlistId,
        eventId: Number(eventId),
        eventTitle,
        price: Number(price),
      },
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

export const createShopCheckout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      throw createError('Authentication required', 401);
    }

    const { items } = req.body as {
      items: ShopCheckoutItem[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError('Items are required', 400);
    }

    const result = await createShopCheckoutSession({
      userId: user.id,
      userEmail: user.email,
      items,
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
      paymentId: result.paymentId,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw createError('Admin access required', 403);
    }

    const payments = await findAll();
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw createError('Admin access required', 403);
    }

    const { id } = req.params;
    const payment = await findById(id);

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw createError('Admin access required', 403);
    }

    const { id } = req.params;
    const { status } = req.body as { status: PaymentStatus };

    if (!status || !['pending', 'completed', 'failed', 'refunded', 'expired', 'disputed', 'requires_action'].includes(status)) {
      throw createError('Invalid status', 400);
    }

    const payment = await updateStatus(id, status);

    if (!payment) {
      throw createError('Payment not found', 404);
    }

    res.json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

export const deletePaymentRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      throw createError('Admin access required', 403);
    }

    const { id } = req.params;
    const deleted = await deletePayment(id);

    if (!deleted) {
      throw createError('Payment not found', 404);
    }

    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    next(error);
  }
};
