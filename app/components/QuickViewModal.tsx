"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { type Product } from "@/app/types/types";
import { VariantSelector } from "./VariantSelector";
import { LoadingSkeleton } from "./LoadingSkeleton";

type QuickViewModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
};

export const QuickViewModal = ({ product, isOpen, onClose, isLoading = false }: QuickViewModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'success'>('idle');
  const image = product?.images.edges[0]?.node;
  const price = product?.priceRange.minVariantPrice;

  // Get resolved variant based on selected options
  const getResolvedVariant = () => {
    if (!product) return null;
    
    // Check if product has standard size options only
    const hasSizeOptions = product.options.some(option => {
      const optionName = option.name.toLowerCase();
      if (!optionName.includes('size')) return false;
      
      const standardSizes = /^(xs|s|m|l|xl|xxl|2xl|3xl)$/i;
      return option.values.every(value => standardSizes.test(value.trim()));
    });
    
    if (!hasSizeOptions) {
      return product.variants.edges.find(({ node: variant }) => variant.availableForSale)?.node || null;
    }
    
    return product.variants.edges.find(({ node: variant }) => {
      return variant.selectedOptions.every(option => 
        selectedOptions[option.name] === option.value
      );
    })?.node || null;
  };

  const resolvedVariant = getResolvedVariant();
  const displayPrice = resolvedVariant?.price || price;
  const displayImage = resolvedVariant?.image || image;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'hidden';
      
      // Focus management
      if (closeButtonRef.current) closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) onClose();
  };

  const handleAddToBag = async () => {
    if (!resolvedVariant || addToBagState !== 'idle') return;
    
    setAddToBagState('adding');
    const delay = Math.random() * 400 + 800; 
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setAddToBagState('success');
    
    // Close modal after showing success state briefly
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedOptions({});
      setAddToBagState('idle');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-3 right-4 w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-3xl font-light transition-colors cursor-pointer z-10"
          >
            x
          </button>
          {product && (
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white border-2 border-red-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
        <div className="flex flex-col lg:flex-row ">
          {/* Media Column */}
          <div className="lg:w-1/2 lg:max-h-[90vh]">
            {isLoading ? (
              <div className="w-full h-64 lg:h-full bg-gray-200 animate-pulse"></div>
            ) : displayImage ? (
              <img
                src={displayImage.url}
                alt={displayImage.altText || product.title}
                className="w-full h-64 lg:h-full object-cover border-b border-gray-300 lg:border-r lg:border-gray-300"
              />
            ) : (
              <div className="w-full h-64 lg:h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Content Column */}
          <div className="lg:w-1/2 p-6 flex flex-col">
            <div className="mb-2">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              ) : (
                <h2 className="text-gray-900 text-2xl font-bold">{product.title}</h2>
              )}
            </div>
            
            {product.descriptionHtml && (
              <div className="mb-4">
                {isLoading ? (
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div 
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                )}
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mb-2"></div>
            
            {isLoading ? (
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ) : displayPrice && (
              <div className="mb-6">
                <p className="text-gray-600 mb-6 font-lato text-lg">
                  Price: {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: displayPrice.currencyCode,
                  }).format(parseFloat(displayPrice.amount))}
                </p>
              </div>
            )}
            
            <div className="flex-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-4">
                  {product.options && product.options.length > 0 && (
                    <VariantSelector
                      product={product}
                      selectedOptions={selectedOptions}
                      onOptionChange={handleOptionChange}
                    />
                  )}
                </div>
              )}
            </div>
            
            {/* Add to Bag Button */}
            {isLoading ? (
              <div className="h-12 bg-gray-200 rounded animate-pulse mt-6"></div>
            ) : (
              <button
                onClick={handleAddToBag}
                disabled={!resolvedVariant || addToBagState !== 'idle'}
                className={`w-full px-6 py-3 font-medium transition-all duration-200 mt-6 flex items-center justify-center translate-y-0.5 ${
                  addToBagState === 'adding'
                    ? 'bg-purple-600 text-white'
                    : addToBagState === 'success'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gradient-to-r from-purple-500 to-red-500 text-white hover:from-purple-600 hover:to-red-600 transform hover:scale-105'
                } ${!resolvedVariant || addToBagState !== 'idle' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                {addToBagState === 'idle' && 'Add to Bag'}
                {addToBagState === 'adding' && 'Adding...'}
                {addToBagState === 'success' && (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added!
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
