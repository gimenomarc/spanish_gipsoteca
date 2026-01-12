-- ============================================================
-- SCRIPT PARA CORREGIR COLECCIONES DE SG GALLERY
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. CORREGIR L'Empordà Collection
-- --------------------------------
UPDATE sg_gallery_collections 
SET name = 'L''Empordà Collection' 
WHERE slug = 'lemporda-collection' 
   OR name LIKE '%L_Empordà%'
   OR name LIKE '%L_Emporda%';

-- 2. CAMBIAR FOTO DE PORTADA DE GOLDEN COLLECTION
-- ------------------------------------------------
-- NOTA: Necesitas subir la imagen "GC_Torso frente_T002" a Supabase Storage primero
-- Ruta esperada: sg-gallery/covers/golden-collection.jpg (o .png)
-- Luego ejecuta este UPDATE con la URL correcta:

-- UPDATE sg_gallery_collections 
-- SET cover_image = 'https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/sg-gallery/covers/golden-collection.jpg'
-- WHERE slug = 'golden-collection';

-- ============================================================
-- INSTRUCCIONES PARA CAMBIAR LA FOTO DE GOLDEN COLLECTION:
-- ============================================================
-- 1. Sube la imagen "GC_Torso frente_T002" a Supabase Storage:
--    - Ve a Storage > product-images > sg-gallery > covers
--    - Sube el archivo como "golden-collection.jpg" (o el formato que tenga)
-- 
-- 2. Copia la URL pública de la imagen
-- 
-- 3. Ejecuta el UPDATE de arriba con la URL correcta
-- 
-- ============================================================
