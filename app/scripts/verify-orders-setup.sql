-- ============================================================
-- SCRIPT PARA VERIFICAR LA CONFIGURACIÓN DE ORDERS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Verificar que la tabla existe
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- 2. Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

-- 3. Verificar si hay pedidos guardados
SELECT 
  id,
  order_type,
  customer_name,
  customer_email,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- 4. Probar inserción (esto debería funcionar desde el frontend público)
-- Descomenta las siguientes líneas para probar manualmente:
/*
INSERT INTO orders (
  order_type,
  status,
  customer_name,
  customer_email,
  customer_phone
) VALUES (
  'contact',
  'pending',
  'Test User',
  'test@example.com',
  '+34 123 456 789'
) RETURNING *;
*/

-- 5. Si hay errores, verificar permisos
-- Asegúrate de que la política "Public can insert orders" esté activa
