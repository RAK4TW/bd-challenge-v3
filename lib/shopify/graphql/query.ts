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

export const getAllProducts = `#graphql
  query getAllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          productType
          tags
          descriptionHtml
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
                availableForSale
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
` as const;
