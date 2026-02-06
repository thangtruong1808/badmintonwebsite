import { useNavigate } from "react-router-dom";
import type { Product } from "./types";

interface ProductCardProps {
  product: Product;
  isImageLoaded: boolean;
  onImageLoad: (productId: number) => void;
}

const ProductCard = ({ product, isImageLoaded, onImageLoad }: ProductCardProps) => {
  const navigate = useNavigate();
  const goToDetail = () => navigate(`/shop/product/${product.id}`);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-slate-100 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative w-full aspect-square overflow-hidden bg-slate-50 flex-shrink-0">
        {!isImageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-slate-200" aria-hidden="true" />
        )}
        <img
          src={product.image}
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-fill object-center border-b border-slate-100 transition-transform duration-300 group-hover:scale-105 ${!isImageLoaded ? "opacity-0" : "opacity-100"
            }`}
          loading="lazy"
          onLoad={() => onImageLoad(product.id)}
        />
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
            SALE
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-calibri">
          {product.category}
        </p>
        <h3 className="text-sm md:text-base font-semibold text-black line-clamp-2 font-calibri">
          {product.name}
        </h3>
      </div>
    </article>
  );
};

export default ProductCard;
