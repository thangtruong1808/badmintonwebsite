const CART_STORAGE_KEY = "chibibadminton_cart";

export const getCartItems = (): number[] => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const setCartItems = (eventIds: number[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(eventIds));
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch {
    // Ignore storage errors
  }
};

export const clearCart = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("cartUpdated"));
  } catch {
    // Ignore storage errors
  }
};

export const getCartCount = (): number => {
  return getCartItems().length;
};
