import ProductCard from "./ProductCard";
import type { Product } from "./types";
import { CATEGORY_ALL } from "./types";

interface ShopProductGridProps {
  categoryFilter: string;
  filteredProducts: Product[];
  products: Product[];
  loadedImages: Set<number>;
  onImageLoad: (productId: number) => void;
}

const ShopProductGrid = ({
  categoryFilter,
  filteredProducts,
  products,
  loadedImages,
  onImageLoad,
}: ShopProductGridProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-black text-left font-huglove lg:text-center">
        {categoryFilter === CATEGORY_ALL ? "Products" : categoryFilter}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 font-calibri text-lg">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isImageLoaded={loadedImages.has(product.id)}
            onImageLoad={onImageLoad}
          />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-600 font-calibri py-8">
          {products.length === 0
            ? "No products yet. Products will appear here once added from the dashboard."
            : "No products in this category right now."}
        </p>
      )}
    </div>
  );
};

export default ShopProductGrid;
