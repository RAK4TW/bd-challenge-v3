
import * as Components from "./components";
import { client } from "@/lib/shopify/serverClient";
import { getShop, getAllProducts } from "@/lib/shopify/graphql/query";
import { Product } from "./types/types";

export default async function Home() {
  "use cache";
  const [shopResp, productsResp] = await Promise.all([
    client.request(getShop),
    client.request(getAllProducts, { variables: { first: 250 } })
  ]);

  const products = productsResp.data?.products?.edges?.map((edge: { node: Product; }) => edge.node) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {shopResp.data?.shop?.name || "Product Store"}
          </h1>
         
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">All Products</h2>
          <p className="text-gray-600">Browse our collection of products</p>
        </div>
        
        <Components.ProductFilterWrapper products={products} />
      </main>
    </div>
  );
}
