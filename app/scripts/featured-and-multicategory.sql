-- ============================================================
-- SCHEMA PARA PRODUCTOS DESTACADOS Y MÚLTIPLES CATEGORÍAS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. AÑADIR CAMPO 'FEATURED' A PRODUCTOS
-- --------------------------------------
-- Este campo permite marcar productos como destacados para mostrarlos en Home
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Añadir índice para mejorar el rendimiento de consultas de destacados
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- 2. AÑADIR CAMPO 'FEATURED_ORDER' PARA ORDENAR DESTACADOS
-- --------------------------------------------------------
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- Índice para ordenar destacados
CREATE INDEX IF NOT EXISTS idx_products_featured_order ON products(featured_order);

-- 3. TABLA PARA RELACIÓN PRODUCTOS-CATEGORÍAS (MÚLTIPLES CATEGORÍAS)
-- ------------------------------------------------------------------
-- Esta tabla permite que un producto pertenezca a múltiples categorías
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_code TEXT NOT NULL REFERENCES products(code) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_code, category_id)  -- Evitar duplicados
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_product_categories_product ON product_categories(product_code);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON product_categories(category_id);

-- 4. HABILITAR RLS EN LA NUEVA TABLA
-- ----------------------------------
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS: LECTURA PÚBLICA
-- ---------------------------------
DROP POLICY IF EXISTS "Product categories are viewable by everyone" ON product_categories;
CREATE POLICY "Product categories are viewable by everyone" 
ON product_categories FOR SELECT 
USING (true);

-- 6. POLÍTICAS RLS: ESCRITURA PARA USUARIOS AUTENTICADOS
-- ------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert product categories" ON product_categories;
CREATE POLICY "Authenticated users can insert product categories" 
ON product_categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update product categories" ON product_categories;
CREATE POLICY "Authenticated users can update product categories" 
ON product_categories FOR UPDATE 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete product categories" ON product_categories;
CREATE POLICY "Authenticated users can delete product categories" 
ON product_categories FOR DELETE 
TO authenticated 
USING (true);

-- 7. MIGRAR DATOS EXISTENTES A LA NUEVA TABLA
-- -------------------------------------------
-- Copia las relaciones actuales de category_id a la nueva tabla
INSERT INTO product_categories (product_code, category_id)
SELECT code, category_id 
FROM products 
WHERE category_id IS NOT NULL
ON CONFLICT (product_code, category_id) DO NOTHING;

-- ============================================================
-- FUNCIÓN HELPER PARA OBTENER PRODUCTOS POR CATEGORÍA
-- ============================================================
-- Esta función devuelve productos que pertenecen a una categoría específica
-- incluyendo los que tienen la categoría como principal o secundaria

CREATE OR REPLACE FUNCTION get_products_by_category(cat_id TEXT)
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.*
  FROM products p
  LEFT JOIN product_categories pc ON p.code = pc.product_code
  WHERE p.category_id = cat_id 
     OR pc.category_id = cat_id
  ORDER BY p.code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- NOTAS DE USO:
-- ============================================================
-- 
-- Para marcar un producto como destacado:
--   UPDATE products SET is_featured = true, featured_order = 1 WHERE code = 'PRODUCTO_CODE';
--
-- Para añadir un producto a una categoría adicional:
--   INSERT INTO product_categories (product_code, category_id) VALUES ('PRODUCTO_CODE', 'CATEGORIA_ID');
--
-- Para obtener productos destacados:
--   SELECT * FROM products WHERE is_featured = true ORDER BY featured_order ASC;
--
-- Para obtener todas las categorías de un producto:
--   SELECT c.* FROM categories c
--   JOIN product_categories pc ON c.id = pc.category_id
--   WHERE pc.product_code = 'PRODUCTO_CODE';
--
-- ============================================================
