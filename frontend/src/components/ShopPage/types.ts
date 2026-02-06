export interface ProductQuantityTier {
  quantity: number;
  unit_price: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  inStock: boolean;
  description?: string;
  quantityTiers?: ProductQuantityTier[];
}

export interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

export const CATEGORY_ALL = "All";

/** Map API snake_case to frontend camelCase */
export function mapApiProduct(row: {
  id: number;
  name: string;
  price: number;
  original_price?: number | null;
  image: string;
  images?: string[];
  category: string;
  in_stock: boolean;
  description?: string | null;
  quantity_tiers?: { quantity: number; unit_price: number }[];
}): Product {
  const images = row.images && row.images.length > 0 ? row.images : [row.image];
  const quantityTiers =
    Array.isArray(row.quantity_tiers) && row.quantity_tiers.length > 0
      ? row.quantity_tiers.map((t) => ({ quantity: t.quantity, unit_price: t.unit_price }))
      : undefined;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    image: images[0] ?? row.image,
    images: images.length > 1 ? images : undefined,
    category: row.category,
    inStock: row.in_stock,
    description: row.description ?? undefined,
    quantityTiers,
  };
}
