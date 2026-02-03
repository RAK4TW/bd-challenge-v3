import { type Product, type ProductCardProps } from "@/app/types/types";

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
          className="w-full h-48 object-cover border-b border-gray-300"
        />
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-lg mb-2 text-gray-800 flex-grow">{product.title}</h3>
        <div className="border-t border-gray-200 pt-2 mb-2"></div>
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
          className="bg-gradient-to-r from-purple-500 to-red-500 text-white hover:from-purple-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 px-3 py-3 mt-auto cursor-pointer text-sm flex items-center justify-center translate-y-0.5"
        >
          Quick View
        </button>
      </div>
    </div>
  );
};
