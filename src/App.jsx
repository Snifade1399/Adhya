import { Link, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Reveal from "./components/Reveal";
import Cart from "./components/Cart";
import ProductCard from "./components/ProductCard";
import ProductPage from "./components/ProductPage";
import Navbar from "./components/Navbar";
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

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 lg:px-16 py-20">

        {/* Hero content */}
        <div className="animate-fade-up">

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

        {/* Hero image */}
        <div className="h-[500px] overflow-hidden rounded-2xl animate-fade-in">

          <img
            src={products[0].image}
            alt={products[0].name}
            className="w-full h-full object-cover"
          />

        </div>

      </section>


      {/* Philosophy */}
<Reveal>

  <section className="px-6 lg:px-16 py-32 border-t border-[var(--border)]">

    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

      {/* Decorative element */}
      <div className="hidden lg:flex justify-center">

        <div className="w-32 h-32 rounded-full border border-[var(--border)] flex items-center justify-center">

          <span className="text-4xl text-[var(--accent)]">
            ॐ
          </span>

        </div>

      </div>

      {/* Philosophy text */}
      <div className="lg:col-span-2 max-w-3xl">

        <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
          The ĀDHYA philosophy
        </p>

        <h2 className="mt-6 text-4xl lg:text-6xl font-semibold tracking-tight leading-tight">
          Ritual, reimagined.
        </h2>

        <p className="mt-6 text-lg lg:text-xl text-[var(--muted)] leading-relaxed">
          Objects that belong in both sacred spaces and everyday homes.
          Thoughtfully chosen, quietly beautiful, and made to become
          part of the way you live.
        </p>

      </div>

    </div>

  </section>

</Reveal>


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
         <div className="flex gap-6 border-b border-[var(--border)] mb-10 overflow-x-auto">
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

  {filteredProducts.map((product, index) => (
    <Reveal
      key={product.id}
      delay={index * 60}
    >
      <ProductCard
        product={product}
      />
    </Reveal>
  ))}

</div>


          {/* Footer */}
          <footer className="border-t border-[var(--border)] px-6 lg:px-16 py-16">

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Brand */}
              <div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  ĀDHYA
                </h2>

                <p className="mt-4 max-w-xs text-sm text-[var(--muted)] leading-relaxed">
                  Thoughtfully chosen objects for ritual, home, and everyday living.
                </p>

              </div>


              {/* Navigation */}
              <div>

                <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                  Explore
                </p>

                <div className="mt-4 flex flex-col gap-3 text-sm">

                  <Link
                    to="/#products"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    Collection
                  </Link>

                  <Link
                    to="/"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    About
                  </Link>

                  <Link
                    to="/cart"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    Bag
                  </Link>

                </div>

              </div>


              {/* Philosophy */}
              <div>

                <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
                  ĀDHYA
                </p>

                <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                  Ritual, reimagined.
                </p>

              </div>

            </div>


            {/* Copyright */}
            <div className="max-w-6xl mx-auto mt-16 pt-6 border-t border-[var(--border)]">

              <p className="text-xs text-[var(--muted)]">
                © 2026 ĀDHYA. All rights reserved.
              </p>

            </div>

          </footer>

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


  function addToCart(productId) {
    const existingItem = cart.find(
      (item) => item.productId === productId
    );

    if (!existingItem) {
      setCart([
        ...cart,
        {
          productId: productId,
          quantity: 1,
        },
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

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/products/:id"
          element={
            <ProductPage
              addToCart={addToCart}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

      </Routes>
    </>
  );
}


export default App;
