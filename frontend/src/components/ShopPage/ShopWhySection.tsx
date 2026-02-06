import { FaShieldAlt, FaTruck, FaTools } from "react-icons/fa";

const ShopWhySection = () => (
  <section
    className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-12 bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200"
    aria-labelledby="why-shop-heading"
  >
    <h2 id="why-shop-heading" className="text-2xl font-bold mb-6 text-black text-center font-calibri">
      Why Shop with ChibiBadminton
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center mb-3 text-white"
          aria-hidden
        >
          <FaShieldAlt size={22} />
        </div>
        <h3 className="font-semibold text-black mb-2 font-calibri">Quality Guaranteed</h3>
        <p className="text-sm text-gray-800 font-calibri max-w-xs mx-auto">
          All products are carefully selected for quality and performance
        </p>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center mb-3 text-white"
          aria-hidden
        >
          <FaTruck size={22} />
        </div>
        <h3 className="font-semibold text-black mb-2 font-calibri">Fast Shipping</h3>
        <p className="text-sm text-gray-800 font-calibri max-w-xs mx-auto">
          Quick and reliable delivery to get your gear fast
        </p>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center mb-3 text-white"
          aria-hidden
        >
          <FaTools size={22} />
        </div>
        <h3 className="font-semibold text-black mb-2 font-calibri">Expert Service</h3>
        <p className="text-sm text-gray-800 font-calibri max-w-xs mx-auto">
          Professional equipment services available
        </p>
      </div>
    </div>
  </section>
);

export default ShopWhySection;
