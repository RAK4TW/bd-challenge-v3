export type Product = {
  id: string;
  title: string;
  handle: string;
  productType?: string;
  tags?: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: {
      node: {
        url: string;
        altText: string | null;
      };
    }[];
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        selectedOptions: {
          name: string;
          value: string;
        }[];
        image: {
          url: string;
          altText: string | null;
        } | null;
        availableForSale: boolean;
      };
    }[];
  };
  options: {
    name: string;
    values: string[];
  }[];
};

export type ProductCardProps = {
  product: Product;
  onQuickView: (product: Product, event: React.MouseEvent) => void;
};

export type ProductGridProps = {
  products: Product[];
};

export type ProductFilterProps = {
  products: Product[];
  onFilterChange: (filteredProducts: Product[]) => void;
  onFilterCategoryChange?: (filterCategory: string) => void;
};

export type ProductFilterWrapperProps = {
  products: Product[];
  onFilterChange?: (filterCategory: string, filteredProducts: Product[]) => void;
};