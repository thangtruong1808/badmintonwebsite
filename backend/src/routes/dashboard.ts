import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getDashboardStats,
  testDbConnection,
  getDashboardUsers,
  updateDashboardUser,
  getDashboardRegistrations,
  getDashboardRegistrationGuests,
  putDashboardRegistrationGuests,
  getDashboardRewardTransactions,
  getDashboardProducts,
  getDashboardProductById,
  createDashboardProduct,
  updateDashboardProduct,
  deleteDashboardProduct,
  getDashboardGalleryPhotos,
  createDashboardGalleryPhoto,
  updateDashboardGalleryPhoto,
  deleteDashboardGalleryPhoto,
  getDashboardGalleryVideos,
  createDashboardGalleryVideo,
  updateDashboardGalleryVideo,
  deleteDashboardGalleryVideo,
  getDashboardHomepageBanners,
  createDashboardHomepageBanner,
  updateDashboardHomepageBanner,
  deleteDashboardHomepageBanner,
  getDashboardKeyPersons,
  createDashboardKeyPerson,
  updateDashboardKeyPerson,
  deleteDashboardKeyPerson,
  getDashboardNews,
  createDashboardNews,
  updateDashboardNews,
  deleteDashboardNews,
  getDashboardReviews,
  createDashboardReview,
  updateDashboardReview,
  deleteDashboardReview,
  getDashboardContactMessages,
  updateDashboardContactMessage,
  getDashboardServiceRequests,
  updateDashboardServiceRequest,
  getDashboardPayments,
  getDashboardInvoices,
  getDashboardInvoiceById,
} from '../controllers/dashboardController.js';
import {
  getNewsletterSubscriptions,
  createNewsletterSubscription,
  updateNewsletterSubscription,
  deleteNewsletterSubscription,
} from '../controllers/newsletterController.js';
import {
  getDashboardServiceOptionsFlyer,
  updateDashboardServiceOptionsFlyer,
  getDashboardServiceOptionsStrings,
  createDashboardServiceOptionsString,
  updateDashboardServiceOptionsString,
  deleteDashboardServiceOptionsString,
  getDashboardServiceOptionsColours,
  createDashboardServiceOptionsColour,
  updateDashboardServiceOptionsColour,
  deleteDashboardServiceOptionsColour,
  getDashboardServiceOptionsTensions,
  createDashboardServiceOptionsTension,
  updateDashboardServiceOptionsTension,
  deleteDashboardServiceOptionsTension,
  getDashboardServiceOptionsStencils,
  createDashboardServiceOptionsStencil,
  updateDashboardServiceOptionsStencil,
  deleteDashboardServiceOptionsStencil,
  getDashboardServiceOptionsGrips,
  createDashboardServiceOptionsGrip,
  updateDashboardServiceOptionsGrip,
  deleteDashboardServiceOptionsGrip,
} from '../controllers/dashboardServiceOptionsController.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/db-test', authenticateToken, requireAdmin, testDbConnection);

router.get('/users', authenticateToken, requireAdmin, getDashboardUsers);
router.put('/users/:id', authenticateToken, requireAdmin, updateDashboardUser);

router.get('/registrations', authenticateToken, requireAdmin, getDashboardRegistrations);
router.get('/registrations/:id/guests', authenticateToken, requireAdmin, getDashboardRegistrationGuests);
router.put('/registrations/:id/guests', authenticateToken, requireAdmin, putDashboardRegistrationGuests);

router.get('/reward-transactions', authenticateToken, requireAdmin, getDashboardRewardTransactions);

router.get('/products', authenticateToken, requireAdmin, getDashboardProducts);
router.get('/products/:id', authenticateToken, requireAdmin, getDashboardProductById);
router.post('/products', authenticateToken, requireAdmin, createDashboardProduct);
router.put('/products/:id', authenticateToken, requireAdmin, updateDashboardProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, deleteDashboardProduct);

router.get('/gallery/photos', authenticateToken, requireAdmin, getDashboardGalleryPhotos);
router.post('/gallery/photos', authenticateToken, requireAdmin, createDashboardGalleryPhoto);
router.put('/gallery/photos/:id', authenticateToken, requireAdmin, updateDashboardGalleryPhoto);
router.delete('/gallery/photos/:id', authenticateToken, requireAdmin, deleteDashboardGalleryPhoto);

router.get('/gallery/videos', authenticateToken, requireAdmin, getDashboardGalleryVideos);
router.post('/gallery/videos', authenticateToken, requireAdmin, createDashboardGalleryVideo);
router.put('/gallery/videos/:id', authenticateToken, requireAdmin, updateDashboardGalleryVideo);
router.delete('/gallery/videos/:id', authenticateToken, requireAdmin, deleteDashboardGalleryVideo);

