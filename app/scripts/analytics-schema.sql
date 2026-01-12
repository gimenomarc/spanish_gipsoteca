-- ============================================================
-- SCHEMA PARA ANALYTICS Y TRACKING
-- ============================================================
-- Ejecuta este SQL en Supabase Dashboard > SQL Editor
-- Esto crea las tablas necesarias para trackear visitas y eventos
-- ============================================================

-- 1. TABLA DE VISITAS (PAGE VIEWS)
-- --------------------------------
CREATE TABLE IF NOT EXISTS analytics_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,                    -- ID de sesión del usuario
  page_path TEXT NOT NULL,                     -- Ruta de la página (/shop, /product/...)
  page_title TEXT,                              -- Título de la página
  referrer TEXT,                                -- URL de origen (si viene de otra página)
  user_agent TEXT,                              -- User agent del navegador
  device_type TEXT,                              -- mobile, tablet, desktop
  browser TEXT,                                  -- Chrome, Firefox, Safari, etc.
  os TEXT,                                       -- Windows, macOS, iOS, Android, etc.
  screen_width INTEGER,                          -- Ancho de pantalla
  screen_height INTEGER,                         -- Alto de pantalla
  language TEXT,                                 -- Idioma del navegador
  country TEXT,                                  -- País (si se puede detectar)
  timezone TEXT,                                 -- Zona horaria
  ip_address INET,                               -- IP (opcional, para privacidad puede ser NULL)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA DE EVENTOS (CLICKS, ACCIONES)
