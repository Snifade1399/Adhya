import { products } from "../data/Products";

function Cart({ 
  cart, 
  increaseQuantity,
  decreaseQuantity,
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

    const total = cartProducts.reduce((sum, product) => {
    return sum + product.price * product.quantity;

  }, 0);

  return (
    <div>
      <h1>Shopping Cart</h1>

      {cartProducts.map((product) => (
        <div key={product.id}>
          <img
            className="w-32 h-32 object-cover"
            src={product.image}
            alt={product.name}
          />

          <h2>{product.name}</h2>
          
          <p>₹{product.price}</p>
          
          <p>Quantity: {product.quantity}</p>
          
          <button onClick={() => decreaseQuantity(product.id)}>
            -
          </button>
          
          <button onClick={() => increaseQuantity(product.id)}>
            +
          </button>
        </div>
      ))}

      <h2> Total: ₹{total}</h2>
    </div>
  );
}

export default Cart;
