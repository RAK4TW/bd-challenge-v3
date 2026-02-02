export const getShop = `#graphql
  query getShop {
    shop {
      name
      description
    }
  }
` as const;

export const getCollections = `#graphql
  query getCollections {
    collections(first: 10) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
` as const;

export const getCollectionProducts = `#graphql
  query getCollectionProducts($handle: String!) {
    collection(handle: $handle) {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
` as const;
