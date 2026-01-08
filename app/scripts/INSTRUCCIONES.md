# Instrucciones para Cargar Imágenes a Supabase

## Paso 1: Configurar Supabase

### 1.1 Crear las tablas en la base de datos

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/supabase-schema.sql` y copia todo su contenido
4. Pégalo en el SQL Editor y ejecuta el script (botón "Run")
5. Verifica que se hayan creado las tablas `categories` y `products`

### 1.2 Crear el bucket de Storage (opcional)

El script creará automáticamente el bucket si no existe, pero puedes crearlo manualmente:

1. Ve a **Storage** en el menú lateral de Supabase
2. Haz clic en **New bucket**
3. Nombre: `product-images`
4. Marca como **Public bucket**
5. Haz clic en **Create bucket**

## Paso 2: Configurar el Script

### Opción A: Usar variable de entorno (Recomendado)

**Windows PowerShell:**
```powershell
$env:SUPABASE_SERVICE_KEY="sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8"
node scripts/upload-to-supabase.js
```

**Windows CMD:**
```cmd
set SUPABASE_SERVICE_KEY=sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8
node scripts/upload-to-supabase.js
```

**Linux/Mac:**
```bash
SUPABASE_SERVICE_KEY=sb_secret_O6i18n3Xh3MUDTEVCFlFpg_9TFMiwR8 node scripts/upload-to-supabase.js
```

### Opción B: Modificar el script directamente

El script ya tiene la clave configurada por defecto, así que puedes ejecutarlo directamente:

```bash
node scripts/upload-to-supabase.js
```

## Paso 3: Ejecutar el Script

El script hará lo siguiente:

1. ✅ Verificará la conexión a Supabase
2. ✅ Creará el bucket `product-images` si no existe
3. ✅ Recorrerá todas las carpetas en `public/images/categorias/`
4. ✅ Para cada categoría:
   - Creará/actualizará el registro en la tabla `categories`
   - Recorrerá todos los productos (subcarpetas)
5. ✅ Para cada producto:
   - Extraerá el código y nombre del producto
   - Subirá todas las imágenes a Supabase Storage
   - Creará/actualizará el registro en la tabla `products` con las URLs de las imágenes

## Estructura de Datos

### Tabla `categories`
- `id`: ID único de la categoría (ej: "arquitectura-y-diseno")
- `name`: Nombre en español
- `name_en`: Nombre en inglés
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

### Tabla `products`
- `code`: Código único del producto (ej: "AD001")
- `category_id`: ID de la categoría (referencia a `categories`)
- `name`: Nombre del producto
- `folder_name`: Nombre de la carpeta original
- `price`: Precio (opcional)
- `artist`: Artista (opcional)
- `dimensions`: Dimensiones (opcional)
- `description`: Descripción (opcional)
- `images`: Array de URLs de las imágenes en Supabase Storage
- `created_at`: Fecha de creación
- `updated_at`: Fecha de actualización

## Formato de Nombres de Carpetas

El script espera que las carpetas de productos sigan este formato:

- ✅ `AD001 - Peana Clasica` → código: `AD001`, nombre: `Peana Clasica`
- ✅ `AD-003 - Roseton II` → código: `AD003`, nombre: `Roseton II`
- ✅ `M001 - Madonna Pietá` → código: `M001`, nombre: `Madonna Pietá`

Si una carpeta no sigue este formato, el script intentará extraer el código del inicio o usará el nombre completo.

## Categorías Soportadas

El script reconoce automáticamente estas categorías:

- `arquitectura-y-diseno` → Arquitectura y Diseño
- `figuras-anatomicas` → Figuras Anatómicas
- `mascaras-y-bustos` → Máscaras y Bustos
- `relieves` → Relieves
- `torsos-y-figuras` → Torsos y Figuras
- `actualizacion-enero-2026` → Actualización Enero 2026

Si hay otras categorías, el script las mostrará como "desconocidas" pero seguirá procesando.

## Solución de Problemas

### Error: "bucket does not exist"
- El script intentará crear el bucket automáticamente
- Si falla, créalo manualmente en Supabase Dashboard > Storage

### Error: "permission denied" o "row-level security"
- Verifica que hayas ejecutado el script SQL `supabase-schema.sql`
- Las políticas RLS permiten lectura pública y escritura con service_role

### Error: "table does not exist"
- Ejecuta primero el script SQL `supabase-schema.sql` en Supabase SQL Editor

### Error: "connection refused" o "network error"
- Verifica que `SUPABASE_URL` sea correcta
- Verifica tu conexión a internet
- Verifica que la clave de servicio sea válida

### Las imágenes no se suben
- Verifica que el bucket `product-images` existe y es público
- Verifica que las imágenes estén en formato jpg, png, gif o webp
- Revisa los logs del script para ver errores específicos

## Notas Importantes

⚠️ **Seguridad**: La `SERVICE_KEY` tiene acceso completo a tu base de datos. Nunca la compartas públicamente ni la subas a repositorios públicos.

✅ **Re-ejecución**: Puedes ejecutar el script múltiples veces. Usa `upsert`, por lo que no duplicará datos, solo actualizará los existentes.

📸 **Imágenes**: Las imágenes se suben a `product-images/{categoria}/{codigo}/{nombre-imagen}` en Supabase Storage.

🔄 **Actualización**: Si cambias imágenes localmente, vuelve a ejecutar el script para actualizar Supabase.

## Próximos Pasos

Una vez que el script haya cargado todos los datos:

1. Verifica los datos en Supabase Dashboard:
   - Ve a **Table Editor** y revisa las tablas `categories` y `products`
   - Ve a **Storage** y revisa el bucket `product-images`

2. Integra Supabase en tu aplicación React:
   - Instala `@supabase/supabase-js` en tu proyecto (ya está instalado)
   - Crea un cliente de Supabase con la clave pública (publishable key)
   - Consulta los productos desde Supabase en lugar de `products.js`

3. Actualiza tu aplicación para cargar imágenes desde Supabase Storage en lugar de archivos locales.

