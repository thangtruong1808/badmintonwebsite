const SHOP_CART_STORAGE_KEY = "chibibadminton_shop_cart";

export interface ShopCartItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export const getShopCartItems = (): ShopCartItem[] => {
  try {
    const cart = localStorage.getItem(SHOP_CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

const notifyShopCartUpdated = (): void => {
  queueMicrotask(() => window.dispatchEvent(new CustomEvent("shopCartUpdated")));
};

export const setShopCartItems = (items: ShopCartItem[]): void => {
  try {
    localStorage.setItem(SHOP_CART_STORAGE_KEY, JSON.stringify(items));
    notifyShopCartUpdated();
  } catch {
    // Ignore storage errors
  }
};

export const clearShopCart = (): void => {
  try {
    localStorage.removeItem(SHOP_CART_STORAGE_KEY);
    notifyShopCartUpdated();
  } catch {
    // Ignore storage errors
  }
};

export const getShopCartCount = (): number => {
  return getShopCartItems().reduce((sum, item) => sum + item.quantity, 0);
};
