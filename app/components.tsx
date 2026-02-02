"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type ComponentPropsWithRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { type Product } from "./types/types";

type NameInputImpl = [string, (name: string) => void];

const NameInputContext = createContext<NameInputImpl>(["", () => { }]);
const useNameInput = () => {
  const context = useContext(NameInputContext);

  if (!context) {
    throw new Error("useNameInput must be used within a NameInputRoot");
  }

  return context;
};

type NameInputRootProps = {
  children: ReactNode;
  initialValue?: string;
};
export const NameInputRoot = ({
  children,
  initialValue,
}: NameInputRootProps) => {
  const [name, setName] = useState(initialValue || "");

  return (
    <NameInputContext.Provider value={[name, setName]}>
      {children}
    </NameInputContext.Provider>
  );
};

type NameInputProps = Omit<
  ComponentPropsWithRef<"input">,
  "value" | "onChange"
>;

export const NameInput = ({ children, ...props }: NameInputProps) => {
  const [name, setName] = useNameInput();

  return (
    <input {...props} value={name} onChange={(e) => setName(e.target.value)} />
  );
};

type NameDisplayProps = {};
export const NameDisplay = (_: NameDisplayProps) => {
  const [name] = useNameInput();
  return name;
};

type ProductCardProps = {
  product: Product;
  onQuickView: (product: Product, event: React.MouseEvent) => void;
};

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  return (
    <div 
      className="border-2 border-red-500 overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 flex flex-col h-full rounded-lg"
      onClick={(e) => onQuickView(product, e)}
    >
      {image && (
        <img
          src={image.url}
          alt={image.altText || product.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-2 text-gray-800 flex-grow">{product.title}</h3>
        <p className="text-gray-600 mb-4 font-lato text-lg">
          Price: {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: price.currencyCode,
          }).format(parseFloat(price.amount))}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product, e);
          }}
          className="bg-gradient-to-r from-purple-500 to-red-500 text-white hover:from-purple-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 px-4 py-2 mt-auto cursor-pointer"
        >
          Quick View
        </button>
      </div>
    </div>
  );
};

type VariantSelectorProps = {
  product: Product;
  selectedOptions: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
};

