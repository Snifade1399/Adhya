import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { supabase } from "../lib/supabaseClient";


function AdminDashboard() {

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      const [productsResult, ordersResult] = await Promise.all([

        supabase
          .from("products")
          .select("id", { count: "exact" }),

        supabase
          .from("orders")
          .select(
            "id, customer_name, total, payment_status, order_status, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(5),

      ]);

      if (!active) {
        return;
      }

      if (productsResult.error) {
        console.error("Error fetching products:", productsResult.error);
        setError(productsResult.error.message);
        setLoading(false);
        return;
      }

      if (ordersResult.error) {
        console.error("Error fetching orders:", ordersResult.error);
      }

      const orders = ordersResult.data || [];
      const paidOrders = orders.filter(
        (o) => o.payment_status === "paid"
      );
      const totalRevenue = paidOrders.reduce(
        (sum, o) => sum + (o.total || 0),
        0
      );

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        totalRevenue,
      });
      setRecentOrders(orders);
      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);


  function formatCurrency(amount) {
    return `\u20B9${amount.toLocaleString("en-IN")}`;
  }


  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }


  function renderContent() {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-sm text-[var(--muted)]">
            Loading dashboard...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Dashboard unavailable
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              Something went wrong.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {error}
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Overview of your store
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: String(stats.totalProducts) },
            { label: "Total Orders", value: String(stats.totalOrders) },
            { label: "Paid Orders", value: String(stats.paidOrders) },
            { label: "Revenue", value: formatCurrency(stats.totalRevenue) },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5"
            >
              <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--muted)]">
                {card.label}
              </p>
              <p className="mt-2.5 text-2xl font-semibold tracking-tight">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/products"
            className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--text)]/20 transition-colors"
          >
            <p className="text-sm font-medium">Manage Products</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Add, edit, or remove products from your catalogue
            </p>
            <p className="mt-3 text-xs text-[var(--accent)] font-medium">
              View products →
            </p>
          </Link>
          <Link
            to="/admin/orders"
            className="block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--text)]/20 transition-colors"
          >
            <p className="text-sm font-medium">View Orders</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Track orders, payment status, and fulfillment
            </p>
            <p className="mt-3 text-xs text-[var(--accent)] font-medium">
              View orders →
            </p>
          </Link>
        </div>

        {/* Recent Orders */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              View all
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
              <p className="text-sm text-[var(--muted)]">
                No orders yet.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Customer
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Amount
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Payment
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Status
                      </th>
                      <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-5 py-3.5">
                          {order.customer_name}
                        </td>
                        <td className="px-5 py-3.5 font-medium">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.order_status} />
                        </td>
                        <td className="px-5 py-3.5 text-[var(--muted)]">
                          {formatDate(order.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[var(--border)]">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {order.customer_name}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <StatusBadge status={order.payment_status} />
                      <StatusBadge status={order.order_status} />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </section>
      </>
    );
  }


  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
}


function StatusBadge({ status }) {

  if (!status) {
    return null;
  }

  return (
    <span className="inline-block px-2 py-0.5 text-[11px] rounded-md border border-[var(--border)] text-[var(--muted)]">
      {status}
    </span>
  );
}


export default AdminDashboard;
