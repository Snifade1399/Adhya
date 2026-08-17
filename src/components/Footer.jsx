import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-6 lg:px-16 py-16">

      <div className="max-w-6xl mx-auto">

        {/* Main footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div>

            <Link
              to="/"
              className="text-2xl font-semibold tracking-tight"
            >
              ĀDHYA
            </Link>

            <p className="mt-4 max-w-xs text-sm text-[var(--muted)] leading-relaxed">
              Thoughtfully chosen objects for ritual, home,
              and everyday living.
            </p>

          </div>


          {/* Explore */}
          <div>

            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
              Explore
            </p>

            <div className="mt-4 flex flex-col gap-3 text-sm">

              <Link
                to="/#products"
                className="w-fit hover:text-[var(--accent)] transition-colors"
              >
                Collection
              </Link>

              <Link
                to="/"
                className="w-fit hover:text-[var(--accent)] transition-colors"
              >
                About
              </Link>

              <Link
                to="/cart"
                className="w-fit hover:text-[var(--accent)] transition-colors"
              >
                Bag
              </Link>

            </div>

          </div>


          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Help & policies</p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link to="/contact" className="w-fit hover:text-[var(--accent)] transition-colors">Contact us</Link>
              <Link to="/shipping" className="w-fit hover:text-[var(--accent)] transition-colors">Shipping policy</Link>
              <Link to="/returns" className="w-fit hover:text-[var(--accent)] transition-colors">Cancellation & returns</Link>
              <Link to="/privacy" className="w-fit hover:text-[var(--accent)] transition-colors">Privacy policy</Link>
              <Link to="/terms" className="w-fit hover:text-[var(--accent)] transition-colors">Terms & conditions</Link>
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
        <div className="mt-16 pt-6 border-t border-[var(--border)]">

          <p className="text-xs text-[var(--muted)]">
            © 2026 ĀDHYA. All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  );
}

export default Footer;
