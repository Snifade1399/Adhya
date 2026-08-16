-- 0002: Order payment preparation — PHASE A (backward compatible)
-- REVIEW ONLY — NOT EXECUTED.
--
-- What Phase A does:
--   - Adds the new orders/order_items columns, legacy backfill, unique
--     constraints, and guarded foreign keys.
--   - Creates the hardened 6-argument create_order() ALONGSIDE the existing
--     5-argument function. The old 5-arg function is intentionally NOT dropped
--     here, so the currently deployed frontend keeps working after this file.
--
-- How the two signatures coexist:
--   The 5-arg and 6-arg functions are overloads of the same name. PostgREST
--   resolves the call by argument names: the 6-arg is the only signature with
--   p_checkout_id, so the Edge Function (6 params) resolves to it and the old
--   frontend (5 params) resolves to the old one. Both must be verified in
--   Phase B before Phase C drops the old one.
--
-- Sequencing (3 phases, no downtime window):
--   Phase A: apply THIS file. Old frontend unaffected; new schema is additive.
--   Phase B: deploy the create-order Edge Function + the updated frontend,
--            verify checkout end-to-end (old and new paths both work).
--   Phase C: apply 0003_lockdown_grants.sql ONLY after Phase B is verified.
--            It drops the old 5-arg RPC, locks the 6-arg to service_role, and
--            revokes anon/authenticated write access on the three tables.
--
-- PRE-FLIGHT (already confirmed by operator, re-verified read-only):
--   - 5 existing orders, 0 bad totals
--   - existing create_order() is the exact 5-argument version
--   - products.id = bigint, products.price = numeric
--   - orders.id = uuid, orders.subtotal = integer, orders.total = integer
--   - order_items.price = integer, order_items.quantity = integer,
--     order_items.product_id = bigint
--   - orders / order_items / products all have RLS enabled
--   - products has an anon SELECT policy; anon has SELECT on products
--   - Sanity check 2026-08-16: `price <> trunc(price)` returns 0 rows
--     (all 12 product prices are integers -> integer totals are exact).
--
-- OPERATOR MUST STILL RUN (SQL editor, read-only) before executing:
--   -- A. Existing foreign keys (confirm the FKs below are NOT already present
--   --    under a different name; the guards below are column-aware, so this
--   --    is confirmatory):
--   -- select conname, conrelid::regclass, pg_get_constraintdef(oid)
--   -- from pg_constraint
--   -- where connamespace = 'public'::regnamespace and contype = 'f';
--   --
--   -- B. Existing unique constraints (checkout_id / razorpay_order_id are
--   --    brand-new columns, so no pre-existing UNIQUE can reference them):
--   -- select conname, conrelid::regclass, pg_get_constraintdef(oid)
--   -- from pg_constraint
--   -- where connamespace = 'public'::regnamespace and contype = 'u';
--   --
--   -- C. order_items must have a text column for the name snapshot. If
--   --    `product_name` is not already present it will be added (nullable).
--   --    Confirm nothing else depends on the column name:
--   -- select column_name, data_type, is_nullable
--   -- from information_schema.columns
--   -- where table_schema='public' and table_name='order_items'
--   -- order by ordinal_position;
--
-- ROLLBACK COPY — capture the CURRENT create_order definition BEFORE running:
--   select pg_get_functiondef('public.create_order'::regprocedure);
--
-- Transactional: run as a single script; a failure rolls everything back.

begin;

-- ---------------------------------------------------------------------------
-- 1. orders: status, idempotency key, Razorpay columns
--    checkout_id stays NULLABLE for historical legacy rows.
--    The 6-arg RPC rejects NULL checkout_id; the 5-arg RPC (unchanged, still
--    live during Phase A/B) leaves it NULL and is unaffected by these columns.
-- ---------------------------------------------------------------------------
alter table public.orders
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled', 'legacy')),
  add column if not exists checkout_id uuid,
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text,
  add column if not exists paid_at timestamptz;

-- ---------------------------------------------------------------------------
-- 2. Existing orders -> 'legacy'
--    'legacy' = placed via the old flow; payment state was never recorded and
--    is deliberately NOT asserted. They are NOT marked 'paid'.
-- ---------------------------------------------------------------------------
update public.orders
   set status = 'legacy'
 where created_at < now();

-- ---------------------------------------------------------------------------
-- 3. order_items: snapshot column for product_name (if not already present).
--    New orders snapshot name/price into order_items; legacy items keep their
--    original rows untouched (product_name stays NULL for legacy if added here).
-- ---------------------------------------------------------------------------
alter table public.order_items
  add column if not exists product_name text;

