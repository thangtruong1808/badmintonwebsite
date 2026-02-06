interface ShopCategoryFilterProps {
  categories: string[];
  categoryFilter: string;
  onFilterChange: (category: string) => void;
}

const ShopCategoryFilter = ({ categories, categoryFilter, onFilterChange }: ShopCategoryFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onFilterChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-semibold font-calibri transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
            categoryFilter === cat
              ? "bg-rose-500 text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-rose-100 border border-slate-200"
          }`}
          aria-pressed={categoryFilter === cat}
          aria-label={`Filter by ${cat}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default ShopCategoryFilter;
