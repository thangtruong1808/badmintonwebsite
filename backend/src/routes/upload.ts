import { Router, Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { createError } from '../middleware/errorHandler.js';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(createError('Only image files are allowed', 400));
      return;
    }
    cb(null, true);
  },
});

/**
 * @route   POST /api/upload/avatar
 * @desc    Upload avatar image to Cloudinary
 * @access  Private (authenticated users)
 */
router.post(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) {
        throw createError('User ID not found', 401);
      }

      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      // Check if Cloudinary is configured
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw createError('Cloudinary is not configured', 500);
      }

      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chibibadminton/avatars',
          public_id: `user_${req.userId}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
          ],
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            next(createError('Failed to upload image to Cloudinary', 500));
            return;
          }

          if (!result) {
            next(createError('Upload result is empty', 500));
            return;
          }

          res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/upload/event-image
 * @desc    Upload event image to Cloudinary (admin only)
 * @access  Private (admin)
 */
router.post(
  '/event-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw createError('Cloudinary is not configured', 500);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chibibadminton/events',
          public_id: `event_${Date.now()}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
          ],
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            next(createError('Failed to upload image to Cloudinary', 500));
            return;
          }

          if (!result) {
            next(createError('Upload result is empty', 500));
            return;
          }

          res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/upload/play-slot-image
 * @desc    Upload play slot image to Cloudinary (admin only)
 * @access  Private (admin)
 */
router.post(
  '/play-slot-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw createError('Cloudinary is not configured', 500);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chibibadminton/play-slots',
          public_id: `play_slot_${Date.now()}`,
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
          ],
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            next(createError('Failed to upload image to Cloudinary', 500));
            return;
          }

          if (!result) {
            next(createError('Upload result is empty', 500));
            return;
          }

          res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/upload/gallery-image
 * @desc    Upload gallery photo to Cloudinary (admin only)
 * @access  Private (admin)
 */
router.post(
  '/gallery-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw createError('Cloudinary is not configured', 500);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chibibadminton/gallery',
          public_id: `gallery_${Date.now()}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
          ],
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            next(createError('Failed to upload image to Cloudinary', 500));
            return;
          }

          if (!result) {
            next(createError('Upload result is empty', 500));
            return;
          }

          res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/upload/product-image
 * @desc    Upload product image to Cloudinary (admin only)
 * @access  Private (admin)
 */
router.post(
  '/product-image',
  authenticateToken,
  requireAdmin,
  upload.single('image'),
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw createError('No file uploaded', 400);
      }

      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        throw createError('Cloudinary is not configured', 500);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'chibibadminton/products',
          public_id: `product_${Date.now()}`,
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto:good' },
          ],
          format: 'jpg',
        },
        (error, result) => {
          if (error) {
            next(createError('Failed to upload image to Cloudinary', 500));
            return;
          }

          if (!result) {
            next(createError('Upload result is empty', 500));
            return;
          }

          res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.pipe(uploadStream);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
