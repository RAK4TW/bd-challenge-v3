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
      className="border border-gray-200 overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 flex flex-col h-full"
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
        <p className="text-gray-600 mb-4">
          {new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: price.currencyCode,
          }).format(parseFloat(price.amount))}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product, e);
          }}
          className="bg-white border border-gray-300 text-gray-800 px-4 py-2 hover:bg-gray-50 transition-colors mt-auto cursor-pointer"
        >
          Quick View
        </button>
      </div>
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
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'success'>('idle');
  const image = product?.images.edges[0]?.node;
  const price = product?.priceRange.minVariantPrice;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Focus management: move focus into the modal
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      }
      
      // Trap focus within the modal
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
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleAddToBag = async () => {
    if (addToBagState !== 'idle') return;
    
    setAddToBagState('adding');
    
    // Simulate async add with 800-1200ms delay
    const delay = Math.random() * 400 + 800; // 800-1200ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    setAddToBagState('success');
    
    // Reset to idle after 1-2 seconds
    setTimeout(() => {
      setAddToBagState('idle');
    }, Math.random() * 1000 + 1000); // 1000-2000ms
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
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
          className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex flex-col lg:flex-row">
          {/* Media Column */}
          <div className="lg:w-1/2 lg:max-h-[90vh]">
            {isLoading ? (
              <div className="w-full h-64 lg:h-full bg-gray-200 animate-pulse lg:rounded-l-lg"></div>
            ) : image ? (
              <img
                src={image.url}
                alt={image.altText || product.title}
                className="w-full h-64 lg:h-full object-cover lg:rounded-l-lg"
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
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none ml-4"
              >
                ×
              </button>
            </div>
            
            {isLoading ? (
              <div className="mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              </div>
            ) : price && (
              <div className="mb-6">
                <p className="text-2xl font-semibold text-gray-900">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: price.currencyCode,
                  }).format(parseFloat(price.amount))}
                </p>
              </div>
            )}
            
            <div className="flex-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-4">
                 
                  
          
                </div>
              )}
            </div>
            
            {isLoading ? (
              <div className="h-12 bg-gray-200 rounded animate-pulse mt-6"></div>
            ) : (
              <button
                onClick={handleAddToBag}
                disabled={addToBagState !== 'idle'}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 mt-6 ${
                  addToBagState === 'adding'
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : addToBagState === 'success'
                    ? 'bg-green-600 text-white border border-green-600'
                    : 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
                } ${addToBagState !== 'idle' ? 'cursor-not-allowed' : ''}`}
              >
                {addToBagState === 'idle' && 'Add to Bag'}
                {addToBagState === 'adding' && 'Adding...'}
                {addToBagState === 'success' && (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added
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
