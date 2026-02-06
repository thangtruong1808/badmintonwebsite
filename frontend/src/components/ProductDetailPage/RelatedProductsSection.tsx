import { useNavigate } from "react-router-dom";
import type { Product } from "../ShopPage";

interface RelatedProductsSectionProps {
  product: Product;
  relatedProducts: Product[];
}

const RelatedProductsSection = ({ product, relatedProducts }: RelatedProductsSectionProps) => {
  const navigate = useNavigate();
  const filtered = relatedProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="mt-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-black font-calibri text-lg">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map((relatedProduct) => (
          <div
            key={relatedProduct.id}
            onClick={() => navigate(`/shop/product/${relatedProduct.id}`)}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer border border-slate-100"
          >
            <div className="relative w-full aspect-square overflow-hidden bg-slate-50">
              <img
                src={relatedProduct.image}
                alt={relatedProduct.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-black line-clamp-2">{relatedProduct.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProductsSection;
