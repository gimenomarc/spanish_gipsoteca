-- Script SQL para crear las tablas necesarias en Supabase
-- Ejecuta este script en el SQL Editor de Supabase antes de ejecutar el script de carga

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  code TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  folder_name TEXT,
  price TEXT,
  artist TEXT,
  dimensions TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}', -- Array de URLs de imágenes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Habilitar Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir lectura pública
CREATE POLICY "Allow public read access on categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on products" ON products
  FOR SELECT USING (true);

-- Políticas RLS: Solo servicio puede escribir (usando service_role key)
-- Estas políticas permiten que el script con SERVICE_KEY pueda insertar/actualizar
CREATE POLICY "Allow service write access on categories" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow service write access on products" ON products
  FOR ALL USING (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
