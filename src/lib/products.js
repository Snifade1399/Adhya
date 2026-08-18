import { supabase } from "./supabaseClient";


export async function fetchAllProducts() {
  return supabase
    .from("products")
    .select("*")
    .order("id");
}


export async function fetchProductById(id) {
  return supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
}


export async function fetchProductBySlug(slug) {
  return supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();
}


export async function fetchProductsByIds(ids) {
  return supabase
    .from("products")
    .select("*")
    .in("id", ids);
}


export async function createProduct(product) {
  return supabase
    .from("products")
    .insert(product)
    .select()
    .single();
}


export async function updateProduct(id, updates) {
  return supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
}


export async function deleteProduct(id) {
  return supabase
    .from("products")
    .delete()
    .eq("id", id);
}
