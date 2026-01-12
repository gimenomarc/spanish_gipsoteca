# Sistema de Analytics - Guía de Configuración

## 📊 Descripción

Se ha implementado un sistema completo de analytics propio que permite trackear:
- **Visitas y páginas vistas**: Cada vez que alguien visita una página
- **Visitantes únicos**: Usuarios diferentes que acceden
- **Dispositivos y navegadores**: Qué tecnología usan los visitantes
- **Eventos personalizados**: Clicks, búsquedas, añadir al carrito, etc.
- **Referrers**: De dónde vienen los visitantes

## 🚀 Configuración Inicial

### 1. Ejecutar el Schema SQL

Ve a **Supabase Dashboard > SQL Editor** y ejecuta el archivo:
```
scripts/analytics-schema.sql
```

Esto creará:
- `analytics_visits` - Tabla de visitas/páginas vistas
- `analytics_events` - Tabla de eventos (clicks, acciones)
- `analytics_sessions` - Tabla de sesiones de usuario
- Función `get_analytics_summary()` - Para obtener estadísticas resumidas

### 2. Verificar que funciona

Una vez ejecutado el SQL, el sistema empezará a trackear automáticamente:
- ✅ Todas las visitas a páginas públicas
- ✅ Dispositivos, navegadores, sistemas operativos
- ✅ Referrers (de dónde vienen)

## 📈 Acceder a Analytics

1. Inicia sesión en el admin: `/admin-jdm-private`
2. Ve a **Analytics** en el menú lateral (📈)
3. Verás métricas en tiempo real

## 📊 Métricas Disponibles

### Estadísticas Principales
- **Visitas Totales**: Número total de visitas
- **Visitantes Únicos**: Usuarios diferentes
- **Páginas Vistas**: Total de páginas visitadas
- **Duración Promedio**: Tiempo promedio de sesión
- **Tasa de Rebote**: % de sesiones con solo 1 página

### Análisis Detallado
- **Top 10 Páginas Más Visitadas**
- **Dispositivos** (mobile, tablet, desktop)
- **Navegadores** (Chrome, Firefox, Safari, etc.)
- **Referrers** (de dónde vienen los visitantes)

### Visitas y Eventos Recientes
- Lista de las últimas 20 visitas con detalles
- Lista de los últimos 20 eventos (clicks, acciones)

## 🎯 Eventos Personalizados

El sistema también permite trackear eventos específicos. Ejemplos de uso:

```javascript
import { Analytics } from '../hooks/useAnalytics';

// Cuando alguien ve un producto
Analytics.trackProductView('ANA-01', 'anatomia');

// Cuando alguien añade al carrito
Analytics.trackAddToCart('ANA-01', 'anatomia', 2);

// Cuando alguien inicia checkout
Analytics.trackCheckoutStart();

// Cuando alguien busca
Analytics.trackSearch('escultura', 15);
```

## 🔍 Filtros de Fecha

Puedes ver estadísticas de diferentes períodos:
- Últimos 7 días
- Últimos 30 días (por defecto)
- Últimos 90 días
- Último año

## 🔒 Privacidad

- **No se guardan IPs** por defecto (opcional)
- **No se guardan datos personales** de usuarios
- Solo se trackean **comportamientos anónimos**
- Los datos son **propios** (no se comparten con terceros)

## 📝 Notas Técnicas

### Session ID
- Se genera automáticamente cuando alguien visita la web
- Se guarda en `sessionStorage` del navegador
- Permite agrupar visitas de la misma sesión

### Tracking Automático
- Se activa automáticamente en todas las páginas públicas
- No requiere configuración adicional
- Funciona sin cookies (usa sessionStorage)

### Rendimiento
- El tracking es **asíncrono** y no bloquea la carga de la página
- Los errores de tracking **no afectan** la experiencia del usuario
- Los datos se guardan en Supabase de forma eficiente

## 🛠️ Troubleshooting

### No aparecen datos
1. Verifica que el SQL se ejecutó correctamente
2. Verifica que las políticas RLS están activas
3. Revisa la consola del navegador por errores

### Los datos no se actualizan
- Los datos se actualizan en tiempo real
- Si no ves datos nuevos, verifica que hay visitas recientes
- El tracking solo funciona en páginas públicas (no en admin)

## 📚 Próximas Mejoras Posibles

- Gráficos de tendencias temporales
- Exportar datos a CSV/Excel
- Comparar períodos
- Alertas por eventos importantes
- Integración con Google Analytics (opcional)
