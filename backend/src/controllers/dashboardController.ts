import type { Request, Response, NextFunction } from 'express';
import { testConnection } from '../db/connection.js';
import { getAllUsersCount, getAllUsers, updateUser } from '../services/userService.js';
import { getAllEvents } from '../services/eventService.js';
import { getRegistrationsCount, getAllRegistrations } from '../services/registrationService.js';
import { getGuestsByRegistrationId, updateGuestsBulkAdmin } from '../services/registrationGuestService.js';
import { getRewardTransactionsCount, getAllRewardTransactions } from '../services/rewardService.js';
import * as productService from '../services/productService.js';
import * as productImageService from '../services/productImageService.js';
import * as productQuantityTierService from '../services/productQuantityTierService.js';
import * as galleryService from '../services/galleryService.js';
import { resolveVideoThumbnail } from '../services/galleryVideoThumbnailService.js';
import * as homepageBannersService from '../services/homepageBannersService.js';
import * as keyPersonsService from '../services/keyPersonsService.js';
import * as newsService from '../services/newsService.js';
import * as reviewService from '../services/reviewService.js';
import * as contactMessageService from '../services/contactMessageService.js';
import * as serviceRequestService from '../services/serviceRequestService.js';
import * as paymentService from '../services/paymentService.js';
import * as invoiceService from '../services/invoiceService.js';
import * as paymentStatsService from '../services/paymentStatsService.js';
import { createError } from '../middleware/errorHandler.js';

export const testDbConnection = async (req: Request, res: Response): Promise<void> => {
  const result = await testConnection();
  if (result.ok) {
    res.json({ connected: true, message: 'Database connection OK' });
  } else {
    res.status(503).json({ connected: false, message: result.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const [usersCount, events, registrationsCount, rewardTransactionsCount] = await Promise.all([
    getAllUsersCount(),
    getAllEvents(),
    getRegistrationsCount(),
    getRewardTransactionsCount(),
  ]);

  res.json({
    usersCount,
    eventsCount: events.length,
    registrationsCount,
    rewardTransactionsCount,
  });
};

export const getDashboardUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardUser = async (
  req: Request<{ id: string }, {}, { firstName?: string; lastName?: string; phone?: string; role?: string; rewardPoints?: number; isBlocked?: boolean }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await updateUser(id, req.body as Parameters<typeof updateUser>[1]);
    if (!updated) {
      throw createError('User not found', 404);
    }
    const { password: _, ...userResponse } = updated;
    res.json(userResponse);
  } catch (error) {
    next(error);
  }
};

export const getDashboardRegistrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await getAllRegistrations();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardRegistrationGuests = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const guests = await getGuestsByRegistrationId(req.params.id);
    res.json({ guests });
  } catch (error) {
    next(error);
  }
};

export const putDashboardRegistrationGuests = async (
  req: Request<{ id: string }, object, { guests: { id?: number; name: string }[] }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const guests = req.body?.guests;
    if (!Array.isArray(guests)) {
      throw createError('guests array is required', 400);
    }
    const updated = await updateGuestsBulkAdmin(id, guests);
    res.json({ guests: updated });
  } catch (error) {
    next(error);
  }
};

export const getDashboardRewardTransactions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await getAllRewardTransactions();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await productService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardProductById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid product ID', 400);
    const product = await productService.findById(id);
    if (!product) throw createError('Product not found', 404);
    const [images, tiers] = await Promise.all([
      productImageService.findByProductId(id),
      productQuantityTierService.findByProductId(id),
    ]);
    const imageUrls = images.map((img) => img.image_url);
    const imagesList = imageUrls.length > 0 ? imageUrls : (product.image ? [product.image] : []);
    const quantityTiers = tiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price }));
    res.json({ ...product, images: imagesList, quantity_tiers: quantityTiers });
  } catch (error) {
    next(error);
  }
};

