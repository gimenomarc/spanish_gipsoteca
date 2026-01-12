-- ============================================================
-- SCRIPT PARA CORREGIR POLÍTICAS RLS DE ORDERS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;

-- 2. Crear políticas que permitan:
--    - Cualquiera puede INSERTAR (para formularios públicos)
--    - Solo usuarios autenticados pueden LEER y ACTUALIZAR (para admin)

-- Política: Cualquiera puede insertar pedidos (formularios públicos)
CREATE POLICY "Public can insert orders" 
ON orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Política: Usuarios autenticados pueden leer pedidos (admin)
CREATE POLICY "Authenticated users can read orders" 
ON orders FOR SELECT 
TO authenticated 
USING (true);

-- Política: Usuarios autenticados pueden actualizar pedidos (admin)
CREATE POLICY "Authenticated users can update orders" 
ON orders FOR UPDATE 
TO authenticated 
USING (true);

-- Política: Usuarios autenticados pueden eliminar pedidos (admin)
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
CREATE POLICY "Authenticated users can delete orders" 
ON orders FOR DELETE 
TO authenticated 
USING (true);

-- 3. Verificar que las políticas están activas
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
WHERE tablename = 'orders'
ORDER BY policyname;

-- 4. Probar inserción manual (debería funcionar)
INSERT INTO orders (
  order_type,
  status,
  customer_name,
  customer_email,
  customer_phone
) VALUES (
  'contact',
  'pending',
  'Test desde SQL',
  'test@example.com',
  '+34 123 456 789'
) RETURNING id, customer_name, created_at;

-- Si la inserción funciona, elimina este registro de prueba:
-- DELETE FROM orders WHERE customer_email = 'test@example.com';
