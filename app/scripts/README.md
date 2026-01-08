# Script de Carga a Supabase

Este script carga todas las imágenes y productos desde las carpetas locales a Supabase Storage y base de datos.

## Requisitos Previos

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar Supabase:**
   - Ve a tu proyecto en Supabase Dashboard
   - Ejecuta el script SQL en `supabase-schema.sql` en el SQL Editor
   - Crea un bucket llamado `product-images` en Storage (o el script lo creará automáticamente)

3. **Configurar variables de entorno:**
   - Copia `.env.example` a `.env` en la raíz del proyecto
   - Completa `SUPABASE_SERVICE_KEY` con tu clave de servicio

## Uso

### Opción 1: Con variable de entorno

```bash
# Windows PowerShell
$env:SUPABASE_SERVICE_KEY="tu_service_key_aqui"; node scripts/upload-to-supabase.js

# Windows CMD
set SUPABASE_SERVICE_KEY=tu_service_key_aqui && node scripts/upload-to-supabase.js

# Linux/Mac
SUPABASE_SERVICE_KEY=tu_service_key_aqui node scripts/upload-to-supabase.js
```

### Opción 2: Modificar el script directamente

Edita `scripts/upload-to-supabase.js` y reemplaza la línea:
```javascript
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'tu_service_key_aqui';
```

## Estructura Esperada

El script espera la siguiente estructura de carpetas:

```
public/
  images/
    categorias/
      arquitectura-y-diseno/
        AD001 - Peana Clasica/
          imagen1.jpg
          imagen2.jpg
        AD003 - Roseton II/
          DSC02537 (1) (1).jpg
      figuras-anatomicas/
        A001 - Ecorche Houdon/
          DSC04634 (1).jpg
          DSC04701.jpg
      ...
```

## Qué Hace el Script

1. **Recorre todas las categorías** en `public/images/categorias/`
2. **Crea/actualiza categorías** en la tabla `categories`
3. **Para cada producto:**
   - Extrae el código y nombre del producto desde el nombre de la carpeta
   - Busca todas las imágenes (jpg, png, gif, webp) en la carpeta del producto
   - Sube cada imagen a Supabase Storage en `product-images/{categoria}/{codigo}/{imagen}`
   - Crea/actualiza el producto en la tabla `products` con las URLs de las imágenes

## Formato de Nombres de Carpetas

El script espera que las carpetas de productos sigan este formato:
- `AD001 - Peana Clasica` → código: `AD001`, nombre: `Peana Clasica`
- `AD-003 - Roseton II` → código: `AD003`, nombre: `Roseton II`
- `M001 - Madonna Pietá` → código: `M001`, nombre: `Madonna Pietá`

Si una carpeta no sigue este formato, el script intentará extraer el código del inicio o usará el nombre completo.

## Notas

- El script usa `upsert`, por lo que puedes ejecutarlo múltiples veces sin duplicar datos
- Las imágenes se suben con `upsert: true`, sobrescribiendo si ya existen
- Los productos sin imágenes también se crean en la base de datos
- El script muestra progreso detallado en la consola

## Solución de Problemas

### Error: "bucket does not exist"
- El script intentará crear el bucket automáticamente
- Si falla, créalo manualmente en Supabase Dashboard > Storage

### Error: "permission denied"
- Verifica que estés usando la `SERVICE_KEY` (no la `PUBLISHABLE_KEY`)
- Verifica que las políticas RLS permitan escritura con service_role

### Error: "table does not exist"
- Ejecuta primero el script SQL `supabase-schema.sql` en Supabase
