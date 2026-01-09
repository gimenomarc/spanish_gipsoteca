-- ============================================================
-- POLÍTICAS DE SEGURIDAD PARA EL BACKOFFICE
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- Esto permite que usuarios autenticados puedan gestionar productos
-- ============================================================

-- 1. TABLA PRODUCTS
-- -----------------

-- Permitir SELECT a todos (para la tienda pública)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

-- Permitir INSERT a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
CREATE POLICY "Authenticated users can insert products" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
CREATE POLICY "Authenticated users can update products" 
ON products FOR UPDATE 
TO authenticated 
USING (true);

-- Permitir DELETE a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
CREATE POLICY "Authenticated users can delete products" 
ON products FOR DELETE 
TO authenticated 
USING (true);


-- 2. TABLA CATEGORIES
-- -------------------

-- Permitir SELECT a todos
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" 
ON categories FOR SELECT 
USING (true);

-- Permitir INSERT a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
CREATE POLICY "Authenticated users can insert categories" 
ON categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Permitir UPDATE a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
CREATE POLICY "Authenticated users can update categories" 
ON categories FOR UPDATE 
TO authenticated 
USING (true);

-- Permitir DELETE a usuarios autenticados
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
CREATE POLICY "Authenticated users can delete categories" 
ON categories FOR DELETE 
TO authenticated 
USING (true);


-- 3. STORAGE (product-images bucket)
-- ----------------------------------
-- Nota: Esto se configura en Storage > Policies en el Dashboard

-- Las políticas de Storage se configuran desde:
-- Supabase Dashboard > Storage > product-images > Policies

-- Deberías tener estas políticas:
-- - SELECT: Permitir a todos (para mostrar imágenes públicamente)
-- - INSERT: Permitir a usuarios autenticados
-- - UPDATE: Permitir a usuarios autenticados  
-- - DELETE: Permitir a usuarios autenticados


-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- Después de ejecutar, verifica que RLS esté habilitado:

-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Para ver las políticas existentes:
-- SELECT * FROM pg_policies WHERE tablename IN ('products', 'categories');
