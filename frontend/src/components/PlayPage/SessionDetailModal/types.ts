import type { SocialEvent } from "../../../types/socialEvent";

export interface RegisteredPlayer {
  name: string;
  email?: string;
  avatar?: string | null;
  guestCount?: number;
  guestNames?: string[];
}

export interface WaitlistPlayer {
  name: string;
  guestCount: number;
  /** 'new_spot' = waiting for a spot (not registered); 'add_guests' = registered, friends waiting */
  type?: "new_spot" | "add_guests";
}

export interface SessionDetailModalProps {
  event: SocialEvent | null;
  onClose: () => void;
  onAddToCart: (eventId: number) => void;
  onProceedToCheckout: () => void;
  isInCart: boolean;
  selectedCount: number;
  /** When true, current user has a registration for this session */
  canCancel?: boolean;
  /** Current user's registration ID (for add-guests) */
  myRegistrationId?: string;
  /** Called when user clicks 'Cancel my registration'. May return a Promise; modal refetches registrations after it resolves. */
  onCancelRegistration?: () => void | Promise<void>;
  /** Called after adding guests (to refetch registrations/events) */
  onGuestsAdded?: () => void | Promise<void>;
  /** Called when spots became available (e.g. waitlist join rejected) to refetch events */
  onRefetchRequested?: () => void | Promise<void>;
  /** Optional loading flag while cancellation is in progress */
  isCancelling?: boolean;
  /** Called when user adds friends - navigate to checkout/payment. guestCountTotal: when partial (some waitlisted), total to add via API. pendingAddGuestsId: when partial, after reserving. */
  onNavigateToAddGuestsPayment?: (registrationId: string, guestCount: number, event: SocialEvent, guestCountTotal?: number, pendingAddGuestsId?: string) => void;
  /** When event is full and user joins waitlist: pay-first flow — navigate to checkout with pendingId so user can pay then be added to waitlist. */
  onNavigateToWaitlistPayment?: (event: SocialEvent, pendingId: string) => void;
}
