import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";


const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];


function AdminLayout({ children }) {

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  async function handleSignOut() {
    await signOut();
    navigate("/");
  }


  function SidebarContent() {
    return (
      <>
        {/* Branding */}
        <div className="px-5 py-6 border-b border-[var(--border)]">
          <Link
            to="/"
            className="text-lg font-semibold tracking-[0.08em]"
          >
            ĀDHYA
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
            Admin
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm rounded-lg transition-colors ${
                  isActive
                    ? "text-[var(--text)] font-medium bg-[var(--text)]/5"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="px-5 py-5 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--muted)] truncate">
            {user.email}
          </p>
          <button
            onClick={handleSignOut}
            className="mt-3 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </>
    );
  }


  return (
    <div className="flex min-h-screen bg-[var(--background)]">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] sticky top-0 h-screen">
        <SidebarContent />
      </aside>


      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">

        <div className="flex items-center justify-between px-4 py-4">

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 text-[var(--text)]"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          <div className="text-center">
            <span className="text-sm font-semibold tracking-[0.08em]">
              ĀDHYA
            </span>
            <span className="ml-1.5 text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
              Admin
            </span>
          </div>

          <div className="w-8" />

        </div>

      </header>


      {/* Mobile slide-out menu */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-transform duration-200 ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div
          className="absolute inset-0 bg-black/20"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className="relative w-72 h-full bg-[var(--surface)] border-r border-[var(--border)] flex flex-col">

          <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
            <div>
              <span className="text-lg font-semibold tracking-[0.08em]">
                ĀDHYA
              </span>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Admin
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-xl leading-none text-[var(--muted)] hover:text-[var(--text)]"
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <SidebarContent />

        </div>

      </div>


      {/* Main content */}
      <main className="flex-1 min-h-screen">
        <div className="lg:hidden h-16" />
        <div className="px-5 sm:px-8 lg:px-10 py-8 lg:py-12 max-w-6xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}


export default AdminLayout;
