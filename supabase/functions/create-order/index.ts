import { createClient } from "jsr:@supabase/supabase-js@2";

/*
 * create-order — the only public checkout entry point.
 * REVIEW ONLY — NOT DEPLOYED.
 *
 * Security model:
 *   - Public (verify_jwt = false): checkout is an unauthenticated storefront.
 *   - Strictly validates the entire request body at this boundary.
 *   - Accepts ONLY customer fields + { product_id, quantity } per item. Price,
 *     subtotal, total and product name are NEVER read from the client; the
 *     6-arg create_order RPC recomputes all pricing from public.products and
 *     remains the final authority.
 *   - The service-role key lives only in Deno.env and never reaches the browser.
 *   - CORS is a browser-origin control only (not a security boundary). The
 *     allowlist is ALLOWED_ORIGIN; production fails closed if it is missing.
 *
 * Runtime env (auto-injected by Supabase unless noted):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ALLOWED_ORIGIN   (production) — the storefront origin, e.g.
 *                     https://your-store.example. REQUIRED in production.
 *                     Browser-origin requests fail closed (403) when missing;
 *                     never falls back to "*" in production.
 *   APP_ENV          (optional) — set to "development" to allow the permissive
 *                     "*" CORS fallback when ALLOWED_ORIGIN is unset. Never
 *                     set in production.
 *
 * Requires the hardened 6-argument create_order RPC (migration 0002, Phase A).
 * Deployment sequencing: apply 0002 (Phase A) -> deploy this function -> deploy
 * frontend -> verify (Phase B) -> apply 0003 (Phase C).
 */

const MAX_BODY_BYTES = 64 * 1024;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OrderItem = {
  product_id: number;
  quantity: number;
};

type ValidatedBody = {
  checkoutId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
};

function isDevelopment(): boolean {
  return Deno.env.get("APP_ENV") === "development";
}

function corsHeadersFor(req: Request): Headers | null {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");
  const requestOrigin = req.headers.get("Origin");

  const base = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (allowedOrigin) {
    if (requestOrigin && requestOrigin !== allowedOrigin) {
      return null;
    }

    const headers = new Headers(base);
    headers.set("Access-Control-Allow-Origin", allowedOrigin);
    headers.append("Vary", "Origin");
    return headers;
  }

  // No allowlist configured. CORS is a browser-origin control, so non-browser
  // requests (no Origin header) are unaffected by it either way.
  if (!isDevelopment()) {
    // Production fails closed: never emit "*". Any browser-origin request is
    // rejected; requests without an Origin header are served without CORS
    // headers rather than being gated by CORS.
    if (requestOrigin) {
      return null;
    }

    return new Headers();
  }

  // Development only: explicit permissive fallback.
  const headers = new Headers(base);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.append("Vary", "Origin");
  return headers;
}

function jsonResponse(
  body: unknown,
  status: number,
  corsHeaders: Headers
): Response {
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(body), { status, headers });
}

function requireNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  return value.trim();
}

function validateItems(value: unknown): OrderItem[] | string {
  if (!Array.isArray(value) || value.length < 1) {
    return "Items must be a non-empty JSON array";
  }

  if (value.length > 12) {
    return "An order may contain at most 12 items";
  }

  const seen = new Set<number>();
  const items: OrderItem[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      return "Each item must be an object";
    }

    const { product_id, quantity } = entry as Record<string, unknown>;

    if (
      typeof product_id !== "number" ||
      !Number.isInteger(product_id) ||
      product_id <= 0
    ) {
      return "Each item must include a valid product_id";
    }

    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      return `Quantity must be between 1 and 10 for product ${product_id}`;
    }

    if (seen.has(product_id)) {
      return "Duplicate products are not allowed in an order";
    }

    seen.add(product_id);
    items.push({ product_id, quantity });
  }

  return items;
}

function validateBody(body: unknown): ValidatedBody | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Request body is required" };
  }

  const data = body as Record<string, unknown>;

  const checkoutId = requireNonEmptyString(data.checkoutId);
  if (!checkoutId || !UUID_PATTERN.test(checkoutId)) {
    return { error: "checkout_id is required and must be a valid UUID" };
  }

  const customerName = requireNonEmptyString(data.customerName);
  if (!customerName) {
    return { error: "Customer name is required" };
  }

  const customerEmail = requireNonEmptyString(data.customerEmail);
  if (!customerEmail) {
    return { error: "Customer email is required" };
  }

  const customerPhone = requireNonEmptyString(data.customerPhone);
  if (!customerPhone) {
    return { error: "Customer phone is required" };
  }

  const shippingAddress = requireNonEmptyString(data.shippingAddress);
  if (!shippingAddress) {
    return { error: "Shipping address is required" };
  }

  const items = validateItems(data.items);
  if (typeof items === "string") {
    return { error: items };
  }

  return {
    checkoutId,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    items,
  };
}

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  if (!corsHeaders) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders);
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Request body too large" }, 413, corsHeaders);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, corsHeaders);
  }

  const parsed = validateBody(body);
  if ("error" in parsed) {
    return jsonResponse({ error: parsed.error }, 400, corsHeaders);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return jsonResponse({ error: "Internal server error" }, 500, corsHeaders);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: parsed.customerName,
      p_customer_email: parsed.customerEmail,
      p_customer_phone: parsed.customerPhone,
      p_shipping_address: parsed.shippingAddress,
      p_checkout_id: parsed.checkoutId,
      p_items: parsed.items,
    });

    if (error) {
      return jsonResponse({ error: error.message }, 400, corsHeaders);
    }

    return jsonResponse(
      {
        orderId: data,
        checkoutId: parsed.checkoutId,
      },
      200,
      corsHeaders
    );
  } catch (err) {
    console.error("Unexpected error creating order:", err);
    return jsonResponse({ error: "Internal server error" }, 500, corsHeaders);
  }
});
