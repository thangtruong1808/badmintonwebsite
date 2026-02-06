import { useState, useEffect, useMemo, useCallback } from "react";
import { apiFetch } from "../../utils/api";
import { mapApiProduct } from "./types";
import type { Product } from "./types";
import { CATEGORY_ALL } from "./types";

export function useShopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>(CATEGORY_ALL);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/products", { skipAuth: true });
        if (res.ok) {
          const list = await res.json();
          setProducts(Array.isArray(list) ? list.map(mapApiProduct) : []);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return [CATEGORY_ALL, ...cats.sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (categoryFilter === CATEGORY_ALL) return products;
    return products.filter((p) => p.category === categoryFilter);
  }, [categoryFilter, products]);

  const handleImageLoad = useCallback((productId: number) => {
    setLoadedImages((prev) => new Set(prev).add(productId));
  }, []);

  return {
    products,
    loading,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredProducts,
    loadedImages,
    handleImageLoad,
  };
}
