function webpSource(src) {
  if (!src || src.endsWith(".webp")) {
    return null;
  }

  // Only local Vite asset paths have a committed .webp twin to optimize to.
  // Remote files (e.g. Supabase Storage product images) exist exactly as
  // uploaded and must not be rewritten.
  if (/^https?:\/\//i.test(src)) {
    return null;
  }

  return src.replace(/\.(jpe?g|png)$/i, ".webp");
}

function ProductImage({
  src,
  alt = "",
  className,
  loading,
}) {
  const webp = webpSource(src);

  if (!webp) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
      />
    );
  }

  return (
    <picture>
      <source type="image/webp" srcSet={webp} />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
      />
    </picture>
  );
}

export default ProductImage;
