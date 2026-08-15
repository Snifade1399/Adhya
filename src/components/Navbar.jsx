import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar({ cartItemCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);

  const navigate = useNavigate();

  function closeMenu(destination) {
    setMenuClosing(true);

    setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);

      if (destination) {
        navigate(destination);
      }
    }, 250);
  }

  function toggleMenu() {
    if (menuOpen) {
      closeMenu();
    } else {
      setMenuOpen(true);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-[0.08em]"
        >
          ĀDHYA
        </Link>


        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">

          <Link
            to="/#products"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Shop
          </Link>

          <Link
            to="/#products"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Collections
          </Link>

          <Link
            to="/"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            About
          </Link>

        </nav>


        {/* Cart */}
        <Link
          to="/cart"
          className="hidden md:block text-sm font-medium hover:text-[var(--accent)] transition-colors"
        >
          Bag ({cartItemCount})
        </Link>


        {/* Mobile menu button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-xl"
          aria-label="Toggle menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>

      </div>


      {/* Mobile navigation */}
      {menuOpen && (
        <div
          className={`md:hidden border-t border-[var(--border)] px-6 py-6 ${
            menuClosing
              ? "animate-menu-close"
              : "animate-menu-reveal"
          }`}
        >

          <nav className="flex flex-col gap-5 text-sm">

            <button
              onClick={() => closeMenu("/#products")}
              className="text-left text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Shop
            </button>

            <button
              onClick={() => closeMenu("/#products")}
              className="text-left text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Collections
            </button>

            <button
              onClick={() => closeMenu("/")}
              className="text-left text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              About
            </button>

            <button
              onClick={() => closeMenu("/cart")}
              className="text-left text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              Bag ({cartItemCount})
            </button>

          </nav>

        </div>
      )}

    </header>
  );
}

export default Navbar;
