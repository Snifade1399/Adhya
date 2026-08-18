import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import { supabase } from "../lib/supabaseClient";


function AdminOrders() {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");


  useEffect(() => {

    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("orders")
        .select(
          "id, customer_name, customer_email, total, payment_status, order_status, created_at"
        )
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (err) {
        console.error("Error fetching orders:", err);
        setError(err.message);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, []);


  const filtered = orders.filter((o) => {
    const matchesSearch =
      !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      o.payment_status === statusFilter ||
      o.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });


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
            Loading orders...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--muted)]">
              Orders unavailable
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
            Orders
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {orders.length} order{orders.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--surface)] focus:outline-none focus:border-[var(--text)]/30 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

        </div>

        {/* Order list */}
        {filtered.length === 0 ? (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <p className="text-sm text-[var(--muted)]">
              {orders.length === 0
                ? "No orders yet."
                : "No orders match your search."
              }
            </p>
          </div>
        ) : (

          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
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
                    <th className="text-right px-5 py-3.5 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-medium">
                      Order ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-[var(--border)] last:border-b-0"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium">
                            {order.customer_name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {order.customer_email}
                          </p>
                        </div>
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
                      <td className="px-5 py-3.5 text-right text-xs text-[var(--muted)] font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {order.customer_name}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {order.customer_email}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <StatusBadge status={order.payment_status} />
                      <StatusBadge status={order.order_status} />
                    </div>
                    <p className="text-[10px] text-[var(--muted)] font-mono">
                      {order.id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
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


export default AdminOrders;