router.get('/homepage-banners', authenticateToken, requireAdmin, getDashboardHomepageBanners);
router.post('/homepage-banners', authenticateToken, requireAdmin, createDashboardHomepageBanner);
router.put('/homepage-banners/:id', authenticateToken, requireAdmin, updateDashboardHomepageBanner);
router.delete('/homepage-banners/:id', authenticateToken, requireAdmin, deleteDashboardHomepageBanner);

router.get('/key-persons', authenticateToken, requireAdmin, getDashboardKeyPersons);
router.post('/key-persons', authenticateToken, requireAdmin, createDashboardKeyPerson);
router.put('/key-persons/:id', authenticateToken, requireAdmin, updateDashboardKeyPerson);
router.delete('/key-persons/:id', authenticateToken, requireAdmin, deleteDashboardKeyPerson);

router.get('/news', authenticateToken, requireAdmin, getDashboardNews);
router.post('/news', authenticateToken, requireAdmin, createDashboardNews);
router.put('/news/:id', authenticateToken, requireAdmin, updateDashboardNews);
router.delete('/news/:id', authenticateToken, requireAdmin, deleteDashboardNews);

router.get('/reviews', authenticateToken, requireAdmin, getDashboardReviews);
router.post('/reviews', authenticateToken, requireAdmin, createDashboardReview);
router.put('/reviews/:id', authenticateToken, requireAdmin, updateDashboardReview);
router.delete('/reviews/:id', authenticateToken, requireAdmin, deleteDashboardReview);

router.get('/contact-messages', authenticateToken, requireAdmin, getDashboardContactMessages);
router.put('/contact-messages/:id', authenticateToken, requireAdmin, updateDashboardContactMessage);

router.get('/service-requests', authenticateToken, requireAdmin, getDashboardServiceRequests);
router.put('/service-requests/:id', authenticateToken, requireAdmin, updateDashboardServiceRequest);

router.get('/service-options/flyer', authenticateToken, requireAdmin, getDashboardServiceOptionsFlyer);
router.put('/service-options/flyer', authenticateToken, requireAdmin, updateDashboardServiceOptionsFlyer);
router.get('/service-options/strings', authenticateToken, requireAdmin, getDashboardServiceOptionsStrings);
router.post('/service-options/strings', authenticateToken, requireAdmin, createDashboardServiceOptionsString);
router.put('/service-options/strings/:id', authenticateToken, requireAdmin, updateDashboardServiceOptionsString);
router.delete('/service-options/strings/:id', authenticateToken, requireAdmin, deleteDashboardServiceOptionsString);
router.get('/service-options/strings/:stringId/colours', authenticateToken, requireAdmin, getDashboardServiceOptionsColours);
router.post('/service-options/strings/:stringId/colours', authenticateToken, requireAdmin, createDashboardServiceOptionsColour);
router.put('/service-options/colours/:colourId', authenticateToken, requireAdmin, updateDashboardServiceOptionsColour);
router.delete('/service-options/colours/:colourId', authenticateToken, requireAdmin, deleteDashboardServiceOptionsColour);

router.get('/service-options/tensions', authenticateToken, requireAdmin, getDashboardServiceOptionsTensions);
router.post('/service-options/tensions', authenticateToken, requireAdmin, createDashboardServiceOptionsTension);
router.put('/service-options/tensions/:id', authenticateToken, requireAdmin, updateDashboardServiceOptionsTension);
router.delete('/service-options/tensions/:id', authenticateToken, requireAdmin, deleteDashboardServiceOptionsTension);

router.get('/service-options/stencils', authenticateToken, requireAdmin, getDashboardServiceOptionsStencils);
router.post('/service-options/stencils', authenticateToken, requireAdmin, createDashboardServiceOptionsStencil);
router.put('/service-options/stencils/:id', authenticateToken, requireAdmin, updateDashboardServiceOptionsStencil);
router.delete('/service-options/stencils/:id', authenticateToken, requireAdmin, deleteDashboardServiceOptionsStencil);

router.get('/service-options/grips', authenticateToken, requireAdmin, getDashboardServiceOptionsGrips);
router.post('/service-options/grips', authenticateToken, requireAdmin, createDashboardServiceOptionsGrip);
router.put('/service-options/grips/:id', authenticateToken, requireAdmin, updateDashboardServiceOptionsGrip);
router.delete('/service-options/grips/:id', authenticateToken, requireAdmin, deleteDashboardServiceOptionsGrip);

router.get('/payments', authenticateToken, requireAdmin, getDashboardPayments);

router.get('/invoices', authenticateToken, requireAdmin, getDashboardInvoices);
router.get('/invoices/:id', authenticateToken, requireAdmin, getDashboardInvoiceById);

router.get('/newsletter', authenticateToken, requireAdmin, getNewsletterSubscriptions);
router.post('/newsletter', authenticateToken, requireAdmin, createNewsletterSubscription);
router.put('/newsletter/:id', authenticateToken, requireAdmin, updateNewsletterSubscription);
router.delete('/newsletter/:id', authenticateToken, requireAdmin, deleteNewsletterSubscription);

export default router;