-- ---------------------------------------------------------------------------
-- 4. Unique constraints (guarded, re-runnable)
--    NULL-safety: Postgres UNIQUE constraints treat NULLs as DISTINCT, so
--    multiple NULLs coexist. Both columns are brand new, so every existing row
--    is NULL here -> safe on the 5 legacy rows, and future NULL razorpay rows
--    are fine too.
--    NOTE: orders_checkout_id_key is the arbiter for the 6-arg RPC's
--    ON CONFLICT (checkout_id) idempotency, so it must exist before Phase B.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_checkout_id_key'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_checkout_id_key unique (checkout_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_razorpay_order_id_key'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_razorpay_order_id_key unique (razorpay_order_id);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 5. order_items foreign keys — column-aware guards:
--    add ONLY if no FK already exists on (order_id -> orders.id) or
--    (product_id -> products.id), regardless of the existing constraint name.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.conrelid = 'public.order_items'::regclass
      and c.contype = 'f'
      and a.attname = 'order_id'
      and c.confrelid = 'public.orders'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
    where c.conrelid = 'public.order_items'::regclass
      and c.contype = 'f'
      and a.attname = 'product_id'
      and c.confrelid = 'public.products'::regclass
  ) then
    alter table public.order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references public.products(id);
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 6. create_order: create the hardened 6-argument version.
--    The old 5-argument function is LEFT IN PLACE (Phase A compatibility);
--    Phase C (0003) drops it after the new checkout path is verified.
--    SECURITY DEFINER / SET search_path TO '' preserved.
--    Adds: required p_checkout_id, item shape checks, duplicate-id rejection,
--    max 12 items/distinct products, quantity 1..10, server-side pricing, and
--    race-safe get-or-create idempotency (ON CONFLICT on checkout_id).
-- ---------------------------------------------------------------------------
create or replace function public.create_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address text,
  p_checkout_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
set search_path to ''
security definer
as $$
declare
  v_item jsonb;
  v_product_id bigint;
  v_quantity integer;
  v_price numeric;
  v_subtotal numeric := 0;
  v_total numeric;
  v_order_id uuid;
  v_distinct_count integer;
begin
  -- checkout_id is required by the RPC (column stays nullable only for
  -- historical legacy rows)
  if p_checkout_id is null then
    raise exception 'checkout_id is required';
  end if;

  -- Customer fields
  if p_customer_name is null or trim(p_customer_name) = '' then
    raise exception 'customer name is required';
  end if;
  if p_customer_email is null or trim(p_customer_email) = '' then
    raise exception 'customer email is required';
  end if;
  if p_customer_phone is null or trim(p_customer_phone) = '' then
    raise exception 'customer phone is required';
  end if;
  if p_shipping_address is null or trim(p_shipping_address) = '' then
    raise exception 'shipping address is required';
  end if;

  -- Items must be a non-empty JSON array
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'items must be a non-empty JSON array';
  end if;
  if jsonb_array_length(p_items) < 1 then
    raise exception 'items must be a non-empty JSON array';
  end if;
  if jsonb_array_length(p_items) > 12 then
    raise exception 'an order may contain at most 12 items';
  end if;

  -- Every item must carry a product_id
  if exists (
    select 1 from jsonb_array_elements(p_items) elem
    where (elem->>'product_id') is null
  ) then
    raise exception 'every item must include a product_id';
  end if;

  -- Duplicate product ids rejected
  if exists (
    select 1
    from (
      select (elem->>'product_id') as pid
      from jsonb_array_elements(p_items) elem
      group by (elem->>'product_id')
      having count(*) > 1
    ) dup
  ) then
    raise exception 'duplicate products are not allowed in an order';
  end if;

  -- Max 12 distinct products
  select count(distinct (elem->>'product_id'))
    into v_distinct_count
    from jsonb_array_elements(p_items) elem;

  if v_distinct_count > 12 then
    raise exception 'an order may contain at most 12 different products';
  end if;

  -- Per-item validation: quantity 1..10, product exists, authoritative price
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::bigint;
    v_quantity := (v_item->>'quantity')::integer;

    if v_quantity is null or v_quantity < 1 or v_quantity > 10 then
      raise exception 'quantity must be between 1 and 10 for product %', v_product_id;
    end if;

    select price
      into v_price
      from public.products
     where id = v_product_id;

    if not found then
      raise exception 'product % does not exist', v_product_id;
    end if;

    v_subtotal := v_subtotal + (v_price * v_quantity);
  end loop;

  v_total := v_subtotal; -- shipping is free

  -- Idempotency / concurrency: get-or-create keyed on checkout_id.
  --   - Sequential retry: ON CONFLICT DO NOTHING finds the committed row and
  --     inserts nothing.
  --   - Concurrent race: INSERT ... ON CONFLICT DO NOTHING waits for the
  --     in-flight conflicting transaction. Only the winner inserts order_items;
  --     the loser returns the winner's id and inserts nothing.
  insert into public.orders (
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    checkout_id,
    subtotal,
    total
  )
  values (
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_shipping_address,
    p_checkout_id,
    v_subtotal::integer,
    v_total::integer
  )
  on conflict (checkout_id) do nothing
  returning id into v_order_id;

  if v_order_id is not null then
    -- Winner: snapshot name + price from public.products in the SAME
    -- transaction as the order insert (atomic commit).
    insert into public.order_items (order_id, product_id, product_name, price, quantity)
    select
      v_order_id,
      (elem->>'product_id')::bigint,
      p.name,
      p.price::integer,
      (elem->>'quantity')::integer
    from jsonb_array_elements(p_items) elem
    join public.products p on p.id = (elem->>'product_id')::bigint;
  else
    -- Loser (or pre-existing order): return the existing order id.
    select id
      into v_order_id
      from public.orders
     where checkout_id = p_checkout_id;
  end if;

  return v_order_id;
end;
$$;

commit;
