import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getDashboardStats,
  testDbConnection,
  getDashboardUsers,
  updateDashboardUser,
  getDashboardRegistrations,
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

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/db-test', authenticateToken, requireAdmin, testDbConnection);

router.get('/users', authenticateToken, requireAdmin, getDashboardUsers);
router.put('/users/:id', authenticateToken, requireAdmin, updateDashboardUser);

router.get('/registrations', authenticateToken, requireAdmin, getDashboardRegistrations);

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

router.get('/payments', authenticateToken, requireAdmin, getDashboardPayments);

router.get('/invoices', authenticateToken, requireAdmin, getDashboardInvoices);
router.get('/invoices/:id', authenticateToken, requireAdmin, getDashboardInvoiceById);

router.get('/newsletter', authenticateToken, requireAdmin, getNewsletterSubscriptions);
router.post('/newsletter', authenticateToken, requireAdmin, createNewsletterSubscription);
router.put('/newsletter/:id', authenticateToken, requireAdmin, updateNewsletterSubscription);
router.delete('/newsletter/:id', authenticateToken, requireAdmin, deleteNewsletterSubscription);

export default router;
