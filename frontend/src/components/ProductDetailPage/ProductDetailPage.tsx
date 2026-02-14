import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useProductDetail } from "./useProductDetail";
import ProductImageGallery from "./ProductImageGallery";
import ProductInfoSection from "./ProductInfoSection";
import RelatedProductsSection from "./RelatedProductsSection";
import ProductContactModal from "./ProductContactModal";

interface ProductDetailPageInnerProps {
  id: string;
}

const ProductDetailPageInner = ({ id }: ProductDetailPageInnerProps) => {
  const navigate = useNavigate();
  const {
    product,
    relatedProducts,
    loading,
    selectedImageIndex,
    setSelectedImageIndex,
    selectedQuantity,
    setSelectedQuantity,
    isModalOpen,
    setIsModalOpen,
    formData,
    errors,
    submitStatus,
    isSubmitting,
    handleChange,
    handleSubmit,
    closeModal,
    getProductPriceDisplay,
  } = useProductDetail(id);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-rose-50 to-rose-100">
        <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full flex items-center justify-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-rose-500 border-t-transparent flex-shrink-0" aria-hidden />
            <span className="font-calibri text-gray-600">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full overflow-x-hidden">
        <div className="px-4 md:px-8 py-12 md:py-16 max-w-7xl mx-auto min-h-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">Product Not Found</h1>
          <button
            onClick={() => navigate("/shop")}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    const tier = product.quantityTiers?.find((t) => t.quantity === selectedQuantity);
    const qty = product.quantityTiers?.length
      ? typeof selectedQuantity === "number"
        ? selectedQuantity
        : 0
      : 1;
    const unitPrice = tier ? tier.unit_price : product.price;
    if (product.quantityTiers?.length && (selectedQuantity == null || selectedQuantity === "bulk")) return;
    navigate("/shop/checkout", { state: { items: [{ product, quantity: qty, unitPrice }] } });
  };

  return (
    <div className="w-full overflow-x-hidden min-h-screen font-calibri text-lg bg-gradient-to-r from-rose-50 to-rose-100">
      <div className="px-4 md:px-8 py-8 md:py-12 max-w-7xl mx-auto min-h-full font-calibri text-lg">
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors duration-300 font-calibri text-lg"
        >
          <FaArrowLeft size={18} />
          <span className="font-large font-calibri text-lg">Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12 font-calibri text-lg">
          <ProductImageGallery
            product={product}
            selectedIndex={selectedImageIndex}
            onSelectIndex={setSelectedImageIndex}
          />
          <ProductInfoSection
            product={product}
            selectedQuantity={selectedQuantity}
            onSelectQuantity={setSelectedQuantity}
            onBuyNow={handleBuyNow}
            onContactClick={() => setIsModalOpen(true)}
          />
        </div>

        <RelatedProductsSection product={product} relatedProducts={relatedProducts} />
      </div>

      <ProductContactModal
        open={isModalOpen}
        product={product}
        priceDisplay={getProductPriceDisplay(product, selectedQuantity)}
        formData={formData}
        errors={errors}
        submitStatus={submitStatus}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailPageInner id={id ?? ""} />;
};

export default ProductDetailPage;
