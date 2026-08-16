import { useEffect, useState } from "react";
import {
  fetchProductById,
  fetchProductBySlug,
} from "../lib/products";

function useProduct(productRef) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);

      const isNumericId = /^\d+$/.test(productRef);

      const { data, error } = isNumericId
        ? await fetchProductById(productRef)
        : await fetchProductBySlug(productRef);

      if (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setProduct(data);
      setLoading(false);
    }

    loadProduct();
  }, [productRef]);


  return {
    product,
    loading,
    error,
  };
}

export default useProduct;
