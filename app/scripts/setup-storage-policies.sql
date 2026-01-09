-- ============================================================
-- POLÍTICAS DE STORAGE PARA product-images
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Permitir a TODOS leer imágenes (público)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 2. Permitir a usuarios AUTENTICADOS subir imágenes
CREATE POLICY "Authenticated can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 3. Permitir a usuarios AUTENTICADOS actualizar imágenes
CREATE POLICY "Authenticated can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- 4. Permitir a usuarios AUTENTICADOS eliminar imágenes
CREATE POLICY "Authenticated can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ============================================================
-- ALTERNATIVA: Permitir TODO (más simple pero menos seguro)
-- Si lo anterior no funciona, usa esto:
-- ============================================================

-- DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated can upload images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated can update images" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated can delete images" ON storage.objects;

-- CREATE POLICY "Allow all operations on product-images"
-- ON storage.objects
-- FOR ALL
-- USING (bucket_id = 'product-images')
-- WITH CHECK (bucket_id = 'product-images');
