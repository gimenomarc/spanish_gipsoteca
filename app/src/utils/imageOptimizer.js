/**
 * Image Optimization via CDN Proxy (wsrv.nl)
 *
 * All Supabase Storage images are routed through wsrv.nl which provides:
 * - Edge caching (Supabase is only hit ONCE per unique URL)
 * - Real image transformation (resize, WebP/AVIF, quality)
 * - Works on ANY Supabase plan (no Pro plan needed)
 *
 * This dramatically reduces Supabase egress bandwidth.
 */

const CDN_PROXY_BASE = 'https://wsrv.nl/';

/**
 * Routes a Supabase image URL through the CDN proxy with transformations.
 * Non-Supabase URLs are returned unchanged.
 */
export function cdnUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('supabase.co')) return url;

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
  } = options;

  const params = new URLSearchParams();
  params.set('url', url);
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());
  params.set('output', format);
  params.set('fit', 'cover');

  return `${CDN_PROXY_BASE}?${params.toString()}`;
}

/**
 * @deprecated Use cdnUrl() instead. Kept for backward compatibility.
 * Supabase query-param transformations only work on Pro plan.
 */
export function optimizeImageUrl(url, options = {}) {
  return cdnUrl(url, options);
}

/**
 * Switches _full.webp → _thumb.webp for pre-optimized thumbnail variants.
 * Product images are uploaded in two sizes: _thumb.webp (~5KB) and _full.webp (~150KB).
 */
function getThumbUrl(url) {
  if (!url || typeof url !== 'string') return url;
  if (url.includes('_full.webp')) {
    return url.replace('_full.webp', '_thumb.webp');
  }
  return url;
}

/**
 * All presets are functions: (url) => optimizedUrl
 * Product presets use pre-optimized _thumb/_full variants + CDN caching.
 * Other presets use CDN resize + caching.
 */
export const imagePresets = {
  thumbnail: (url) => cdnUrl(getThumbUrl(url), { width: 100, quality: 75 }),

  card: (url) => cdnUrl(getThumbUrl(url), { width: 400, quality: 80 }),

  detail: (url) => cdnUrl(url, { width: 1200, quality: 85 }),

  full: (url) => cdnUrl(url, { width: 1600, quality: 85 }),

  galleryThumb: (url) => cdnUrl(getThumbUrl(url), { width: 200, quality: 75 }),

  // SG Gallery presets
  sgCollectionCover: (url) => cdnUrl(url, { width: 800, quality: 80 }),
  sgPhotoGrid: (url) => cdnUrl(url, { width: 600, quality: 80 }),
  sgPhotoDetail: (url) => cdnUrl(url, { width: 1400, quality: 85 }),
  sgCollectionHero: (url) => cdnUrl(url, { width: 1920, quality: 80 }),

  // Static page backgrounds
  heroBackground: (url) => cdnUrl(url, { width: 1920, quality: 70 }),
  sectionBackground: (url) => cdnUrl(url, { width: 1400, quality: 70 }),
  portrait: (url) => cdnUrl(url, { width: 800, quality: 80 }),

  // ImageZoom: larger than detail but NOT the raw original
  zoomDetail: (url) => cdnUrl(url, { width: 2400, quality: 90 }),
};

export { getThumbUrl };

/**
 * Generates srcset string for responsive images.
 * With CDN proxy, we can generate real multi-size srcsets.
 */
export function generateSrcSetString(url, sizes = [400, 600, 800, 1200], quality = 80, format = 'webp') {
  if (!url || typeof url !== 'string') return '';
  return sizes
    .map(w => `${cdnUrl(url, { width: w, quality, format })} ${w}w`)
    .join(', ');
}

/**
 * Preset-specific srcset generators.
 * Product _thumb/_full variants don't need srcset (fixed sizes).
 * Other presets generate real responsive srcsets.
 */
export const srcSetPresets = {
  thumbnail: () => null,
  card: () => null,
  detail: (url) => generateSrcSetString(url, [800, 1000, 1200], 85),
  galleryThumb: () => null,
  full: (url) => generateSrcSetString(url, [1000, 1400, 1800], 85),

  sgCollectionCover: (url) => generateSrcSetString(url, [400, 600, 800], 80),
  sgPhotoGrid: (url) => generateSrcSetString(url, [300, 400, 600], 80),
  sgPhotoDetail: (url) => generateSrcSetString(url, [800, 1000, 1400], 85),
  sgCollectionHero: (url) => generateSrcSetString(url, [800, 1200, 1920], 80),
};

export const sizesPresets = {
  thumbnail: '100px',
  card: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  detail: '(max-width: 640px) 100vw, (max-width: 1024px) 800px, 1200px',
  galleryThumb: '200px',
  full: '100vw',
  sgCollectionCover: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw',
  sgPhotoGrid: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  sgPhotoDetail: '(max-width: 1024px) 100vw, 1400px',
  sgCollectionHero: '100vw',
};

/**
 * Optimizes an array of image URLs using a given preset.
 * @param {string[]} urls
 * @param {string|Function} preset - Preset name string or preset function
 */
export function optimizeImageUrls(urls, preset = 'card') {
  if (!Array.isArray(urls)) return urls;
  const fn = typeof preset === 'function' ? preset
    : typeof preset === 'string' ? imagePresets[preset]
    : null;
  if (!fn) return urls;
  return urls.map(url => fn(url));
}
