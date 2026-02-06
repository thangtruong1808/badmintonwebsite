import { FaCheck, FaTruck, FaShieldAlt, FaShoppingCart, FaEnvelope } from "react-icons/fa";
import type { Product } from "../ShopPage";
import type { SelectedQuantity } from "./types";
import ProductQuantityPricing from "./ProductQuantityPricing";

interface ProductInfoSectionProps {
  product: Product;
  selectedQuantity: SelectedQuantity;
  onSelectQuantity: (qty: SelectedQuantity) => void;
  onBuyNow: () => void;
  onContactClick: () => void;
}

const ProductInfoSection = ({
  product,
  selectedQuantity,
  onSelectQuantity,
  onBuyNow,
  onContactClick,
}: ProductInfoSectionProps) => {
  const canBuyNow =
    product.inStock &&
    (!product.quantityTiers?.length || (typeof selectedQuantity === "number" && selectedQuantity > 0));
  const buyNowDisabled =
    !product.inStock || (!!product.quantityTiers?.length && (selectedQuantity == null || selectedQuantity === "bulk"));

  return (
    <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-lg shadow-lg p-6 md:p-8 font-calibri text-lg">
      <div className="mb-4">
        <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category}</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black font-calibri text-xl">{product.name}</h2>

      <ProductQuantityPricing
        product={product}
        selectedQuantity={selectedQuantity}
        onSelectQuantity={onSelectQuantity}
      />

      <div className="mb-6">
        {product.inStock ? (
          <div className="flex items-center gap-2 text-rose-500 font-semibold">
            <FaCheck size={20} />
            <span>In Stock</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-rose-500 font-semibold">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3 text-black font-calibri text-lg">Description</h3>
        <p className="text-gray-700 leading-relaxed font-calibri text-lg text-justify">
          {product.description ||
            `High-quality ${product.name.toLowerCase()} perfect for badminton enthusiasts. This product is carefully selected to meet the needs of players at all skill levels. Whether you're a beginner or a professional, this item will enhance your badminton experience.`}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3 text-black font-calibri text-lg">Key Features</h3>
        <ul className="space-y-2">
          {["Premium quality materials", "Durable and long-lasting", "Perfect for all skill levels"].map(
            (text, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 font-calibri text-lg">
                <FaCheck className="text-rose-500 mt-1 flex-shrink-0" size={16} />
                <span>{text}</span>
              </li>
            )
          )}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <button
          onClick={onBuyNow}
          disabled={buyNowDisabled}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-lg transition duration-300 font-calibri ${canBuyNow ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          title={
            product.quantityTiers?.length && (selectedQuantity == null || selectedQuantity === "bulk")
              ? "Select a tier quantity to Buy Now, or use Contact Us for bulk"
              : undefined
          }
        >
          <FaShoppingCart size={20} />
          Buy Now
        </button>
        <button
          onClick={onContactClick}
          disabled={!product.inStock}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-lg transition duration-300 font-calibri ${product.inStock ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <FaEnvelope size={20} />
          {product.inStock ? "Contact Us" : "Out of Stock"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <FaTruck className="text-rose-500" size={24} />
          <div>
            <p className="font-semibold text-black">Free Shipping</p>
            <p className="text-sm text-gray-600">On orders over $350</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-rose-500" size={24} />
          <div>
            <p className="font-semibold text-black">Quality Guarantee</p>
            <p className="text-sm text-gray-600">7-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoSection;
