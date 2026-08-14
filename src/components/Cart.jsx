import { products } from "../data/Products";
import { Link } from "react-router-dom";

function Cart({ 
  cart, 
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}) {
  const cartProducts = cart.map((item) => {
    const product = products.find(
      (product) => product.id === item.productId
    );

    return {
      ...product,
      quantity: item.quantity,
    };
  });

    const subtotal = cartProducts.reduce((sum, product) => {
    return sum + product.price * product.quantity;

  }, 0);

  if (cartProducts.length === 0) {
    return (
      <div>
        <h1>Your cart is empty!!</h1>
        <p>Looks like you haven't added anything yet.</p>
        
        {/* Link component navigates the user back to the home page */} 
        <Link 
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg"
        >
          Continue Shopping
        </Link>

      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1>Shopping Cart</h1>
      <Link
        to="/"
        className=" text-orange-500 hover:text-orange-700"
      >
        Continue Shopping
      </Link>

      {cartProducts.map((product) => (
        <div 
          key={product.id}
          className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md"
          >
          <img
            className="w-32 h-32 object-cover"
            src={product.image}
            alt={product.name}
          />
          
          {/* Groups the product name and price together */}
          <div className="flex flex-col flex-1">
            <h2>{product.name}</h2>
            <p>₹{product.price}</p>
            <p>Subtotal: ₹{product.price * product.quantity}</p>
          </div>

          {/* Groups the quantity and controls together */}
          <div className="flex items-center gap-2">
            
            
            <button
            className="px-3 py-1 border hover:bg-orange-200 cursor-pointer"
            onClick={() => decreaseQuantity(product.id)}>
            -
            </button>
            
            <span className="font-semibold">
              {product.quantity}
            </span>

            <button 
            className="px-3 py-1 border hover:bg-orange-200 cursor-pointer"
            onClick={() => increaseQuantity(product.id)}>
            +
            </button>

            <button
            className=" px-3 py-1 text-red-600 hover:bg-red-100 rounded cursor-pointer"
              onClick={() => removeFromCart(product.id)}
            >
              Yeet!
            </button>
          </div>
        </div>
      ))}
      {/* Groups the cart pricing information together */}
      <div className="flex justify-end">
       
        {/* Displays the pricing summary for the cart */}
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2> Subtotal: ₹{subtotal}</h2>
        </div>
      </div>
    </div>
  );
}

export default Cart;
