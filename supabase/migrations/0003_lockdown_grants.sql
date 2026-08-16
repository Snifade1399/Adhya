-- 0003: Lockdown grants — PHASE C (apply ONLY after Phase B is verified)
-- REVIEW ONLY — NOT EXECUTED.
--
-- Prerequisites:
--   1. 0002 applied (6-arg create_order exists ALONGSIDE the old 5-arg).
--   2. create-order Edge Function deployed and checkout verified end-to-end
--      through the new path (Phase B).
--   3. Updated frontend (calls the Edge Function) is live.
--   If any of these are not true, DO NOT apply this file — the storefront
--   depends on create_order and would break.
--
-- What Phase C does:
--   - Classifies any remaining old-flow orders (checkout_id IS NULL) as
--     'legacy' BEFORE the old RPC is removed.
--   - Drops the OLD 5-argument create_order RPC. This is the final removal of
--     the old public order path; after this, only the hardened 6-arg RPC exists.
--   - Revokes EXECUTE on the 6-arg create_order from public/anon/authenticated
--     and grants it ONLY to service_role (used by the Edge Function).
--   - Revokes anon/authenticated write access on all three tables (RLS already
--     blocks this; defense in depth).
--   - PRESERVES anon SELECT on products (never revoked; RLS SELECT policy
--     untouched) and all service_role table privileges (not listed below).
--
-- create_order is SECURITY DEFINER and executes as its owner (postgres), so it
-- is unaffected by the table-grant revokes below.

begin;

-- 1. Classify any remaining old-flow orders as legacy, immediately before the
--    old 5-arg RPC is removed.
--    Orders placed through the old function during Phase A/B have
--    checkout_id = NULL and defaulted to status = 'pending'; those are exactly
--    the old-flow orders and must not be left as live 'pending' orders.
--    Orders that have a checkout_id (the new flow) are untouched.
update public.orders
   set status = 'legacy'
 where checkout_id is null
   and status = 'pending';

-- 2. Remove the old 5-argument public RPC.
--    Guarded so re-runs are safe. Explicit signature = no risk to the 6-arg.
drop function if exists public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_items jsonb
);

-- 3. Lock the new 6-argument create_order to service_role only.
--    Newly created functions default to EXECUTE granted to PUBLIC, so revoke
--    from PUBLIC as well as anon/authenticated, then grant to service_role.
revoke execute on function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_checkout_id uuid,
  p_items jsonb
) from public, anon, authenticated;

grant execute on function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_checkout_id uuid,
  p_items jsonb
) to service_role;

-- 4. Remove anon/authenticated write grants on all three tables.
--    SELECT (incl. anon SELECT on products) is deliberately NOT revoked.
revoke insert, update, delete on public.products from anon, authenticated;
revoke insert, update, delete on public.orders from anon, authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;

commit;
