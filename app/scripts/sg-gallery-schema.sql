-- ============================================================
-- SCHEMA PARA THE SG GALLERY
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- Esto crea las tablas necesarias para gestionar colecciones y fotos de la galería
-- ============================================================

-- 1. TABLA DE COLECCIONES DE LA GALERÍA
-- -------------------------------------
CREATE TABLE IF NOT EXISTS sg_gallery_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                           -- Nombre de la colección (ej: "The Studio Collection")
  slug TEXT UNIQUE NOT NULL,                    -- URL-friendly (ej: "the-studio-collection")
  description TEXT,                             -- Descripción de la colección
  cover_image TEXT,                             -- URL de la imagen de portada
  display_order INTEGER DEFAULT 0,              -- Orden de visualización
  is_active BOOLEAN DEFAULT true,               -- Si la colección está activa/visible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE FOTOS DE LA GALERÍA
-- -------------------------------
CREATE TABLE IF NOT EXISTS sg_gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES sg_gallery_collections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                          -- Título de la foto
  description TEXT,                             -- Descripción de la foto
  context_info TEXT,                            -- Información contextual de la obra/escena
  image_url TEXT NOT NULL,                      -- URL de la imagen
  display_order INTEGER DEFAULT 0,              -- Orden de visualización dentro de la colección
  is_active BOOLEAN DEFAULT true,               -- Si la foto está activa/visible
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE RELACIÓN FOTOS-PRODUCTOS
-- ------------------------------------
-- Permite vincular fotos de la galería con productos (esculturas)
CREATE TABLE IF NOT EXISTS sg_gallery_photo_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID NOT NULL REFERENCES sg_gallery_photos(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL REFERENCES products(code) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, product_code)                -- Evitar duplicados
);

-- 4. ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- --------------------------------------
CREATE INDEX IF NOT EXISTS idx_sg_collections_slug ON sg_gallery_collections(slug);
CREATE INDEX IF NOT EXISTS idx_sg_collections_order ON sg_gallery_collections(display_order);
CREATE INDEX IF NOT EXISTS idx_sg_photos_collection ON sg_gallery_photos(collection_id);
CREATE INDEX IF NOT EXISTS idx_sg_photos_order ON sg_gallery_photos(display_order);
CREATE INDEX IF NOT EXISTS idx_sg_photo_products_photo ON sg_gallery_photo_products(photo_id);
CREATE INDEX IF NOT EXISTS idx_sg_photo_products_product ON sg_gallery_photo_products(product_code);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- -------------------------------------
ALTER TABLE sg_gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sg_gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sg_gallery_photo_products ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS: LECTURA PÚBLICA
-- ---------------------------------
DROP POLICY IF EXISTS "SG Collections are viewable by everyone" ON sg_gallery_collections;
CREATE POLICY "SG Collections are viewable by everyone" 
ON sg_gallery_collections FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "SG Photos are viewable by everyone" ON sg_gallery_photos;
CREATE POLICY "SG Photos are viewable by everyone" 
ON sg_gallery_photos FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "SG Photo Products are viewable by everyone" ON sg_gallery_photo_products;
CREATE POLICY "SG Photo Products are viewable by everyone" 
ON sg_gallery_photo_products FOR SELECT 
USING (true);

-- 7. POLÍTICAS RLS: ESCRITURA PARA USUARIOS AUTENTICADOS
-- ------------------------------------------------------
-- Colecciones
DROP POLICY IF EXISTS "Authenticated users can insert sg collections" ON sg_gallery_collections;
CREATE POLICY "Authenticated users can insert sg collections" 
ON sg_gallery_collections FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update sg collections" ON sg_gallery_collections;
CREATE POLICY "Authenticated users can update sg collections" 
ON sg_gallery_collections FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete sg collections" ON sg_gallery_collections;
CREATE POLICY "Authenticated users can delete sg collections" 
ON sg_gallery_collections FOR DELETE 
TO authenticated 
USING (true);

-- Fotos
DROP POLICY IF EXISTS "Authenticated users can insert sg photos" ON sg_gallery_photos;
CREATE POLICY "Authenticated users can insert sg photos" 
ON sg_gallery_photos FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update sg photos" ON sg_gallery_photos;
CREATE POLICY "Authenticated users can update sg photos" 
ON sg_gallery_photos FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete sg photos" ON sg_gallery_photos;
CREATE POLICY "Authenticated users can delete sg photos" 
ON sg_gallery_photos FOR DELETE 
TO authenticated 
USING (true);

-- Relaciones foto-producto
DROP POLICY IF EXISTS "Authenticated users can insert sg photo products" ON sg_gallery_photo_products;
CREATE POLICY "Authenticated users can insert sg photo products" 
ON sg_gallery_photo_products FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update sg photo products" ON sg_gallery_photo_products;
CREATE POLICY "Authenticated users can update sg photo products" 
ON sg_gallery_photo_products FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete sg photo products" ON sg_gallery_photo_products;
CREATE POLICY "Authenticated users can delete sg photo products" 
ON sg_gallery_photo_products FOR DELETE 
TO authenticated 
USING (true);

-- 8. TRIGGERS PARA ACTUALIZAR updated_at
-- --------------------------------------
CREATE TRIGGER update_sg_collections_updated_at
  BEFORE UPDATE ON sg_gallery_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sg_photos_updated_at
  BEFORE UPDATE ON sg_gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================================
-- Puedes descomentar estas líneas para insertar datos de prueba

/*
-- Insertar colecciones de ejemplo basadas en las carpetas existentes
INSERT INTO sg_gallery_collections (name, slug, description, display_order) VALUES
  ('The Studio Collection', 'the-studio-collection', 'Una mirada íntima al proceso creativo en nuestro taller', 1),
  ('Michelangelo Collection', 'michelangelo-collection', 'Homenaje a las obras maestras de Miguel Ángel', 2),
  ('Golden Collection', 'golden-collection', 'Piezas bañadas en luz dorada', 3),
  ('L''Empordà Collection', 'lemporda-collection', 'Inspiración mediterránea desde el corazón de Catalunya', 4);
*/
