/**
 * Email utilities - re-exports all email functions and types.
 * Each submodule is under 300 lines for maintainability.
 */
export {
  isPasswordResetEmailEnabled,
  sendPasswordResetEmail,
} from './emailAuth.js';

export {
  sendContactFormEmail,
  sendServiceRequestEmail,
  type ContactFormData,
  type ServiceRequestEmailData,
} from './emailContact.js';

export {
  sendRegistrationConfirmationEmail,
  sendRegistrationConfirmationEmailForSessions,
  sendCancellationConfirmationEmail,
  type RegistrationSessionDetails,
} from './emailRegistration.js';

export { sendWaitlistPromotionEmail } from './emailWaitlist.js';

export {
  sendFriendsPromotedEmail,
  sendAddGuestsConfirmationEmail,
  sendRemoveGuestsConfirmationEmail,
  sendWaitlistFriendsUpdateConfirmationEmail,
} from './emailGuests.js';
