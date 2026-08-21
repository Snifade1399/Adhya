import { supabase } from "./supabaseClient";


export const PRODUCT_IMAGE_BUCKET = "product-images";

// No prior file-size convention exists in the project; 5 MB chosen per spec.
export const PRODUCT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const EXTENSION_BY_MIME = Object.fromEntries(
  Object.entries(MIME_BY_EXTENSION).map(([ext, mime]) => [mime, ext]),
);

const STORAGE_PATH_MARKER =
  `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;


function getFileExtension(name) {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index + 1).toLowerCase();
}


export function validateImageFile(file) {
  if (!file) {
    return "Select an image file.";
  }

  const extension = getFileExtension(file.name);
  const extensionOk = ALLOWED_EXTENSIONS.includes(extension);
  const mimeOk = !file.type || Boolean(EXTENSION_BY_MIME[file.type]);

  if (!extensionOk || !mimeOk) {
    return "Only JPG, PNG or WebP images are allowed.";
  }

  if (file.size === 0) {
    return "The selected file is empty.";
  }

  if (file.size > PRODUCT_IMAGE_MAX_SIZE) {
    return "Image must be 5 MB or smaller.";
  }

  return null;
}


export function isStorageImageUrl(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url);
    return (
      parsed.origin === new URL(supabase.supabaseUrl).origin &&
      parsed.pathname.startsWith(STORAGE_PATH_MARKER)
    );
  } catch {
    return false;
  }
}


function extractStoragePath(url) {
  if (!isStorageImageUrl(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return decodeURIComponent(
      parsed.pathname.slice(STORAGE_PATH_MARKER.length),
    );
  } catch {
    return null;
  }
}


export async function uploadProductImage(file, productId) {
  const extension = getFileExtension(file.name);
  const contentType = file.type || MIME_BY_EXTENSION[extension];
  // Unique path so different products/files never collide.
  const path = [
    productId != null ? `product-${productId}` : "products",
    `${Date.now()}-${crypto.randomUUID()}.${extension}`,
  ].join("/");

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(path, file, {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}


// Best-effort cleanup of a replaced Supabase Storage image. Local /images/*
// Vite asset paths (or any non-Storage URL) are intentionally ignored.
export async function deleteProductImageIfStored(url) {
  const path = extractStoragePath(url);

  if (!path) {
    return;
  }

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .remove([path]);

  if (error) {
    throw error;
  }
}
