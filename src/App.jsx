import { Link } from "react-router-dom";
import Cart from "./components/Cart";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";
import { products } from "./data/Products";
import Navbar from "./components/Navbar";

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

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 lg:px-16 py-20">

        <div>
          <p className="text-sm tracking-[0.3em] uppercase text-[var(--muted)]">
            ĀDHYA
          </p>

          <h2 className="mt-6 text-6xl lg:text-8xl font-semibold tracking-tight leading-none">
            Objects for
            <br />
            ritual & living.
          </h2>

          <p className="mt-8 max-w-md text-lg text-[var(--muted)] leading-relaxed">
            Thoughtfully chosen objects for everyday rituals,
            meaningful spaces, and moments that matter.
          </p>

          <Link
            to="#products"
            className="inline-block mt-10 px-6 py-3 bg-[var(--text)] text-white rounded-full text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Explore Collection
          </Link>
        </div>

        <div className="h-[500px] overflow-hidden rounded-2xl">
          <img
            src={products[0].image}
            alt={products[0].name}
            className="w-full h-full object-cover"
          />
        </div>

      </section>


      {/* Collection */}
      <section
        id="products"
        className="px-6 lg:px-10 pb-20"
      >

        <div className="max-w-7xl mx-auto">

          {/* Collection heading */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">

            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
                Collection
              </p>

              <h2 className="mt-3 text-4xl lg:text-5xl font-semibold tracking-tight">
                Everyday objects
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-[var(--muted)]">
              Objects selected for ritual, home, and everyday moments.
              Simple forms, thoughtful details.
            </p>

          </div>


          {/* Category filters */}
          <div className="flex gap-6 border-b border-[var(--border)] mb-10">

            <button
              onClick={() => setSelectCategory("all")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "all"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setSelectCategory("utensils")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "utensils"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Utensils
            </button>

            <button
              onClick={() => setSelectCategory("pooja-essentials")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "pooja-essentials"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Pooja Essentials
            </button>

            <button
              onClick={() => setSelectCategory("idols")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "idols"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Idols / Statues
            </button>

            <button
              onClick={() => setSelectCategory("kits")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "kits"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Pooja Kits
            </button>

          </div>


          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">

            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}

          </div>

        </div>

      </section>

    </div>
  );
}
function App() {
  const [cart, setCart] = useState([]);

  const cartItemCount = cart.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

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

function removeFromCart(productId) {
  setCart(
    cart.filter((item) => item.productId !== productId)
  );
}

  return (
    <>
      <Navbar cartItemCount={cartItemCount} />
    <Routes>
      <Route path="/" element={<Home/>} />
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
            removeFromCart={removeFromCart}
          />} 
      />
    </Routes>
    </>
  );
}
export default App;
