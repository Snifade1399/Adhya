import { useEffect, useState } from "react";
import { CartContext } from "./cartContext";

function CartProvider({ children }) {

  /*
   * Restore cart from localStorage.
   */
  const [cart, setCart] = useState(() => {

    try {

      const savedCart = localStorage.getItem("adhya-cart");

      if (!savedCart) {
        return [];
      }

      return JSON.parse(savedCart);

    } catch (error) {

      console.error("Could not restore cart:", error);

      return [];

    }

  });


  /*
   * Save cart whenever it changes.
   */
  useEffect(() => {

    try {

      localStorage.setItem(
        "adhya-cart",
        JSON.stringify(cart)
      );

    } catch (error) {

      console.error("Could not save cart:", error);

    }

  }, [cart]);


  const cartItemCount = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);


  function addToCart(productId) {

    setCart((currentCart) => {

      const existingItem = currentCart.find(
        (item) => item.productId === productId
      );


      if (!existingItem) {

        return [
          ...currentCart,
          {
            productId: productId,
            quantity: 1,
          },
        ];

      }


      return currentCart.map((item) => {

        if (item.productId === productId) {

          return {
            ...item,
            quantity: item.quantity + 1,
          };

        }

        return item;

      });

    });

  }


  function increaseQuantity(productId) {

    setCart((currentCart) => {

      return currentCart.map((item) => {

        if (item.productId === productId) {

          return {
            ...item,
            quantity: item.quantity + 1,
          };

        }

        return item;

      });

    });

  }


  function decreaseQuantity(productId) {

    setCart((currentCart) => {

      return currentCart
        .map((item) => {

          if (item.productId === productId) {

            return {
              ...item,
              quantity: item.quantity - 1,
            };

          }

          return item;

        })
        .filter((item) => item.quantity > 0);

    });

  }


  function removeFromCart(productId) {

    setCart((currentCart) => {

      return currentCart.filter(
        (item) => item.productId !== productId
      );

    });

  }


  /*
   * Completely empty the cart.
   */
  function clearCart() {
    setCart([]);
  }


  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemCount,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
