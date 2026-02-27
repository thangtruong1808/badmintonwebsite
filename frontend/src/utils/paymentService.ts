/**
 * Payment service for frontend.
 * Handles Stripe checkout session creation and redirect.
 */
import { apiFetch } from './api';

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

export interface CheckoutSessionResponse {
  success: boolean;
  sessionId: string;
  checkoutUrl: string;
  paymentId: string;
}

export const createPlayCheckoutSession = async (
  items: PlayCheckoutItem[],
  pendingRegistrationIds?: string[]
): Promise<CheckoutSessionResponse> => {
  const response = await apiFetch('/api/payments/create-play-checkout', {
    method: 'POST',
    body: JSON.stringify({ items, pendingRegistrationIds }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
};

export const createAddGuestsCheckoutSession = async (
  data: AddGuestsCheckoutData
): Promise<CheckoutSessionResponse> => {
  const response = await apiFetch('/api/payments/create-add-guests-checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
};

export const createWaitlistCheckoutSession = async (
  data: WaitlistCheckoutData
): Promise<CheckoutSessionResponse> => {
  const response = await apiFetch('/api/payments/create-waitlist-checkout', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
};

export const createShopCheckoutSession = async (
  items: ShopCheckoutItem[]
): Promise<CheckoutSessionResponse> => {
  const response = await apiFetch('/api/payments/create-shop-checkout', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
};

export const redirectToStripeCheckout = (checkoutUrl: string): void => {
  window.location.href = checkoutUrl;
};
