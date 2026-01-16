import React from "react";
import { FaSearch, FaTimes, FaBookmark } from "react-icons/fa";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: "all" | "available" | "completed";
  onStatusFilterChange: (status: "all" | "available" | "completed") => void;
  categoryFilter: "all" | "regular" | "tournament";
  onCategoryFilterChange: (category: "all" | "regular" | "tournament") => void;
  selectedDays: string[];
  onDayFilterChange: (day: string) => void;
  myRegistrationsFilter: boolean;
  onMyRegistrationsFilterChange: (filter: boolean) => void;
  onClearFilters: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  selectedDays,
  onDayFilterChange,
  myRegistrationsFilter,
  onMyRegistrationsFilterChange,
  onClearFilters,
}) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    categoryFilter !== "all" ||
    selectedDays.length > 0 ||
    myRegistrationsFilter;

  return (
    <div className="bg-gradient-to-b from-pink-100 to-pink-200 rounded-lg shadow-md p-4 mb-6 shadow-xl font-calibri">
      {/* Search Input */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search events by title, location, or description..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent font-calibri"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Filters - All in one row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* My Registrations Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2 font-calibri">
            My Events
          </label>
          <button
            onClick={() => onMyRegistrationsFilterChange(!myRegistrationsFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full ${myRegistrationsFilter
              ? "bg-purple-600 text-white font-calibri"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 font-calibri"
              } flex items-center justify-center gap-2`}
          >
            <FaBookmark />
            My Registrations
          </button>
        </div>
        {/* Status Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {(["all", "available", "completed"] as const).map((status) => (
              <button
                key={status}
                onClick={() => onStatusFilterChange(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status
                  ? "bg-rose-500 text-white font-calibri"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 font-calibri"
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex-1 min-w-[120px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {(["all", "regular", "tournament"] as const).map((category) => (
              <button
                key={category}
                onClick={() => onCategoryFilterChange(category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoryFilter === category
                  ? "bg-rose-500 text-white font-calibri"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 font-calibri"
                  }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Day of Week Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Day of Week
          </label>
          <div className="flex flex-wrap gap-1.5">
            {daysOfWeek.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => onDayFilterChange(day)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${isSelected
                    ? "bg-rose-500 text-white font-calibri"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300 font-calibri"
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="flex-shrink-0">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <FaTimes />
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
