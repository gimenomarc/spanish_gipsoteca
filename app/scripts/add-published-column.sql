-- ============================================================
-- AÑADIR COLUMNA "PUBLISHED" A LA TABLA PRODUCTS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Añadir columna published (por defecto TRUE para productos existentes)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

-- 2. Actualizar productos existentes a publicados
UPDATE products SET published = true WHERE published IS NULL;

-- 3. Verificar que se añadió correctamente
SELECT code, name, published FROM products LIMIT 10;
