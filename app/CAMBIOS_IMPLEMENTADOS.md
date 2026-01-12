# Cambios Implementados - 12 Enero 2026

## Resumen de actualizaciones realizadas según solicitud de Javier

### ✅ 1. Menú y textos en castellano
- Menú principal traducido: INICIO, COLECCIÓN, TIENDA, GALERÍA SG, SOBRE NOSOTROS, PREGUNTAS FRECUENTES, CONTACTO
- Submenú de COLECCIÓN muestra las categorías en español
- Botón "Add to cart" → "Añadir al carrito"

### ✅ 2. Textos de Home actualizados
- **Hero Section** con nuevo texto:
  - "The Spanish Gipsoteca es un proyecto artesanal especializado en la reproducción de esculturas clásicas en escayola. Una selección de las piezas más icónicas de la historia del arte."
- **Sección "Artesanía Clásica"**:
  - Características: "+100 reproducciones / 100% artesanal" (sin "infinita calidad")
  - Texto: "Nuestra colección dispone de una amplia variedad de reproducciones escultóricas en escayola..."

### ✅ 3. SG Gallery funciona desde el menú
- Reestructurado el sistema de rutas de React Router
- Ahora `/sg-gallery` funciona correctamente tanto desde el menú como desde la home

### ✅ 4. Ocultar nombres de archivo JPG
- Eliminado el código del producto (Code XXX) de las tarjetas de producto
- Solo se muestra: nombre, artista y precio

### ✅ 5. Móvil: productos en 2 columnas
- Grid de productos en Shop cambiado a 2 columnas en móvil
- Búsqueda (lupa) ahora visible también en móvil

### ✅ 6. Checkout: Recogida en taller vs Envío
- Nueva opción de selección de método de entrega:
  - **📍 Recogida en Taller**: Solo requiere nombre, email y teléfono
  - **🚚 Envío a Domicilio**: Requiere todos los campos de dirección
- El email incluye el tipo de entrega seleccionado

### ✅ 7. Productos destacados editables
- Nuevo campo `is_featured` en la tabla de productos
- Nuevo campo `featured_order` para ordenar los destacados
- Panel de administración actualizado con:
  - Botón para marcar/desmarcar como destacado (⭐)
  - Filtro para ver solo productos destacados
- Home usa los productos marcados como destacados

### ✅ 8. Productos en múltiples categorías
- Nueva tabla `product_categories` para relaciones muchos-a-muchos
- Script SQL incluido para crear las tablas necesarias

### ✅ 9. L'Empordà corregido
- Script de upload actualizado: `L_Empordà` → `L'Empordà`
- **NOTA**: Si el nombre ya está en la base de datos, hay que actualizarlo manualmente:
  ```sql
  UPDATE sg_gallery_collections 
  SET name = 'L''Empordà Collection' 
  WHERE slug = 'lemporda-collection';
  ```

---

## Archivos modificados

### Frontend (src/)
- `App.js` - Reestructurado sistema de rutas
- `pages/Home.js` - Nuevo hero, sección artesanía, productos destacados
- `pages/Shop.js` - Grid 2 columnas móvil
- `pages/Checkout.js` - Opciones recogida/envío
- `pages/ProductDetail.js` - Botón en español
- `pages/admin/AdminProducts.js` - Gestión de destacados
- `components/MenuPanel.js` - Menú en español
- `components/Header.js` - Búsqueda visible en móvil
- `components/ProductCard.js` - Sin código de producto
- `hooks/useProducts.js` - Hook useFeaturedProducts

### Scripts SQL
- `scripts/featured-and-multicategory.sql` - Nuevas tablas y campos
- `scripts/upload-sg-gallery.js` - Corrección L'Empordà

---

## Pendiente (requiere cambios en base de datos)

1. **Ejecutar el SQL** `featured-and-multicategory.sql` en Supabase para:
   - Añadir campos `is_featured` y `featured_order` a productos
   - Crear tabla `product_categories` para múltiples categorías

2. **Actualizar nombre de colección** L_Empordà en la base de datos

3. **Marcar productos como destacados** desde el panel de admin
