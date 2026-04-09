import { useEffect } from 'react';

const SITE_URL = 'https://thespanishgipsoteca.com';
const DEFAULT_TITLE = 'The Spanish Gipsoteca - Vaciados de Escultura Clásica';
const DEFAULT_DESC =
  'Reproducciones artesanales de esculturas clásicas en escayola. Piezas icónicas para galerías, museos y colecciones privadas.';

function setMeta(attr, name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Actualiza dinámicamente los meta tags SEO para cada página.
 *
 * @param {object} opts
 * @param {string} [opts.title]       - Título de la página (se añade " | The Spanish Gipsoteca")
 * @param {string} [opts.description] - Meta description específica
 * @param {string} [opts.canonical]   - Path canónico, ej: "/product/cat/code"
 * @param {string} [opts.ogImage]     - URL absoluta de imagen Open Graph
 * @param {object} [opts.jsonLd]      - Objeto JSON-LD de Schema.org
 */
export default function useSEO({ title, description, canonical, ogImage, jsonLd } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | The Spanish Gipsoteca` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESC;
    const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : null;

    // Título
    document.title = fullTitle;

    // Meta básicos
    setMeta('name', 'description', desc);

    // Open Graph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', 'website');
    if (ogImage) setMeta('property', 'og:image', ogImage);
    if (canonicalUrl) setMeta('property', 'og:url', canonicalUrl);

    // Twitter
    setMeta('property', 'twitter:title', fullTitle);
    setMeta('property', 'twitter:description', desc);
    if (ogImage) setMeta('property', 'twitter:image', ogImage);

    // Canonical
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    // JSON-LD
    let ldScript = document.getElementById('json-ld-structured');
    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement('script');
        ldScript.id = 'json-ld-structured';
        ldScript.type = 'application/ld+json';
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }

    return () => {
      document.title = DEFAULT_TITLE;
      const ld = document.getElementById('json-ld-structured');
      if (ld) ld.remove();
    };
  }, [title, description, canonical, ogImage, jsonLd]);
}
