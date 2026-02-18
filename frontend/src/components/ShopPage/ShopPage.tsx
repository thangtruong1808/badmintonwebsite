import { useEffect } from "react";
import { useShopProducts } from "./useShopProducts";
import ShopCategoryFilter from "./ShopCategoryFilter";
import ShopProductGrid from "./ShopProductGrid";
import ShopWhySection from "./ShopWhySection";

const ShopPage = () => {
  const {
    products,
    loading,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredProducts,
    loadedImages,
    handleImageLoad,
  } = useShopProducts();

  useEffect(() => {
    document.title = "ChibiBadminton - Shop";
  }, []);

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="px-4 md:px-8 py-8 md:py-16 max-w-7xl mx-auto min-h-full">
        <header className="text-center mb-10 p-6 rounded-lg shadow-xl bg-gradient-to-r from-rose-50 to-rose-100">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-black font-huglove mb-2">Shop</h1>
          <p className="text-gray-700 font-calibri text-base md:text-lg max-w-2xl mx-auto">
            Quality badminton products. Contact us for availability and orders.
          </p>
        </header>

        {loading && (
          <div className="bg-gradient-to-r from-rose-50 to-rose-100 min-h-[40vh] flex items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
              <span className="font-calibri text-gray-600">Loading…</span>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {products.length > 0 && (
              <ShopCategoryFilter
                categories={categories}
                categoryFilter={categoryFilter}
                onFilterChange={setCategoryFilter}
              />
            )}

            <ShopProductGrid
              categoryFilter={categoryFilter}
              filteredProducts={filteredProducts}
              products={products}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
            />

            <ShopWhySection />
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
