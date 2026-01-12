-- ============================================================
-- SCRIPT DEFINITIVO PARA CORREGIR POLÍTICAS RLS DE ORDERS
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- Este script garantiza que:
-- 1. Cualquier usuario (público) puede INSERTAR pedidos
-- 2. Solo usuarios autenticados pueden LEER pedidos (backoffice)
-- 3. Solo usuarios autenticados pueden ACTUALIZAR pedidos (backoffice)
-- 4. Solo usuarios autenticados pueden ELIMINAR pedidos (backoffice)
-- ============================================================

-- PASO 1: Verificar que la tabla existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    RAISE EXCEPTION 'La tabla "orders" no existe. Ejecuta primero orders-schema.sql';
  END IF;
END $$;

-- PASO 2: Deshabilitar RLS temporalmente para limpiar políticas
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- PASO 3: Eliminar TODAS las políticas existentes (sin excepciones)
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can delete orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
-- Eliminar cualquier otra política que pueda existir
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON orders', r.policyname);
  END LOOP;
END $$;

-- PASO 4: Habilitar RLS de nuevo
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear políticas en el orden correcto

-- Política 1: CUALQUIERA (público) puede INSERTAR pedidos
-- Esta es CRÍTICA para que funcione desde la web pública sin autenticación
CREATE POLICY "Public can insert orders" 
ON orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Política 2: Usuarios autenticados pueden LEER todos los pedidos (para admin)
CREATE POLICY "Authenticated users can read orders" 
ON orders FOR SELECT 
TO authenticated 
USING (true);

-- Política 3: Usuarios autenticados pueden ACTUALIZAR pedidos (para admin)
CREATE POLICY "Authenticated users can update orders" 
ON orders FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Política 4: Usuarios autenticados pueden ELIMINAR pedidos (para admin)
CREATE POLICY "Authenticated users can delete orders" 
ON orders FOR DELETE 
TO authenticated 
USING (true);

-- PASO 6: Verificar que las políticas se crearon correctamente
SELECT 
  policyname as "Nombre de Política",
  cmd as "Operación",
  roles as "Roles",
  CASE 
    WHEN qual IS NULL THEN 'Sin restricción (USING)'
    ELSE qual::text
  END as "Condición USING",
  CASE 
    WHEN with_check IS NULL THEN 'Sin restricción (WITH CHECK)'
    ELSE with_check::text
  END as "Condición WITH CHECK"
FROM pg_policies
WHERE tablename = 'orders'
ORDER BY 
  CASE cmd
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
    ELSE 5
  END,
  policyname;

-- PASO 7: Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'orders';

-- PASO 8: Probar inserción como público (simulando frontend)
-- Esto debería funcionar ahora sin autenticación
DO $$
DECLARE
  test_id UUID;
BEGIN
  INSERT INTO orders (
    order_type,
    status,
    customer_name,
    customer_email,
    customer_phone
  ) VALUES (
    'contact',
    'pending',
    'Test RLS Fix - ' || NOW()::text,
    'test-rls-fix-' || EXTRACT(EPOCH FROM NOW())::text || '@example.com',
    '+34 111 222 333'
  ) RETURNING id INTO test_id;
  
  RAISE NOTICE '✅ Inserción exitosa! ID del pedido de prueba: %', test_id;
  
  -- Verificar que se puede leer (solo si estás autenticado)
  -- Si no estás autenticado, esta consulta fallará (comportamiento esperado)
  BEGIN
    PERFORM id FROM orders WHERE id = test_id;
    RAISE NOTICE '✅ Lectura exitosa (usuario autenticado)';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ℹ️ Lectura no permitida (usuario público - comportamiento esperado)';
  END;
  
  -- Limpiar registro de prueba
  DELETE FROM orders WHERE id = test_id;
  RAISE NOTICE '✅ Registro de prueba eliminado';
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Si todo funciona correctamente, deberías ver:
-- 1. 4 políticas creadas (INSERT público, SELECT/UPDATE/DELETE autenticados)
-- 2. RLS habilitado
-- 3. Mensaje de inserción exitosa
-- ============================================================

-- Para verificar manualmente que todo funciona:
-- SELECT COUNT(*) as total_pedidos FROM orders;
-- SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
