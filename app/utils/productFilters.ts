import { type Product } from "@/app/types/types";

export const getProductTypes = (products: Product[]) => {
  const types = new Set<string>();
  types.add('all'); // Always include "all" option
  
  
  products.forEach(product => {
    const title = product.title.toLowerCase();
    const handle = product.handle.toLowerCase();
    
    // Check for specific categories mentioned
    if (title.includes('shirt') || title.includes('top') || title.includes('tee') || title.includes('blouse') || 
        title.includes('glove') || title.includes('mitts')) types.add('clothing');
    
    if (title.includes('graphics card') || title.includes('gpu') || title.includes('video card') ||
        title.includes('rtx') || title.includes('radeon') || title.includes('nvidia') || title.includes('geforce')) types.add('graphics cards');
    
    if (title.includes('headset') || title.includes('headphones') || title.includes('earphones') ||
        title.includes('keyboard') || title.includes('keypad') || title.includes('mouse') || title.includes('monitor') ||
        title.includes('webcam') || title.includes('microphone') || title.includes('speaker')) types.add('computer accessories');
    
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
  
  return Array.from(types);
};

export const filterProducts = (products: Product[], filterType: string) => {
  if (filterType === 'all') {
    return products;
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

  return filtered;
};
