/**
 * Image URL handling for Supabase Storage
 *
 * All images are pre-optimized WebP files served directly from Supabase Storage.
 * Variants per image:
 *   - _thumb.webp  (~5-30KB)   → for thumbnails, cards, grid views
 *   - _full.webp   (~100-400KB) → for detail views, hero backgrounds
 *
 * wsrv.nl CDN proxy removed: it was returning 403 errors.
 * Direct Supabase URLs work correctly and images are already WebP-optimized.
 */

/**
 * Returns the URL encoded for use in HTML/CSS (spaces → %20).
 * Non-Supabase URLs are returned unchanged.
 */
export function cdnUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('supabase.co')) return url;
  // Encode spaces so the URL is valid in img src / CSS background-image
  return url.replace(/ /g, '%20');
}

/**
 * @deprecated Use cdnUrl() instead.
 */
export function optimizeImageUrl(url, options = {}) {
  return cdnUrl(url, options);
}

/**
 * Switches _full.webp → _thumb.webp for smaller pre-optimized variants.
 * Products and SG gallery photos have both variants available.
 */
function getThumbUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('_full.webp')) {
    return url.replace('_full.webp', '_thumb.webp');
  }
  return url;
}

/**
 * Image presets — select the right pre-optimized variant per use case.
 * All return a properly-encoded Supabase URL.
 */
export const imagePresets = {
  // ~5KB thumb for product grid cards
  thumbnail: (url) => cdnUrl(getThumbUrl(url)),

  // ~5KB thumb for product cards
  card: (url) => cdnUrl(getThumbUrl(url)),

  // ~150KB full for product detail pages
  detail: (url) => cdnUrl(url),

  // ~150KB full for full-size display
  full: (url) => cdnUrl(url),

  // ~5KB thumb for small gallery thumbnails
  galleryThumb: (url) => cdnUrl(getThumbUrl(url)),

  // SG Gallery — use thumb for grids, full for detail/hero
  sgCollectionCover: (url) => cdnUrl(getThumbUrl(url)),
  sgPhotoGrid:       (url) => cdnUrl(getThumbUrl(url)),
  sgPhotoDetail:     (url) => cdnUrl(url),
  sgCollectionHero:  (url) => cdnUrl(url),

  // Static page backgrounds (single-variant WebP, no _full/_thumb suffix)
  heroBackground:    (url) => cdnUrl(url),
  sectionBackground: (url) => cdnUrl(url),
  portrait:          (url) => cdnUrl(url),

  // Zoom: use the full variant
  zoomDetail: (url) => cdnUrl(url),
};

export { getThumbUrl };

/**
 * srcset is not needed — each preset already selects the right pre-built variant.
 */
export function generateSrcSetString() { return ''; }

export const srcSetPresets = {
  thumbnail:        () => null,
  card:             () => null,
  detail:           () => null,
  galleryThumb:     () => null,
  full:             () => null,
  sgCollectionCover:() => null,
  sgPhotoGrid:      () => null,
  sgPhotoDetail:    () => null,
  sgCollectionHero: () => null,
};

export const sizesPresets = {
  thumbnail:         '100px',
  card:              '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  detail:            '(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px',
  galleryThumb:      '200px',
  full:              '100vw',
  sgCollectionCover: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  sgPhotoGrid:       '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  sgPhotoDetail:     '(max-width: 1024px) 100vw, 1400px',
  sgCollectionHero:  '100vw',
};

/**
 * Applies a preset to an array of image URLs.
 */
export function optimizeImageUrls(urls, preset = 'card') {
  if (!Array.isArray(urls)) return urls;
  const fn = typeof preset === 'function' ? preset
    : typeof preset === 'string' ? imagePresets[preset]
    : null;
  if (!fn) return urls;
  return urls.map(url => fn(url));
}
