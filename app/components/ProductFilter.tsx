"use client";

import { useState, useEffect, useRef } from "react";
import { type Product } from "@/app/types/types";
import { getProductTypes, filterProducts } from "@/app/utils/productFilters";

type ProductFilterProps = {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
  onFilterCategoryChange?: (filterCategory: string) => void;
};

export const ProductFilter = ({ products, onFilterChange, onFilterCategoryChange }: ProductFilterProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    const filtered = filterProducts(products, filterType);
    onFilterChange(filtered);
    if (onFilterCategoryChange) onFilterCategoryChange(filterType);
  };

  const productTypes = getProductTypes(products);

  return (
    <div className="mb-8 relative" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white text-gray-800 border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 w-full min-w-[250px] md:max-w-[200px] translate-y-0.5"
        >
          <span className="translate-y-0.5">{selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} flex-shrink-0`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg z-10 w-full min-w-[200px] md:max-w-[200px]">
            {productTypes.map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedFilter(type);
                  handleFilterChange(type);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                  selectedFilter === type ? 'bg-gray-800 text-white' : 'text-gray-800'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
