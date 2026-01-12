-- ============================================================
-- SCRIPT PARA CREAR TABLA DE PEDIDOS/SOLICITUDES
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla para almacenar pedidos y solicitudes de contacto
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_type TEXT NOT NULL, -- 'checkout' o 'contact'
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  
  -- Información del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Información de entrega (solo para checkout)
  delivery_type TEXT, -- 'pickup' o 'shipping'
  delivery_address TEXT,
  delivery_city TEXT,
  delivery_postal_code TEXT,
  delivery_country TEXT,
  
  -- Información del pedido (solo para checkout)
  order_items JSONB, -- Array de productos: [{code, name, quantity, price}]
  total_amount DECIMAL(10, 2),
  shipping_cost DECIMAL(10, 2),
  
  -- Información de contacto (solo para contact)
  subject TEXT,
  message TEXT,
  
  -- Metadatos
  notes TEXT, -- Notas internas del admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

-- Habilitar RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden leer/escribir
DROP POLICY IF EXISTS "Authenticated users can read orders" ON orders;
CREATE POLICY "Authenticated users can read orders" 
ON orders FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
CREATE POLICY "Authenticated users can insert orders" 
ON orders FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;
CREATE POLICY "Authenticated users can update orders" 
ON orders FOR UPDATE 
TO authenticated 
USING (true);

-- Política: Cualquiera puede insertar (para formularios públicos)
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
CREATE POLICY "Public can insert orders" 
ON orders FOR INSERT 
TO public 
WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
-- SELECT * FROM orders ORDER BY created_at DESC;
