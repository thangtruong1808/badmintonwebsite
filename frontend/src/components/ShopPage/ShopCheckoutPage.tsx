import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { Product } from "./types";

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

interface CheckoutState {
  products?: Product[];
  items?: CartItem[];
}

const ShopCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState | null;
  const legacyProducts: Product[] = state?.products ?? [];
  const items: CartItem[] =
    state?.items ?? legacyProducts.map((p) => ({ product: p, quantity: 1, unitPrice: p.price }));

  const totalPrice = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  const handleContinueToPayment = () => {
    navigate("/shop/payment", { state: { items } });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-4">
          <h1 className="text-2xl font-bold text-gray-900 font-calibri mb-4">
            No products selected
          </h1>
          <p className="text-gray-600 font-calibri mb-6">
            Please go back and add a product to checkout.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors font-calibri"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-rose-50 to-rose-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-huglove mb-6 text-center">
          Review your selection
        </h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex gap-4 border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-50">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 font-calibri">{item.product.name}</p>
                  <p className="text-sm text-gray-500 font-calibri">{item.product.category}</p>
                  <p className="text-rose-600 font-semibold font-calibri">
                    {item.quantity} × ${item.unitPrice.toFixed(2)} = $
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <p className="text-lg font-bold text-gray-900 font-calibri">
                Total: <span className="text-rose-600">${totalPrice.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/shop")}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold font-calibri transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinueToPayment}
              className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-bold font-calibri transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckoutPage;
