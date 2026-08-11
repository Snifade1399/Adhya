import { Link } from "react-router-dom";
import Cart from "./components/Cart";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";
import { products } from "./data/Products"; 

function Home() {
  const [selectCategory, setSelectCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
  if (selectCategory === "all") {
    return true;
  }

  return product.category === selectCategory;
});

  return (
    <div className="min-h-screen">
      
      <header className="flex items-center gap-4 px-6 py-5 bg-orange-500 text-white shadow-md">
        <button className="text-2xl">
        </button>

        <h1 className="text-2xl font-bold">
          Aaradhya Pooja Store
        </h1>
            
      <Link to="/cart" className="text-2xl font-bold">
        Cart
      </Link>
      
      </header>

      <div className="flex gap-3 px-6 py-6">
        <button 
          onClick={() => setSelectCategory("all")}
          className={selectCategory === "all" ? "bg-orange-500 text-white" : ""}
        >
          All
        </button>

        <button 
          onClick={() => setSelectCategory("utensils")}
          className={selectCategory === "utensils" ? "bg-orange-500 text-white" : ""}
        >
          Utensils
        </button>

        <button 
          onClick={() => setSelectCategory("pooja-essentials")}
          className={selectCategory === "pooja-essentials" ? "bg-orange-500 text-white" : ""}
        >
          Pooja Essentials
        </button>

        <button 
          onClick={() => setSelectCategory("idols")}
          className={selectCategory === "idols" ? "bg-orange-500 text-white" : ""}
        >
          Idols/Statues
        </button>

        <button 
          onClick={() => setSelectCategory("kits")}
          className={selectCategory === "kits" ? "bg-orange-500 text-white" : ""}
        >
          Pooja Kits
        </button>

      </div>

      <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}

function App() {
  const [cart, setCart] = useState([]);

  console.log(cart);

  function addToCart(productId) {
    const existingItem = cart.find(
      (item) => item.productId === productId
    );

    if (!existingItem) {
      setCart([
        ...cart,
        { productId: productId, quantity: 1 }
      ]);
    } else {
      setCart(
        cart.map((item) => {
          if (item.productId === productId) {
            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }

          return item;
        })
      );
    }
  }
function increaseQuantity(productId) {
  console.log("increaseQuantity called:", productId);
  setCart(
    cart.map((item) => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }

      return item;
    })
  );
}

function decreaseQuantity(productId) {
  setCart(
    cart
      .map((item) => {
        if (item.productId === productId) {
          return {
            ...item,
            quantity: item.quantity - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantity > 0)
  );
}
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/products/:id"
        element={<ProductPage addToCart={addToCart} />}
      />
      <Route 
        path="/cart" 
        element={
          <Cart 
            cart={cart} 
            increaseQuantity={increaseQuantity} 
            decreaseQuantity={decreaseQuantity}
          />} 
      />
    </Routes>
  );
}

export default App;
