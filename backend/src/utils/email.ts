/**
 * Email utilities - main entry point.
 * Implementation is split into smaller modules in ./email/ for maintainability.
 */
export {
  isPasswordResetEmailEnabled,
  sendPasswordResetEmail,
  sendContactFormEmail,
  sendServiceRequestEmail,
  sendRegistrationConfirmationEmail,
  sendRegistrationConfirmationEmailForSessions,
  sendCancellationConfirmationEmail,
  sendWaitlistPromotionEmail,
  sendSpotConfirmedEmail,
  sendFriendsPromotedEmail,
  sendAddGuestsConfirmationEmail,
  sendRemoveGuestsConfirmationEmail,
  sendWaitlistFriendsUpdateConfirmationEmail,
  type ContactFormData,
  type ServiceRequestEmailData,
  type RegistrationSessionDetails,
} from './email/index.js';