export const createDashboardProduct = async (
  req: Request<{}, {}, { name: string; price: number; original_price?: number; image?: string; images?: string[]; category: string; in_stock?: boolean; description?: string; quantity_tiers?: { quantity: number; unit_price: number }[] }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body;
    if (!body.name || body.price == null) {
      throw createError('Name and price are required', 400);
    }
    const images = Array.isArray(body.images) ? body.images : (body.image ? [body.image] : []);
    if (images.length === 0) {
      throw createError('At least one product image is required', 400);
    }
    const primaryImage = images[0];
    const created = await productService.create({
      name: body.name,
      price: Number(body.price),
      original_price: body.original_price ?? null,
      image: primaryImage,
      category: body.category || '',
      in_stock: body.in_stock,
      description: body.description ?? null,
    });
    if (images.length > 1) {
      await productImageService.replaceForProduct(created.id, images);
    } else {
      await productImageService.replaceForProduct(created.id, [primaryImage]);
    }
    const tiers = Array.isArray(body.quantity_tiers)
      ? body.quantity_tiers.filter((t) => t && t.quantity > 0 && t.unit_price >= 0)
      : [];
    if (tiers.length > 0) {
      await productQuantityTierService.replaceForProduct(created.id, tiers);
    }
    const [fullImages, fullTiers] = await Promise.all([
      productImageService.findByProductId(created.id),
      productQuantityTierService.findByProductId(created.id),
    ]);
    res.status(201).json({
      ...created,
      images: fullImages.map((i) => i.image_url),
      quantity_tiers: fullTiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateDashboardProduct = async (
  req: Request<{ id: string }, {}, { name?: string; price?: number; original_price?: number; image?: string; images?: string[]; category?: string; in_stock?: boolean; description?: string; quantity_tiers?: { quantity: number; unit_price: number }[] }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid product ID', 400);
    const body = req.body;
    const images = Array.isArray(body.images) ? body.images : undefined;
    const updateData: Parameters<typeof productService.update>[1] = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.original_price !== undefined) updateData.original_price = body.original_price;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.in_stock !== undefined) updateData.in_stock = body.in_stock;
    if (body.description !== undefined) updateData.description = body.description;
    if (images !== undefined) {
      if (images.length === 0) throw createError('At least one product image is required', 400);
      updateData.image = images[0];
    }
    const updated = await productService.update(id, updateData);
    if (!updated) throw createError('Product not found', 404);
    if (images !== undefined) {
      await productImageService.replaceForProduct(id, images);
    }
    if (body.quantity_tiers !== undefined) {
      const tiers = Array.isArray(body.quantity_tiers)
        ? body.quantity_tiers.filter((t) => t && t.quantity > 0 && t.unit_price >= 0)
        : [];
      await productQuantityTierService.replaceForProduct(id, tiers);
    }
    const [fullImages, fullTiers] = await Promise.all([
      productImageService.findByProductId(id),
      productQuantityTierService.findByProductId(id),
    ]);
    res.json({
      ...updated,
      images: fullImages.map((i) => i.image_url),
      quantity_tiers: fullTiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price })),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid product ID', 400);
    const deleted = await productService.remove(id);
    if (!deleted) throw createError('Product not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Gallery photos (dashboard)
export const getDashboardGalleryPhotos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await galleryService.findAllPhotos();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardGalleryPhoto = async (
  req: Request<{}, {}, { src: string; alt: string; type: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { src, alt, type, display_order } = req.body;
    if (!src || !alt || !type) throw createError('src, alt and type are required', 400);
    const created = await galleryService.createPhoto({ src, alt, type, display_order });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardGalleryPhoto = async (
  req: Request<{ id: string }, {}, { src?: string; alt?: string; type?: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid photo ID', 400);
    const updated = await galleryService.updatePhoto(id, req.body);
    if (!updated) throw createError('Photo not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardGalleryPhoto = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid photo ID', 400);
    const deleted = await galleryService.removePhoto(id);
    if (!deleted) throw createError('Photo not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Gallery videos (dashboard)
export const getDashboardGalleryVideos = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await galleryService.findAllVideos();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardGalleryVideo = async (
  req: Request<{}, {}, { title: string; embed_id: string; thumbnail?: string; category: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, embed_id, thumbnail, category, display_order } = req.body;
    if (!title || !embed_id || !category) throw createError('title, embed_id and category are required', 400);
    const thumbnailResolved = await resolveVideoThumbnail(embed_id, category, thumbnail);
    const created = await galleryService.createVideo({
      title,
      embed_id,
      thumbnail: thumbnailResolved ?? null,
      category,
      display_order,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardGalleryVideo = async (
  req: Request<{ id: string }, {}, { title?: string; embed_id?: string; thumbnail?: string; category?: string; display_order?: number }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid video ID', 400);
    const existing = await galleryService.findVideoById(id);
    if (!existing) throw createError('Video not found', 404);
    const body = req.body;
    const embedId = body.embed_id ?? existing.embed_id;
    const category = body.category ?? existing.category;
    let updateData: Parameters<typeof galleryService.updateVideo>[1] = { ...body };
    if (body.thumbnail !== undefined) {
      const thumbnailResolved = await resolveVideoThumbnail(embedId, category, body.thumbnail);
      updateData = { ...updateData, thumbnail: thumbnailResolved ?? null };
    }
    const updated = await galleryService.updateVideo(id, updateData);
    if (!updated) throw createError('Video not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardGalleryVideo = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid video ID', 400);
    const deleted = await galleryService.removeVideo(id);
    if (!deleted) throw createError('Video not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Homepage banners (dashboard)
export const getDashboardHomepageBanners = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await homepageBannersService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardHomepageBanner = async (
  req: Request<
    {},
    {},
    { title?: string; cloudinary_public_id: string; image_url: string; alt_text: string; display_order?: number; is_active?: boolean }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, cloudinary_public_id, image_url, alt_text, display_order, is_active } = req.body;
    if (!cloudinary_public_id || !image_url || !alt_text) {
      throw createError('cloudinary_public_id, image_url and alt_text are required', 400);
    }
    const created = await homepageBannersService.create({
      title: title ?? null,
      cloudinary_public_id,
      image_url,
      alt_text,
      display_order,
      is_active,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardHomepageBanner = async (
  req: Request<
    { id: string },
    {},
    {
      title?: string | null;
      cloudinary_public_id?: string;
      image_url?: string;
      alt_text?: string;
      display_order?: number;
      is_active?: boolean;
    }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid banner ID', 400);
    const updated = await homepageBannersService.update(id, req.body);
    if (!updated) throw createError('Banner not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardHomepageBanner = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid banner ID', 400);
    const deleted = await homepageBannersService.remove(id);
    if (!deleted) throw createError('Banner not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Key persons (dashboard)
export const getDashboardKeyPersons = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await keyPersonsService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardKeyPerson = async (
  req: Request<
    {},
    {},
    { firstName?: string; lastName?: string; role?: string; description?: string | null; imageUrl?: string | null; cloudinaryPublicId?: string | null; displayOrder?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, role, description, imageUrl, cloudinaryPublicId, displayOrder } = req.body;
    if (!firstName || !lastName || !role) {
      throw createError('firstName, lastName and role are required', 400);
    }
    const created = await keyPersonsService.create({
      first_name: firstName,
      last_name: lastName,
      role,
      description: description ?? null,
      image_url: imageUrl ?? null,
      cloudinary_public_id: cloudinaryPublicId ?? null,
      display_order: displayOrder ?? 0,
    });
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardKeyPerson = async (
  req: Request<
    { id: string },
    {},
    { firstName?: string; lastName?: string; role?: string; description?: string | null; imageUrl?: string | null; cloudinaryPublicId?: string | null; displayOrder?: number }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid key person ID', 400);
    const { firstName, lastName, role, description, imageUrl, cloudinaryPublicId, displayOrder } = req.body;
    const updates: Parameters<typeof keyPersonsService.update>[1] = {};
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (role !== undefined) updates.role = role;
    if (description !== undefined) updates.description = description;
    if (imageUrl !== undefined) updates.image_url = imageUrl;
    if (cloudinaryPublicId !== undefined) updates.cloudinary_public_id = cloudinaryPublicId;
    if (displayOrder !== undefined) updates.display_order = displayOrder;
    const updated = await keyPersonsService.update(id, updates);
    if (!updated) throw createError('Key person not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardKeyPerson = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid key person ID', 400);
    const deleted = await keyPersonsService.remove(id);
    if (!deleted) throw createError('Key person not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// News (dashboard)
export const getDashboardNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await newsService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardNews = async (
  req: Request<{}, {}, Record<string, unknown>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as { image?: string; title: string; date?: string; time?: string; location?: string; description?: string; badge?: string; category?: string; link?: string; display_order?: number };
    if (!body.title) throw createError('title is required', 400);
    const created = await newsService.create(body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardNews = async (
  req: Request<{ id: string }, {}, Record<string, unknown>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid news ID', 400);
    const updated = await newsService.update(id, req.body as Parameters<typeof newsService.update>[1]);
    if (!updated) throw createError('News article not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardNews = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid news ID', 400);
    const deleted = await newsService.remove(id);
    if (!deleted) throw createError('News article not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Reviews (dashboard)
export const getDashboardReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await reviewService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const createDashboardReview = async (
  req: Request<{}, {}, Record<string, unknown>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as { user_id?: string; name: string; rating: number; review_date: string; review_text: string; is_verified?: boolean; status?: string };
    if (!body.name || body.rating == null) throw createError('name and rating are required', 400);
    const created = await reviewService.create(body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardReview = async (
  req: Request<{ id: string }, {}, Record<string, unknown>>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid review ID', 400);
    const updated = await reviewService.update(id, req.body as Parameters<typeof reviewService.update>[1]);
    if (!updated) throw createError('Review not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboardReview = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid review ID', 400);
    const deleted = await reviewService.remove(id);
    if (!deleted) throw createError('Review not found', 404);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

// Contact messages (dashboard: list + update)
export const getDashboardContactMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await contactMessageService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardContactMessage = async (
  req: Request<{ id: string }, {}, { status?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid contact message ID', 400);
    const updated = await contactMessageService.update(id, { status: req.body.status });
    if (!updated) throw createError('Contact message not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Service requests (dashboard: list + update)
export const getDashboardServiceRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await serviceRequestService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardServiceRequest = async (
  req: Request<{ id: string }, {}, { status?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) throw createError('Invalid service request ID', 400);
    const updated = await serviceRequestService.update(id, { status: req.body.status });
    if (!updated) throw createError('Service request not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Payments (dashboard: list, detail, update)
export const getDashboardPayments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await paymentService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardPaymentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payment = await paymentService.findById(req.params.id);
    if (!payment) throw createError('Payment not found', 404);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const updateDashboardPayment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      throw createError('Invalid status', 400);
    }
    const updated = await paymentService.updateStatus(req.params.id, status);
    if (!updated) throw createError('Payment not found', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Invoices (dashboard: list + detail)
export const getDashboardInvoices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await invoiceService.findAll();
    res.json(list);
  } catch (error) {
    next(error);
  }
};

export const getDashboardInvoiceById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const invoice = await invoiceService.findById(req.params.id);
    if (!invoice) throw createError('Invoice not found', 404);
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Payment Statistics
export const getPaymentStats = async (
  req: Request<{}, {}, {}, { period?: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month') || 'month';
    const validPeriods = ['day', 'week', 'month'];
    if (!validPeriods.includes(period)) {
      throw createError('Invalid period. Must be day, week, or month', 400);
    }
    const stats = await paymentStatsService.getPaymentStats(period);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
