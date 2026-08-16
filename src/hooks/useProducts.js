import { useEffect, useState } from "react";
import { fetchAllProducts } from "../lib/products";

function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await fetchAllProducts();

      if (error) {
        console.error("Error fetching products:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setProducts(data);
      setLoading(false);
    }

    loadProducts();
  }, []);


  return {
    products,
    loading,
    error,
  };
}

export default useProducts;
