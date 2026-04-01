"use client";

import { useState, useEffect } from "react";
import { useQuery, useSubscription, useMutation } from "@apollo/client";
import { GET_PRODUCTS, STOCK_UPDATED_SUBSCRIPTION } from "@/lib/queries";
import { UPDATE_STOCK } from "@/lib/mutations";
import { useAuthStore } from "@/lib/store";

export default function ProductsPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const limit = 10;

  const { data, loading, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: { cursor: null, limit },
  });

  const { data: subData } = useSubscription(STOCK_UPDATED_SUBSCRIPTION);
  const { isAuthenticated } = useAuthStore();

  const [updateStock] = useMutation(UPDATE_STOCK);

  useEffect(() => {
    if (data?.products?.items) {
      setProducts(data.products.items);
      setCursor(data.products.cursor);
    }
  }, [data]);

  useEffect(() => {
    if (subData?.stockUpdated) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === subData.stockUpdated.id
            ? { ...p, stock: subData.stockUpdated.stock }
            : p,
        ),
      );
    }
  }, [subData]);

  const loadMore = () => {
    if (!data?.products?.hasMore) return;
    fetchMore({ variables: { cursor, limit } }).then((result) => {
      if (result.data?.products) {
        setProducts((prev) => [...prev, ...result.data.products.items]);
        setCursor(result.data.products.cursor);
      }
    });
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateStock({ variables: { id: productId, stock: newStock } });
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  if (loading && products.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products (Cursor Pagination)</h1>
      <p className="text-gray-600 mb-4">
        This page demonstrates cursor-based pagination with infinite scroll.
        Stock updates are real-time via GraphQL subscriptions.
      </p>

      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600">{product.description}</p>
                )}
                <p className="text-lg font-bold mt-1">${product.price}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${product.stock < 10 ? "text-red-500" : "text-green-500"}`}
                >
                  Stock: {product.stock}
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() =>
                      handleStockUpdate(product.id, product.stock + 1)
                    }
                    className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded mt-1"
                  >
                    +1 Stock
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {data?.products?.hasMore && (
        <button
          onClick={loadMore}
          className="mt-4 px-4 py-2 border rounded hover:bg-gray-50"
        >
          Load More
        </button>
      )}

      {subData && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-medium">Real-time Stock Update!</p>
          <p className="text-sm text-green-600">
            {subData.stockUpdated.name} - New stock:{" "}
            {subData.stockUpdated.stock}
          </p>
        </div>
      )}
    </div>
  );
}
