import type { Product } from "../ShopPage";
import type { SelectedQuantity } from "./types";

interface ProductQuantityPricingProps {
  product: Product;
  selectedQuantity: SelectedQuantity;
  onSelectQuantity: (qty: SelectedQuantity) => void;
}

const ProductQuantityPricing = ({
  product,
  selectedQuantity,
  onSelectQuantity,
}: ProductQuantityPricingProps) => (
  <div className="mb-6 pb-6 border-b border-gray-200">
    <div className="flex flex-col gap-3">
      {product.quantityTiers && product.quantityTiers.length > 0 ? (
        <>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quantity & Pricing</h3>
          <div className="flex flex-wrap gap-2">
            {product.quantityTiers
              .sort((a, b) => a.quantity - b.quantity)
              .map((tier) => {
                const isSelected = selectedQuantity === tier.quantity;
                return (
                  <button
                    key={tier.quantity}
                    type="button"
                    onClick={() => onSelectQuantity(tier.quantity)}
                    className={`rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
                        : "border-gray-300 bg-white text-gray-700 hover:border-rose-300 hover:bg-rose-50/50"
                    }`}
                  >
                    Buy {tier.quantity} — ${tier.unit_price}/tube
                  </button>
                );
              })}
            <button
              type="button"
              onClick={() => onSelectQuantity("bulk")}
              className={`rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                selectedQuantity === "bulk"
                  ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
                  : "border-gray-300 bg-white text-gray-700 hover:border-rose-300 hover:bg-rose-50/50"
              }`}
            >
              Other quantity — Contact us for price
            </button>
          </div>
          {typeof selectedQuantity === "number" ? (
            (() => {
              const tier = product.quantityTiers!.find((t) => t.quantity === selectedQuantity);
              if (!tier) return null;
              return (
                <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 font-semibold">
                    ${tier.unit_price.toFixed(2)} per tube × {selectedQuantity} = $
                    {(tier.unit_price * selectedQuantity).toFixed(2)} total
                  </p>
                </div>
              );
            })()
          ) : selectedQuantity === "bulk" ? (
            <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-semibold">
                Need a custom bulk quantity? Contact us for a tailored price.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mt-2">Select a quantity above to see the price.</p>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl font-bold text-green-600">
              ${product.price.toFixed(2)}
            </span>
          </div>
          {product.originalPrice && (
            <div className="flex flex-col mt-2">
              <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
              <span className="text-sm text-red-600 font-semibold">
                Save ${(product.originalPrice - product.price).toFixed(2)}
              </span>
            </div>
          )}
          <p className="text-sm text-amber-700 mt-2">
            If you want to buy with a specific quantity, please contact us for a price.
          </p>
        </>
      )}
    </div>
  </div>
);

export default ProductQuantityPricing;
