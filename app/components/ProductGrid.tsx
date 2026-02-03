"use client";

import { useState } from "react";
import { type Product, type ProductGridProps } from "@/app/types/types";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";

export const ProductGrid = ({ products }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleQuickView = async (product: Product, event: React.MouseEvent) => {
    setTriggerElement(event.currentTarget as HTMLElement);
    setSelectedProduct(product);
    setIsModalOpen(true);
    setIsLoading(true);
    
    // Simulate loading delay for demo purposes
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsLoading(false);
    
    if (triggerElement) triggerElement.focus();
    
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onQuickView={handleQuickView}
          />
        ))}
      </div>
      <QuickViewModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isLoading}
      />
    </>
  );
};
