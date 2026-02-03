"use client";

import { useState, useEffect, useRef } from "react";
import { type Product, type ProductFilterProps } from "@/app/types/types";
import { getProductTypes, filterProducts } from "@/app/utils/productFilters";

export const ProductFilter = ({ products, onFilterChange, onFilterCategoryChange }: ProductFilterProps) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const optionsRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
      setFocusedIndex(0);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    } else if (isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = focusedIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < productTypes.length) {
          setFocusedIndex(nextIndex);
          optionsRef.current[nextIndex]?.focus();
        }
      } else if (event.key === 'Tab' && !event.shiftKey && focusedIndex === productTypes.length - 1) {
        event.preventDefault();
        setIsOpen(false);
      }
    }
  };

  const handleOptionSelect = (filterType: string) => {
    setSelectedFilter(filterType);
    handleFilterChange(filterType);
    setIsOpen(false);
  };

  const handleOptionKeyDown = (event: React.KeyboardEvent, filterType: string, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleOptionSelect(filterType);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(index + 1, productTypes.length - 1);
      setFocusedIndex(nextIndex);
      optionsRef.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      setFocusedIndex(prevIndex);
      optionsRef.current[prevIndex]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      setFocusedIndex(0);
      optionsRef.current[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      const lastIndex = productTypes.length - 1;
      setFocusedIndex(lastIndex);
      optionsRef.current[lastIndex]?.focus();
    }
  };

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
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Product category filter"
          className="bg-white text-gray-800 border-2 border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-black hover:border-gray-800 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 w-full min-w-[250px] md:max-w-[200px] translate-y-0.5"
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
          <div 
            role="listbox"
            aria-label="Product categories"
            aria-activedescendant={`option-${selectedFilter}`}
            className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg z-10 w-full min-w-[200px] md:max-w-[200px]"
          >
            {productTypes.map((type, index) => (
              <button
                key={type}
                ref={(el) => {
                  if (el) optionsRef.current[index] = el;
                }}
                id={`option-${type}`}
                role="option"
                aria-selected={selectedFilter === type}
                tabIndex={-1}
                onClick={() => handleOptionSelect(type)}
                onKeyDown={(e) => handleOptionKeyDown(e, type, index)}
                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
