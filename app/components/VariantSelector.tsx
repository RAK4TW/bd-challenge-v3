import { type Product } from "@/app/types/types";

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
