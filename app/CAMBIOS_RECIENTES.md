# Cambios Implementados - 12 Enero 2026 (Segunda Ronda)

## ✅ Cambios Completados

### 1. Home: Hero Section Pantalla Completa
- Hero section ahora ocupa `h-screen` (100vh)
- Primera sección visible ocupa toda la pantalla

### 2. FAQs: Título cambiado a "FAQ's"
- Título actualizado de "FAQs" a "FAQ's"
- Foto de fondo añadida (desde Supabase Storage: `Fondo FAQS.jpg`)

### 3. Galería SG → The SG Gallery
- Menú actualizado: "GALERÍA SG" → "THE SG GALLERY"

### 4. Vincular Fotos SG Gallery con Productos
- ✅ **Ya está implementado** en el panel de admin
- En `/admin-jdm-private/sg-gallery/:collectionId/photos` puedes:
  - Añadir códigos de productos a cada foto
  - Los productos aparecen automáticamente debajo de la foto cuando se visualiza
  - Funcionalidad completa en `AdminSGPhotos.js`

### 5. Enlaces al Catálogo PDF
- ✅ **Home**: Botón "Ver Catálogo PDF" junto a "Explorar Colección"
- ✅ **Shop**: Enlace al PDF junto al título de categoría
- ✅ **Menú Colección**: Enlace "📄 Catálogo PDF" al final del submenú
- **NOTA**: Necesitas subir el archivo `catalogo.pdf` a `public/catalogo.pdf`

### 6. Texto Home Actualizado
- Cambiado: "Una selección..." → "Explora nuestra selección..."

### 7. Quitar Categoría "Actualización enero 2026"
- ✅ Filtro añadido en `useCategories.js`
- Las categorías con "actualización", "enero 2026" o "january 2026" se ocultan automáticamente

### 8. SG Gallery: Sin Nombre de Archivo en Hover
- ✅ Eliminado el título que aparecía al pasar el ratón sobre las fotos
- Solo se muestra el indicador de zoom

---

## ⚠️ Cambios que Requieren Acción Manual

### 1. Corregir L'Empordà Collection
**Ejecutar SQL en Supabase:**
```sql
-- Ejecuta: scripts/fix-collections.sql
UPDATE sg_gallery_collections 
SET name = 'L''Empordà Collection' 
WHERE slug = 'lemporda-collection';
```

### 2. Cambiar Foto Portada Golden Collection
**Pasos:**
1. Sube la imagen `GC_Torso frente_T002` a Supabase Storage:
   - Ve a Storage > product-images > sg-gallery > covers
   - Sube como `golden-collection.jpg` (o el formato que tenga)
2. Ejecuta el SQL en `scripts/fix-collections.sql` con la URL correcta

### 3. Subir Catálogo PDF
**Pasos:**
1. Coloca el archivo PDF en: `public/catalogo.pdf`
2. O súbelo a Supabase Storage y actualiza las rutas en:
   - `src/pages/Home.js` (línea ~117)
   - `src/pages/Shop.js` (línea ~127)
   - `src/components/MenuPanel.js` (línea ~108)

### 4. Subir Foto de Fondo FAQs
**Pasos:**
1. Sube `Fondo FAQS.jpg` a Supabase Storage:
   - Ve a Storage > product-images > faqs
   - Sube como `Fondo FAQS.jpg`
2. La ruta ya está configurada en `src/pages/FAQs.js`

---

## 📁 Archivos Modificados

- `src/pages/Home.js` - Hero pantalla completa, texto actualizado, enlace PDF
- `src/pages/FAQs.js` - Título FAQ's, foto de fondo
- `src/pages/Shop.js` - Enlace PDF
- `src/pages/SGGalleryCollection.js` - Sin nombre archivo en hover
- `src/components/MenuPanel.js` - The SG Gallery, enlace PDF en menú
- `src/hooks/useCategories.js` - Filtro categoría enero 2026
- `scripts/fix-collections.sql` - Script para corregir colecciones

---

## 🎯 Funcionalidades Ya Implementadas

### Vincular Fotos con Productos
La funcionalidad completa está en el panel de admin:
1. Ve a `/admin-jdm-private/sg-gallery`
2. Selecciona una colección
3. Edita una foto
4. En el campo "Productos relacionados", busca y selecciona productos por código
5. Guarda - los productos aparecerán automáticamente debajo de la foto

---

## 📝 Notas

- El PDF del catálogo debe estar en `public/catalogo.pdf` o actualizar las rutas
- La foto de fondo de FAQs debe estar en Supabase Storage
- La foto de Golden Collection requiere subirla manualmente a Storage
- L'Empordà se corrige ejecutando el SQL
