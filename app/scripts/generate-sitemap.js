/**
 * Generador de sitemap.xml
 *
 * Uso: node scripts/generate-sitemap.js
 *
 * Requiere que .env tenga REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY.
 * Genera public/sitemap.xml (y build/sitemap.xml si ya existe el build).
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env
function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}
loadEnv();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://vnefocljtdvkabfxwoqg.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SITE_URL = 'https://thespanishgipsoteca.com';

async function fetchTable(table, select) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}&limit=1000`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Error fetching ${table}: ${res.status}`);
  return res.json();
}

function urlEntry({ loc, priority = '0.8', changefreq = 'monthly', lastmod }) {
  const today = lastmod || new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  if (!SUPABASE_KEY) {
    console.error('❌ REACT_APP_SUPABASE_ANON_KEY no encontrada en .env');
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  // Páginas estáticas
  const staticEntries = [
    { loc: `${SITE_URL}/`,          priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/shop`,      priority: '0.9', changefreq: 'weekly' },
    { loc: `${SITE_URL}/sg-gallery`,priority: '0.8', changefreq: 'weekly' },
    { loc: `${SITE_URL}/about`,     priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/contact`,   priority: '0.6', changefreq: 'monthly' },
    { loc: `${SITE_URL}/faqs`,      priority: '0.5', changefreq: 'monthly' },
  ].map(e => urlEntry({ ...e, lastmod: today }));

  // Productos
  const products = await fetchTable('products', 'code,category_id');
  const productEntries = products
    .filter(p => p.code && p.category_id)
    .map(p =>
      urlEntry({
        loc: `${SITE_URL}/product/${p.category_id}/${p.code}`,
        priority: '0.9',
        changefreq: 'monthly',
      })
    );

  // Colecciones SG Gallery
  const collections = await fetchTable('sg_gallery_collections', 'slug').catch(() => []);
  const collectionEntries = collections
    .filter(c => c.slug)
    .map(c =>
      urlEntry({
        loc: `${SITE_URL}/sg-gallery/${c.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
      })
    );

  const allEntries = [...staticEntries, ...productEntries, ...collectionEntries];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.join('\n')}
</urlset>`;

  const publicPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(publicPath, xml, 'utf-8');
  console.log(`✓ sitemap.xml generado: ${allEntries.length} URLs → ${publicPath}`);

  const buildPath = path.join(__dirname, '../build/sitemap.xml');
  if (fs.existsSync(path.join(__dirname, '../build'))) {
    fs.writeFileSync(buildPath, xml, 'utf-8');
    console.log(`✓ sitemap.xml copiado a build/`);
  }
}

generate().catch(err => {
  console.error('❌ Error generando sitemap:', err.message);
  process.exit(1);
});
