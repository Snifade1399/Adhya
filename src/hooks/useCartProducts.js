import { useEffect, useState } from "react";
import { fetchProductsByIds } from "../lib/products";
import useCart from "./useCart";

function useCartProducts() {
  const { cart } = useCart();

  const [cartProducts, setCartProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  /*
   * Fetch the products currently in the cart
   * from Supabase.
   */
  useEffect(() => {
    async function loadCartProducts() {
      if (cart.length === 0) {
        setCartProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const productIds = cart.map((item) => item.productId);

      const { data, error } = await fetchProductsByIds(productIds);

      if (error) {
        console.error("Error fetching cart products:", error);
        setError(error.message);
        setCartProducts([]);
        setLoading(false);
        return;
      }

      /*
       * Combine Supabase product information
       * with the quantity stored in the cart.
       */
      const combinedProducts = cart
        .map((item) => {
          const product = data.find(
            (product) => product.id === item.productId
          );

          if (!product) {
            return null;
          }

          return {
            ...product,
            quantity: item.quantity,
          };
        })
        .filter(Boolean);

      setCartProducts(combinedProducts);
      setLoading(false);
    }

    loadCartProducts();
  }, [cart]);


  return {
    cartProducts,
    loading,
    error,
  };
}

export default useCartProducts;
