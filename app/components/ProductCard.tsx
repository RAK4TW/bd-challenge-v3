import { type Product, type ProductCardProps } from "@/app/types/types";

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const image = product.images.edges[0]?.node;
  const price = product.priceRange.minVariantPrice;

  // Strip HTML tags and truncate description to 250 characters
  const getTruncatedDescription = (htmlContent: string) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    if (plainText.length <= 250) return plainText;
    return plainText.substring(0, 250) + '...';
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickView(product, e);
  };

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
        <h3 className="font-semibold text-lg mb-1 text-gray-800">{product.title}</h3>
        {product.descriptionHtml && (
          <div className="text-sm text-gray-600 mb-2">
            {(() => {
              const plainText = product.descriptionHtml.replace(/<[^>]*>/g, '');
              const isTruncated = plainText.length > 250;
              return (
                <>
                  {getTruncatedDescription(product.descriptionHtml)}
                  {isTruncated && (
                    <button
                      onClick={handleReadMore}
                      className="text-gray-600 hover:text-gray-800 ml-1 underline cursor-pointer"
                    >
                      (read more)
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        )}
        <div className="border-t border-gray-200 pt-2 mb-2 mt-auto">
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
            className="w-full bg-gradient-to-r from-purple-500 to-red-500 text-white hover:from-purple-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 px-3 py-3 cursor-pointer text-sm flex items-center justify-center translate-y-0.5"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
};
