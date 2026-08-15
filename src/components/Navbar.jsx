import { Link } from "react-router-dom";

function Navbar({ cartItemCount }) {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-6">

        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-semibold tracking-[0.08em]"
        >
          ĀDHYA
        </Link>

        {/* Navigation */}
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
          className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
        >
          Bag ({cartItemCount})
        </Link>

      </div>
    </header>
  );
}

export default Navbar;