export const VariantSelector = ({ product, selectedOptions, onOptionChange }: VariantSelectorProps) => {
  const getAvailableOptions = (optionName: string, currentValue?: string) => {
    const availableValues = new Set<string>();
    
    product.variants.edges.forEach(({ node: variant }) => {
      if (!variant.availableForSale) return;
      
      const isCompatible = Object.entries(selectedOptions).every(([name, value]) => 
        name === optionName || value === '' || variant.selectedOptions.some(opt => opt.name === name && opt.value === value)
      );
      
      if (isCompatible) {
        const option = variant.selectedOptions.find(opt => opt.name === optionName);
        if (option) {
          availableValues.add(option.value);
        }
      }
    });
    
    return Array.from(availableValues);
  };

  // Check if product has standard size options only
  const hasSizeOptions = product.options.some(option => {
    const optionName = option.name.toLowerCase();
    if (!optionName.includes('size')) return false;
    
    // Only allow standard size values
    const standardSizes = /^(xs|s|m|l|xl|xxl|2xl|3xl)$/i;
    return option.values.every(value => standardSizes.test(value.trim()));
  });

  // Don't show variant selector if no standard size options detected
  if (!hasSizeOptions) {
    return null;
  }

  return (
    <div className="space-y-4">
      {product.options.map((option) => {
        const availableValues = getAvailableOptions(option.name, selectedOptions[option.name]);
        const allValues = option.values;
        
        return (
          <div key={option.name}>
            <label className="block text-sm font-medium text-gray-700 mb-2 font-lato">
              {option.name}:
            </label>
            <div className="flex flex-wrap gap-2">
              {allValues.map((value) => {
                const isAvailable = availableValues.includes(value);
                const isSelected = selectedOptions[option.name] === value;
                
                return (
                  <button
                    key={value}
                    onClick={() => onOptionChange(option.name, value)}
                    disabled={!isAvailable}
                    className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 font-lato ${
                      isSelected
                        ? 'bg-gray-800 text-white border-gray-800'
                        : isAvailable
                        ? 'bg-white border border-gray-300 text-gray-800 hover:bg-gray-800 hover:text-white hover:border-gray-800'
                        : 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

type QuickViewModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="h-12 bg-gray-200 rounded mt-6"></div>
  </div>
);

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

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      if (closeButtonRef.current) closeButtonRef.current.focus();
      
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

      document.addEventListener('keydown', handleTabKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTabKey);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
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

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      {isOpen && product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
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
                className="w-full h-64 lg:h-full object-cover"
              />
            ) : null}
          </div>
          
          {/* Content Column */}
          <div className="lg:w-1/2 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              ) : (
                <h2 className="text-gray-900 text-2xl font-bold">{product.title}</h2>
              )}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl font-light transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>
            
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
            
            {isLoading ? (
              <div className="h-12 bg-gray-200 rounded animate-pulse mt-6"></div>
            ) : (
              <button
                onClick={handleAddToBag}
                disabled={!resolvedVariant || addToBagState !== 'idle'}
                className={`w-full px-6 py-3 font-medium transition-all duration-200 mt-6 ${
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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

  // Extract unique product types from product data
  const getProductTypes = () => {
    const types = new Set<string>();
    types.add('all'); // Always include "all" option
    
    // Log sample products to understand the data structure
    console.log('Sample products:', products.slice(0, 5));
    
    products.forEach(product => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      
      // Check for specific categories mentioned
      if (title.includes('shirt') || title.includes('top') || title.includes('tee') || title.includes('blouse') || 
          title.includes('glove') || title.includes('mitts')) types.add('clothing');
      
      if (title.includes('graphics card') || title.includes('gpu') || title.includes('video card') || 
          title.includes('rtx') || title.includes('radeon') || title.includes('nvidia') || title.includes('geforce')) types.add('graphics cards');
      
      if (title.includes('headset') || title.includes('headphones') || title.includes('earphones') || 
          title.includes('keyboard') || title.includes('keypad') || title.includes('mouse') || title.includes('monitor')) types.add('computer accessories');
      
      // Also check product type tags if available
      if (product.productType) {
        const productType = product.productType.toLowerCase();
        if (productType.includes('shirt') || productType.includes('top') || productType.includes('glove')) types.add('clothing');
        if (productType.includes('graphics') || productType.includes('gpu') || productType.includes('video card')) types.add('graphics cards');
        if (productType.includes('headset') || productType.includes('headphone') || productType.includes('keyboard') || productType.includes('computer')) types.add('computer accessories');
      }
      
      // Check tags if available
      if (product.tags) {
        product.tags.forEach((tag: string) => {
          const tagLower = tag.toLowerCase();
          if (tagLower.includes('shirt') || tagLower.includes('top') || tagLower.includes('glove')) types.add('clothing');
          if (tagLower.includes('graphics') || tagLower.includes('gpu') || tagLower.includes('rtx') || tagLower.includes('nvidia')) types.add('graphics cards');
          if (tagLower.includes('headset') || tagLower.includes('headphone') || tagLower.includes('keyboard') || tagLower.includes('computer')) types.add('computer accessories');
        });
      }
    });
    
    console.log('Detected types:', Array.from(types));
    return Array.from(types);
  };

  const filterProducts = (filterType: string) => {
    if (filterType === 'all') {
      onFilterChange(products);
      if (onFilterCategoryChange) onFilterCategoryChange('all');
      return;
    }

    const filtered = products.filter(product => {
      const title = product.title.toLowerCase();
      const handle = product.handle.toLowerCase();
      
      switch (filterType) {
        case 'clothing':
          return title.includes('shirt') || title.includes('top') || title.includes('tee') || title.includes('blouse') ||
                 title.includes('glove') || title.includes('mitts') ||
                 (product.productType && (product.productType.toLowerCase().includes('shirt') || product.productType.toLowerCase().includes('glove'))) ||
                 (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes('shirt') || tag.toLowerCase().includes('glove')));
        case 'graphics cards':
          return title.includes('graphics card') || title.includes('gpu') || title.includes('video card') ||
                 title.includes('rtx') || title.includes('radeon') || title.includes('nvidia') || title.includes('geforce') ||
                 (product.productType && product.productType.toLowerCase().includes('graphics')) ||
                 (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes('graphics') || tag.toLowerCase().includes('gpu') || tag.toLowerCase().includes('rtx') || tag.toLowerCase().includes('nvidia')));
        case 'computer accessories':
          return title.includes('headset') || title.includes('headphones') || title.includes('earphones') ||
                 title.includes('keyboard') || title.includes('keypad') || title.includes('mouse') || title.includes('monitor') ||
                 title.includes('webcam') || title.includes('microphone') || title.includes('speaker') ||
                 (product.productType && product.productType.toLowerCase().includes('computer')) ||
                 (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes('headset') || tag.toLowerCase().includes('headphone') || tag.toLowerCase().includes('keyboard') || tag.toLowerCase().includes('computer')));
        default:
          return true;
      }
    });

    console.log(`Filtered ${filterType}:`, filtered.length, 'products');
    onFilterChange(filtered);
    if (onFilterCategoryChange) onFilterCategoryChange(filterType);
  };

  const productTypes = getProductTypes();

  return (
    <div className="mb-8 relative" ref={dropdownRef}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 w-full min-w-[250px] md:max-w-[200px]"
        >
          <span>{selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}</span>
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
            {getProductTypes().map((type) => (
              <button
                key={type}
                onClick={() => {
                  setSelectedFilter(type);
                  filterProducts(type);
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

type ProductGridProps = {
  products: Product[];
};

export const ProductGrid = ({ products }: ProductGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  const handleQuickView = async (product: Product, event: React.MouseEvent) => {
    // Store the triggering element for focus restoration
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
    
    // Restore focus to the triggering element
    if (triggerElement) {
      triggerElement.focus();
      setTriggerElement(null);
    }
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
