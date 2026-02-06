import type { Product } from "../ShopPage";

interface ProductImageGalleryProps {
  product: Product;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
}

const ProductImageGallery = ({ product, selectedIndex, onSelectIndex }: ProductImageGalleryProps) => (
  <div className="bg-gradient-to-t from-rose-50 to-rose-100 rounded-lg shadow-lg p-4 md:p-6">
    <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
      <img
        src={product.images && product.images.length > 0 ? product.images[selectedIndex] : product.image}
        alt={product.name}
        className="w-full h-full object-fill"
      />
      {product.originalPrice && (
        <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-2 rounded">
          SALE
        </div>
      )}
    </div>
    {product.images && product.images.length > 1 && (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {product.images.map((img, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectIndex(index)}
            className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-300 ${
              selectedIndex === index ? "border-rose-500 ring-2 ring-rose-200" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <img src={img} alt={`${product.name} - View ${index + 1}`} className="w-full h-full object-fill" />
          </button>
        ))}
      </div>
    )}
  </div>
);

export default ProductImageGallery;
