/**
 * Stripe service for creating checkout sessions.
 * Handles Play (registrations, add-guests, waitlist) and Shop (product purchases) flows.
 */
import { stripe, STRIPE_CURRENCY, isStripeConfigured } from '../utils/stripe.js';
import { create as createPayment } from './paymentService.js';
import { getEventById } from './eventService.js';
import { createError } from '../middleware/errorHandler.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export type CheckoutType = 'play' | 'addGuests' | 'waitlist' | 'shop';

export interface PlayCheckoutItem {
  eventId: number;
  eventTitle: string;
  price: number;
  quantity?: number;
}

export interface AddGuestsCheckoutData {
  registrationId: string;
  eventId: number;
  eventTitle: string;
  guestCount: number;
  pricePerGuest: number;
  pendingAddGuestsId?: string;
}

export interface WaitlistCheckoutData {
  pendingWaitlistId: string;
  eventId: number;
  eventTitle: string;
  price: number;
}

export interface ShopCheckoutItem {
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CreatePlayCheckoutSessionParams {
  userId: string;
  userEmail: string;
  items: PlayCheckoutItem[];
  pendingRegistrationIds?: string[];
}

export interface CreateAddGuestsCheckoutSessionParams {
  userId: string;
  userEmail: string;
  data: AddGuestsCheckoutData;
}

export interface CreateWaitlistCheckoutSessionParams {
  userId: string;
  userEmail: string;
  data: WaitlistCheckoutData;
}

export interface CreateShopCheckoutSessionParams {
  userId: string;
  userEmail: string;
  items: ShopCheckoutItem[];
  shippingAddress?: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface CheckoutSessionResult {
  sessionId: string;
  checkoutUrl: string;
  paymentId: string;
}

export const createPlayCheckoutSession = async (
  params: CreatePlayCheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  if (!isStripeConfigured() || !stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const { userId, userEmail, items, pendingRegistrationIds = [] } = params;

  if (items.length === 0) {
    throw createError('No items provided for checkout', 400);
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const eventIds = items.map((item) => item.eventId);

  const payment = await createPayment({
    userId,
    amount: totalAmount,
    currency: STRIPE_CURRENCY.toUpperCase(),
    status: 'pending',
    paymentMethod: 'stripe',
    metadata: {
      type: 'play',
      eventIds,
      pendingRegistrationIds,
    },
  });

  const lineItems = items.map((item) => ({
    price_data: {
      currency: STRIPE_CURRENCY,
      product_data: {
        name: item.eventTitle,
        description: `Registration for ${item.eventTitle}`,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity || 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: lineItems,
    metadata: {
      type: 'play',
      paymentId: payment.id,
      userId,
      eventIds: JSON.stringify(eventIds),
      pendingRegistrationIds: JSON.stringify(pendingRegistrationIds),
    },
    success_url: `${FRONTEND_URL}/play/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/play/payment/cancel`,
  });

  // Update payment with checkout session ID
  const pool = (await import('../db/connection.js')).default;
  await pool.execute(
    'UPDATE payments SET stripe_checkout_session_id = ? WHERE id = ?',
    [session.id, payment.id]
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url!,
    paymentId: payment.id,
  };
};

export const createAddGuestsCheckoutSession = async (
  params: CreateAddGuestsCheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  if (!isStripeConfigured() || !stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const { userId, userEmail, data } = params;
  const totalAmount = data.pricePerGuest * data.guestCount;

  const payment = await createPayment({
    userId,
    amount: totalAmount,
    currency: STRIPE_CURRENCY.toUpperCase(),
    status: 'pending',
    paymentMethod: 'stripe',
    metadata: {
      type: 'addGuests',
      registrationId: data.registrationId,
      eventId: data.eventId,
      guestCount: data.guestCount,
      pendingAddGuestsId: data.pendingAddGuestsId,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: {
            name: `Add ${data.guestCount} friend(s) to ${data.eventTitle}`,
            description: `Adding friends to registration for ${data.eventTitle}`,
          },
          unit_amount: Math.round(data.pricePerGuest * 100),
        },
        quantity: data.guestCount,
      },
    ],
    metadata: {
      type: 'addGuests',
      paymentId: payment.id,
      userId,
      registrationId: data.registrationId,
      eventId: String(data.eventId),
      guestCount: String(data.guestCount),
      pendingAddGuestsId: data.pendingAddGuestsId || '',
    },
    success_url: `${FRONTEND_URL}/play/payment/success?session_id={CHECKOUT_SESSION_ID}&type=addGuests`,
    cancel_url: `${FRONTEND_URL}/play/payment/cancel`,
  });

  const pool = (await import('../db/connection.js')).default;
  await pool.execute(
    'UPDATE payments SET stripe_checkout_session_id = ? WHERE id = ?',
    [session.id, payment.id]
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url!,
    paymentId: payment.id,
  };
};

export const createWaitlistCheckoutSession = async (
  params: CreateWaitlistCheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  if (!isStripeConfigured() || !stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const { userId, userEmail, data } = params;

  const payment = await createPayment({
    userId,
    amount: data.price,
    currency: STRIPE_CURRENCY.toUpperCase(),
    status: 'pending',
    paymentMethod: 'stripe',
    metadata: {
      type: 'waitlist',
      pendingWaitlistId: data.pendingWaitlistId,
      eventId: data.eventId,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: STRIPE_CURRENCY,
          product_data: {
            name: `Waitlist - ${data.eventTitle}`,
            description: `Join waitlist for ${data.eventTitle}`,
          },
          unit_amount: Math.round(data.price * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      type: 'waitlist',
      paymentId: payment.id,
      userId,
      pendingWaitlistId: data.pendingWaitlistId,
      eventId: String(data.eventId),
    },
    success_url: `${FRONTEND_URL}/play/payment/success?session_id={CHECKOUT_SESSION_ID}&type=waitlist`,
    cancel_url: `${FRONTEND_URL}/play/payment/cancel`,
  });

  const pool = (await import('../db/connection.js')).default;
  await pool.execute(
    'UPDATE payments SET stripe_checkout_session_id = ? WHERE id = ?',
    [session.id, payment.id]
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url!,
    paymentId: payment.id,
  };
};

export const createShopCheckoutSession = async (
  params: CreateShopCheckoutSessionParams
): Promise<CheckoutSessionResult> => {
  if (!isStripeConfigured() || !stripe) {
    throw createError('Stripe is not configured', 500);
  }

  const { userId, userEmail, items } = params;

  if (items.length === 0) {
    throw createError('No items provided for checkout', 400);
  }

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productIds = items.map((item) => item.productId);

  const payment = await createPayment({
    userId,
    amount: totalAmount,
    currency: STRIPE_CURRENCY.toUpperCase(),
    status: 'pending',
    paymentMethod: 'stripe',
    metadata: {
      type: 'shop',
      productIds,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
    },
  });

  const lineItems = items.map((item) => ({
    price_data: {
      currency: STRIPE_CURRENCY,
      product_data: {
        name: item.productName,
        ...(item.imageUrl && { images: [item.imageUrl] }),
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: lineItems,
    metadata: {
      type: 'shop',
      paymentId: payment.id,
      userId,
      productIds: JSON.stringify(productIds),
      items: JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price }))),
    },
    success_url: `${FRONTEND_URL}/shop/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/shop/payment/cancel`,
  });

  const pool = (await import('../db/connection.js')).default;
  await pool.execute(
    'UPDATE payments SET stripe_checkout_session_id = ? WHERE id = ?',
    [session.id, payment.id]
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url!,
    paymentId: payment.id,
  };
};

export const retrieveCheckoutSession = async (sessionId: string) => {
  if (!isStripeConfigured() || !stripe) {
    throw createError('Stripe is not configured', 500);
  }

  return stripe.checkout.sessions.retrieve(sessionId);
};
