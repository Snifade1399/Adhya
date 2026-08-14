import { Link } from "react-router-dom";

function Navbar({ cartItemCount }) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
      
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-semibold tracking-tight"
      >
        ĀDHYA
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-8 text-sm">
        <Link
          to="/#products"
          className="hover:text-[var(--accent)] transition-colors"
        >
          Shop
        </Link>

        <Link
          to="/#products"
          className="hover:text-[var(--accent)] transition-colors"
        >
          Collections
        </Link>

        <Link
          to="/"
          className="hover:text-[var(--accent)] transition-colors"
        >
          About
        </Link>
      </nav>

      {/* Cart */}
      <Link
        to="/cart"
        className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
      >
        Bag ({cartItemCount})
      </Link>

    </header>
  );
}

export default Navbar;
