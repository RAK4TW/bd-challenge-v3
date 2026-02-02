"use client";

import { useState } from "react";
import { type Product } from "@/app/types/types";
import { ProductFilter } from "./ProductFilter";
import { ProductGrid } from "./ProductGrid";

type ProductFilterWrapperProps = {
  products: Product[];
  onFilterChange?: (filterCategory: string, filteredProducts: Product[]) => void;
};

export const ProductFilterWrapper = ({ products, onFilterChange }: ProductFilterWrapperProps) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  const handleFilterChange = (filtered: Product[]) => {
    setFilteredProducts(filtered);
    if (onFilterChange) {
      onFilterChange(currentFilter, filtered);
    }
  };

  return (
    <>
      <ProductFilter 
        products={products} 
        onFilterChange={handleFilterChange}
        onFilterCategoryChange={setCurrentFilter}
      />
      {filteredProducts.length > 0 ? (
        <ProductGrid products={filteredProducts} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category.</p>
        </div>
      )}
    </>
  );
};