-- --------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,                     -- ID de sesión
  event_type TEXT NOT NULL,                      -- click, view_product, add_to_cart, checkout_start, etc.
  event_name TEXT NOT NULL,                      -- Nombre descriptivo del evento
  page_path TEXT,                                -- Página donde ocurrió el evento
  element_id TEXT,                               -- ID del elemento (si aplica)
  element_text TEXT,                             -- Texto del elemento (si aplica)
  metadata JSONB,                                -- Datos adicionales (product_code, category_id, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA DE SESIONES (PARA AGRUPAR VISITAS)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,              -- ID único de sesión
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_count INTEGER DEFAULT 1,                  -- Número de páginas visitadas
  duration_seconds INTEGER DEFAULT 0,            -- Duración de la sesión
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  referrer TEXT,
  is_bounce BOOLEAN DEFAULT true,               -- Si solo visitó una página
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ÍNDICES PARA MEJORAR EL RENDIMIENTO
-- --------------------------------------
CREATE INDEX IF NOT EXISTS idx_visits_session ON analytics_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_visits_page_path ON analytics_visits(page_path);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON analytics_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visits_device_type ON analytics_visits(device_type);

CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON analytics_sessions(created_at DESC);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- -------------------------------------
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS RLS: INSERCIÓN PÚBLICA (cualquiera puede insertar eventos)
-- ------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can insert visits" ON analytics_visits;
CREATE POLICY "Anyone can insert visits" 
ON analytics_visits FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert events" ON analytics_events;
CREATE POLICY "Anyone can insert events" 
ON analytics_events FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert sessions" ON analytics_sessions;
CREATE POLICY "Anyone can insert sessions" 
ON analytics_sessions FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 7. POLÍTICAS RLS: LECTURA SOLO PARA AUTENTICADOS (admin)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view visits" ON analytics_visits;
CREATE POLICY "Authenticated users can view visits" 
ON analytics_visits FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view events" ON analytics_events;
CREATE POLICY "Authenticated users can view events" 
ON analytics_events FOR SELECT 
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can view sessions" ON analytics_sessions;
CREATE POLICY "Authenticated users can view sessions" 
ON analytics_sessions FOR SELECT 
TO authenticated
USING (true);

-- 8. POLÍTICAS RLS: ACTUALIZACIÓN DE SESIONES (para actualizar duración)
-- ----------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can update sessions" ON analytics_sessions;
CREATE POLICY "Anyone can update sessions" 
ON analytics_sessions FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 9. TRIGGERS PARA ACTUALIZAR updated_at
-- --------------------------------------
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. FUNCIÓN PARA OBTENER ESTADÍSTICAS RESUMIDAS
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION get_analytics_summary(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_visits BIGINT,
  unique_visitors BIGINT,
  total_page_views BIGINT,
  avg_session_duration NUMERIC,
  bounce_rate NUMERIC,
  top_pages JSONB,
  top_devices JSONB,
  top_browsers JSONB,
  top_referrers JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Total de visitas
    (SELECT COUNT(*)::BIGINT FROM analytics_visits WHERE created_at BETWEEN start_date AND end_date) as total_visits,
    
    -- Visitantes únicos (por session_id)
    (SELECT COUNT(DISTINCT session_id)::BIGINT FROM analytics_visits WHERE created_at BETWEEN start_date AND end_date) as unique_visitors,
    
    -- Total de páginas vistas
    (SELECT COUNT(*)::BIGINT FROM analytics_visits WHERE created_at BETWEEN start_date AND end_date) as total_page_views,
    
    -- Duración promedio de sesión (en segundos)
    (SELECT COALESCE(AVG(duration_seconds), 0)::NUMERIC FROM analytics_sessions 
     WHERE first_visit_at BETWEEN start_date AND end_date) as avg_session_duration,
    
    -- Tasa de rebote (% de sesiones con solo 1 página)
    (SELECT 
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE page_count = 1)::NUMERIC / COUNT(*)::NUMERIC * 100)
        ELSE 0
      END
     FROM analytics_sessions 
     WHERE first_visit_at BETWEEN start_date AND end_date) as bounce_rate,
    
    -- Top 10 páginas más visitadas
    (SELECT jsonb_agg(jsonb_build_object('path', page_path, 'views', views))
     FROM (
       SELECT page_path, COUNT(*) as views
       FROM analytics_visits
       WHERE created_at BETWEEN start_date AND end_date
       GROUP BY page_path
       ORDER BY views DESC
       LIMIT 10
     ) sub) as top_pages,
    
    -- Top 10 dispositivos
    (SELECT jsonb_agg(jsonb_build_object('device', device_type, 'count', count))
     FROM (
       SELECT device_type, COUNT(*) as count
       FROM analytics_visits
       WHERE created_at BETWEEN start_date AND end_date
       AND device_type IS NOT NULL
       GROUP BY device_type
       ORDER BY count DESC
       LIMIT 10
     ) sub) as top_devices,
    
    -- Top 10 navegadores
    (SELECT jsonb_agg(jsonb_build_object('browser', browser, 'count', count))
     FROM (
       SELECT browser, COUNT(*) as count
       FROM analytics_visits
       WHERE created_at BETWEEN start_date AND end_date
       AND browser IS NOT NULL
       GROUP BY browser
       ORDER BY count DESC
       LIMIT 10
     ) sub) as top_browsers,
    
    -- Top 10 referrers
    (SELECT jsonb_agg(jsonb_build_object('referrer', referrer, 'count', count))
     FROM (
       SELECT 
         CASE 
           WHEN referrer IS NULL OR referrer = '' THEN 'Directo'
           ELSE referrer
         END as referrer,
         COUNT(*) as count
       FROM analytics_visits
       WHERE created_at BETWEEN start_date AND end_date
       GROUP BY referrer
       ORDER BY count DESC
       LIMIT 10
     ) sub) as top_referrers;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- NOTAS DE USO:
-- ============================================================
-- 
-- Para obtener estadísticas del último mes:
--   SELECT * FROM get_analytics_summary();
--
-- Para obtener estadísticas de un rango específico:
--   SELECT * FROM get_analytics_summary(
--     '2026-01-01'::timestamp with time zone,
--     '2026-01-31'::timestamp with time zone
--   );
--
-- Para ver visitas recientes:
--   SELECT * FROM analytics_visits ORDER BY created_at DESC LIMIT 50;
--
-- Para ver eventos recientes:
--   SELECT * FROM analytics_events ORDER BY created_at DESC LIMIT 50;
--
-- ============================================================
