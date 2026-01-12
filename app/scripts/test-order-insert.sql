-- ============================================================
-- SCRIPT PARA PROBAR INSERCIÓN DESDE PÚBLICO
-- ============================================================
-- Este script simula lo que hace el frontend público
-- Ejecuta esto en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Verificar políticas actuales
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- 2. Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'orders';

-- 3. Intentar insertar como usuario público (simulando frontend)
-- Esto debería funcionar si las políticas están correctas
INSERT INTO orders (
  order_type,
  status,
  customer_name,
  customer_email,
  customer_phone
) VALUES (
  'contact',
  'pending',
  'Test desde SQL público',
  'test-public@example.com',
  '+34 999 999 999'
) RETURNING id, customer_name, created_at;

-- 4. Verificar que se insertó
SELECT * FROM orders WHERE customer_email = 'test-public@example.com';

-- 5. Limpiar registro de prueba (opcional)
-- DELETE FROM orders WHERE customer_email = 'test-public@example.com';
