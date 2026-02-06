import { Router, Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService.js';
import * as productImageService from '../services/productImageService.js';
import * as productQuantityTierService from '../services/productQuantityTierService.js';

const router = Router();

/** Public: list all products (with images and quantity_tiers) */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await productService.findAll();
    const enriched = await Promise.all(
      list.map(async (p) => {
        const [images, tiers] = await Promise.all([
          productImageService.findByProductId(p.id),
          productQuantityTierService.findByProductId(p.id),
        ]);
        const imageUrls = images.map((i) => i.image_url);
        const quantityTiers = tiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price }));
        return {
          ...p,
          images: imageUrls.length > 0 ? imageUrls : [p.image],
          quantity_tiers: quantityTiers.length > 0 ? quantityTiers : undefined,
        };
      })
    );
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

/** Public: get product by ID (with images and quantity_tiers) */
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    const product = await productService.findById(id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    const [images, tiers] = await Promise.all([
      productImageService.findByProductId(id),
      productQuantityTierService.findByProductId(id),
    ]);
    const imageUrls = images.map((i) => i.image_url);
    const quantityTiers = tiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price }));
    res.json({
      ...product,
      images: imageUrls.length > 0 ? imageUrls : [product.image],
      quantity_tiers: quantityTiers.length > 0 ? quantityTiers : undefined,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
