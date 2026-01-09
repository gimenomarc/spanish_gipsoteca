# Configuración de The SG Gallery

## 1. Crear las tablas en Supabase

Ejecuta el siguiente script SQL en el **SQL Editor de Supabase Dashboard**:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido del archivo `scripts/sg-gallery-schema.sql`
5. Haz clic en **Run**

## 1.5 Importar imágenes automáticamente (Recomendado)

Si tienes las imágenes en `public/images/THE SG GALLERY/`, puedes importarlas automáticamente:

### Opción A: Desde PowerShell
```powershell
cd C:\Users\gimen\Documents\spanish_gipsoteca\app
$env:SUPABASE_SERVICE_KEY="tu_service_role_key"
node scripts/upload-sg-gallery.js
```

### Opción B: Desde CMD
```cmd
cd C:\Users\gimen\Documents\spanish_gipsoteca\app
set SUPABASE_SERVICE_KEY=tu_service_role_key
node scripts/upload-sg-gallery.js
```

**¿Dónde encontrar la Service Role Key?**
- Supabase Dashboard > Project Settings > API > `service_role` (la clave secreta, NO la anon)

El script:
- Sube todas las imágenes a Supabase Storage en `sg-gallery/`
- Crea las colecciones automáticamente
- Crea las fotos con títulos generados del nombre de archivo

## 2. Estructura de datos

### Tabla: `sg_gallery_collections`
Colecciones de la galería (ej: The Studio Collection, Michelangelo Collection)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (auto-generado) |
| name | TEXT | Nombre de la colección |
| slug | TEXT | URL amigable (ej: "the-studio-collection") |
| description | TEXT | Descripción de la colección |
| cover_image | TEXT | URL de la imagen de portada |
| display_order | INTEGER | Orden de visualización |
| is_active | BOOLEAN | Si está visible en la web |

### Tabla: `sg_gallery_photos`
Fotos dentro de cada colección

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único (auto-generado) |
| collection_id | UUID | Referencia a la colección |
| title | TEXT | Título de la foto |
| description | TEXT | Descripción de la foto |
| context_info | TEXT | Información contextual de la obra/escena |
| image_url | TEXT | URL de la imagen |
| display_order | INTEGER | Orden dentro de la colección |
| is_active | BOOLEAN | Si está visible en la web |

### Tabla: `sg_gallery_photo_products`
Relación entre fotos y productos (esculturas)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| photo_id | UUID | Referencia a la foto |
| product_code | TEXT | Código del producto vinculado |

## 3. Gestión desde el BackOffice

### Acceder al panel de administración:
1. Ve a `/admin-jdm-private`
2. Inicia sesión con tu cuenta autorizada
3. En el menú lateral, verás **"SG Gallery"**

### Crear una colección:
1. Ve a **SG Gallery** en el menú
2. Haz clic en **"+ Nueva Colección"**
3. Rellena:
   - **Nombre**: Ej. "The Studio Collection"
   - **Slug**: Se genera automáticamente (puedes editarlo)
   - **Descripción**: Texto descriptivo de la colección
   - **Imagen de portada**: Sube una imagen o pega una URL
   - **Orden**: Número para ordenar (menor = primero)
   - **Activa**: Marca para que sea visible en la web

### Añadir fotos a una colección:
1. En la lista de colecciones, haz clic en **"📷 Fotos"**
2. Haz clic en **"+ Nueva Foto"**
3. Rellena:
   - **Título**: Nombre de la foto
   - **Descripción**: Descripción breve
   - **Información contextual**: Historia o contexto de la obra
   - **Imagen**: Sube una imagen o pega una URL
   - **Productos relacionados**: Busca y vincula productos

### Vincular productos:
En el formulario de foto, usa el campo **"Productos Relacionados"**:
1. Escribe el nombre o código del producto
2. Selecciona de la lista
3. Los productos vinculados aparecerán en la vista de detalle de la foto

## 4. Visualización en la web

### Home
- El bloque **"Piezas Seleccionadas"** muestra 8 productos destacados
- El bloque **"The SG Gallery"** muestra las colecciones con su imagen de portada

### Menú
- **"THE SG GALLERY"** despliega las colecciones disponibles

### Página de colección (`/sg-gallery/{slug}`)
- Muestra todas las fotos de la colección en una cuadrícula
- Al hacer clic en una foto, se abre el detalle con:
  - Imagen ampliada
  - Título y descripción
  - Información contextual
  - Productos relacionados (si existen)

## 5. Subida de imágenes

Las imágenes se suben al bucket `product-images` de Supabase Storage:
- **Portadas de colección**: `sg-gallery/covers/`
- **Fotos de galería**: `sg-gallery/photos/`

## 6. Datos de ejemplo

Para insertar datos de ejemplo, descomenta la sección al final de `scripts/sg-gallery-schema.sql` y ejecútala.

---

## Resumen de archivos creados/modificados

### Nuevos archivos:
- `scripts/sg-gallery-schema.sql` - Schema SQL para las tablas
- `src/hooks/useSGGallery.js` - Hooks para obtener datos de la galería
- `src/pages/SGGalleryCollection.js` - Página de colección
- `src/components/GalleryPhotoModal.js` - Modal de detalle de foto
- `src/pages/admin/AdminSGCollections.js` - Gestión de colecciones
- `src/pages/admin/AdminSGPhotos.js` - Gestión de fotos

### Archivos modificados:
- `src/App.js` - Nuevas rutas añadidas
- `src/pages/Home.js` - Simplificado: solo Piezas Seleccionadas + SG Gallery
- `src/pages/admin/AdminLayout.js` - Menú con "SG Gallery"
- `src/components/MenuPanel.js` - Submenú de SG Gallery con colecciones
