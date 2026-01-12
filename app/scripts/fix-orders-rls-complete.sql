-- ============================================================
-- SCRIPT COMPLETO PARA CORREGIR POLÍTICAS RLS DE ORDERS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- PASO 1: Deshabilitar RLS temporalmente para limpiar políticas
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar TODAS las políticas existentes (por si acaso)
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;

-- PASO 3: Habilitar RLS de nuevo
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas correctas

-- Política 1: CUALQUIERA (público) puede INSERTAR pedidos
-- Esta es la MÁS IMPORTANTE para que funcione desde la web pública
CREATE POLICY "Public can insert orders" 
ON orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Política 2: Usuarios autenticados pueden LEER pedidos (para admin)
CREATE POLICY "Authenticated users can read orders" 
ON orders FOR SELECT 
TO authenticated 
USING (true);

-- Política 3: Usuarios autenticados pueden ACTUALIZAR pedidos (para admin)
CREATE POLICY "Authenticated users can update orders" 
ON orders FOR UPDATE 
TO authenticated 
USING (true);

-- Política 4: Usuarios autenticados pueden ELIMINAR pedidos (para admin)
CREATE POLICY "Authenticated users can delete orders" 
ON orders FOR DELETE 
TO authenticated 
USING (true);

-- PASO 5: Verificar que las políticas se crearon correctamente
SELECT 
  policyname,
  cmd as operacion,
  roles,
  CASE 
    WHEN qual IS NULL THEN 'Sin restricción'
    ELSE qual::text
  END as condicion_select,
  CASE 
    WHEN with_check IS NULL THEN 'Sin restricción'
    ELSE with_check::text
  END as condicion_insert
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY policyname;

-- PASO 6: Probar inserción como público (simulando frontend)
-- Esto debería funcionar ahora
INSERT INTO orders (
  order_type,
  status,
  customer_name,
  customer_email,
  customer_phone
) VALUES (
  'contact',
  'pending',
  'Test después de fix RLS',
  'test-rls-fix@example.com',
  '+34 111 222 333'
) RETURNING id, customer_name, customer_email, created_at;

-- PASO 7: Verificar que se insertó
SELECT 
  id,
  order_type,
  customer_name,
  customer_email,
  status,
  created_at
FROM orders 
WHERE customer_email = 'test-rls-fix@example.com';

-- Si todo funciona, puedes eliminar el registro de prueba:
-- DELETE FROM orders WHERE customer_email = 'test-rls-fix@example.com';

-- ============================================================
-- NOTAS IMPORTANTES:
-- ============================================================
-- 1. La política "Public can insert orders" permite que usuarios
--    NO autenticados inserten pedidos desde la web pública
-- 2. Solo usuarios autenticados pueden leer/actualizar/eliminar
-- 3. Si sigue sin funcionar, verifica:
--    - Que RLS esté habilitado: SELECT rowsecurity FROM pg_tables WHERE tablename = 'orders';
--    - Que las políticas estén activas (ver PASO 5)
--    - Que no haya otras políticas conflictivas
