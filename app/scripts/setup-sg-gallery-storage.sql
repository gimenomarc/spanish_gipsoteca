-- ============================================================
-- CONFIGURACIÓN DE STORAGE PARA THE SG GALLERY
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- DESPUÉS de haber creado el bucket 'product-images' si no existe
-- ============================================================

-- Nota: Las imágenes de SG Gallery se guardan en:
-- product-images/sg-gallery/covers/    -> Portadas de colecciones
-- product-images/sg-gallery/photos/    -> Fotos de la galería

-- Las políticas de Storage se configuran en el Dashboard:
-- Supabase Dashboard > Storage > product-images > Policies

-- Asegúrate de tener estas políticas:

-- 1. SELECT (lectura pública)
-- Policy name: "Public read access"
-- Target roles: anon, authenticated
-- Using expression: true

-- 2. INSERT (solo usuarios autenticados)
-- Policy name: "Authenticated users can upload"
-- Target roles: authenticated
-- Using expression: true

-- 3. UPDATE (solo usuarios autenticados)
-- Policy name: "Authenticated users can update"
-- Target roles: authenticated
-- Using expression: true

-- 4. DELETE (solo usuarios autenticados)
-- Policy name: "Authenticated users can delete"
-- Target roles: authenticated
-- Using expression: true

-- ============================================================
-- VERIFICAR QUE EL BUCKET EXISTE
-- ============================================================
-- Si el bucket no existe, créalo desde el Dashboard:
-- Storage > New Bucket > product-images > Public = ON

-- O ejecuta este SQL (solo si el bucket no existe):
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
*/
