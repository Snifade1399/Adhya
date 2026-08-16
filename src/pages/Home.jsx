import { Link } from "react-router-dom";
import { useState } from "react";

import Reveal from "../components/Reveal";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";

import useProducts from "../hooks/useProducts";


function Home() {
  const [selectCategory, setSelectCategory] = useState("all");
  const { products, loading, error } = useProducts();


  const filteredProducts = products.filter((product) => {
    if (selectCategory === "all") {
      return true;
    }

    return product.category === selectCategory;
  });


  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center">

        <p className="text-sm text-[var(--muted)]">
          Loading collection...
        </p>

      </main>
    );
  }


  if (error) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">

        <div className="text-center">

          <p className="text-sm uppercase tracking-[0.25em] text-[var(--muted)]">
            Collection unavailable
          </p>

          <h1 className="mt-4 text-3xl font-semibold">
            Something went wrong.
          </h1>

          <p className="mt-4 text-sm text-[var(--muted)]">
            {error}
          </p>

        </div>

      </main>
    );
  }


  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center px-6 lg:px-16 py-20">

        <div className="animate-fade-up">

          <p className="text-sm tracking-[0.3em] uppercase text-[var(--muted)]">
            ĀDHYA By SNIFADE
          </p>

          <h2 className="mt-6 text-6xl lg:text-8xl font-semibold tracking-tight leading-none">
            Objects for
            <br />
            ritual & living.
          </h2>

          <p className="mt-8 max-w-md text-lg text-[var(--muted)] leading-relaxed">
            Thoughtfully chosen objects for everyday rituals,
            meaningful spaces, and moments that matter.
            Made by the Infamous SNIFADE
          </p>

          <Link
            to="#products"
            className="inline-block mt-10 px-6 py-3 bg-[var(--text)] text-white rounded-full text-sm font-medium hover:bg-[var(--accent)] transition-colors"
          >
            Explore Collection
          </Link>

        </div>


        {/* Hero image */}
        {products.length > 0 && (
          <div className="h-[500px] overflow-hidden rounded-2xl animate-fade-in">

            <ProductImage
              src={products[0].image}
              alt={products[0].name}
              className="w-full h-full object-cover"
              loading="eager"
            />

          </div>
        )}

      </section>


      {/* Philosophy */}
      <Reveal>

        <section
          id="about"
          className="px-6 lg:px-16 py-32 border-t border-[var(--border)] scroll-mt-24"
        >

          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

            <div className="hidden lg:flex justify-center">

              <div className="w-32 h-32 rounded-full border border-[var(--border)] flex items-center justify-center">

                <span className="text-4xl text-[var(--accent)]">
                  ॐ
                </span>

              </div>

            </div>


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
              Objects selected for everyday moments.
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
              onClick={() => setSelectCategory("clothing")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "clothing"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Clothing
            </button>


            <button
              onClick={() => setSelectCategory("footwear")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "footwear"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Footwear
            </button>


            <button
              onClick={() => setSelectCategory("accessories")}
              className={`pb-2 text-sm transition-colors ${
                selectCategory === "accessories"
                  ? "text-[var(--text)] border-b border-[var(--text)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Accessories
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

        </div>

      </section>

    </div>
  );
}


export default Home;
