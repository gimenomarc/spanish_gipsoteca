# 📄 Instrucciones para el Catálogo PDF

## Opción 1: Subir a la carpeta `public` (Recomendado)

1. **Coloca el archivo PDF** en:
   ```
   public/catalogo.pdf
   ```

2. **El enlace funcionará automáticamente** en:
   - Home
   - Shop
   - Menú de Colección

## Opción 2: Subir a Supabase Storage

Si prefieres subirlo a Supabase Storage:

1. Ve a **Supabase Dashboard > Storage > product-images**
2. Crea la carpeta `catalogo` si no existe
3. Sube el archivo como `catalogo.pdf`
4. Copia la URL pública (será algo como):
   ```
   https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/catalogo/catalogo.pdf
   ```
5. Actualiza las rutas en:
   - `src/pages/Home.js` (línea ~119)
   - `src/pages/Shop.js` (línea ~158)
   - `src/components/MenuPanel.js` (línea ~107)

## ✅ Verificación

Una vez subido, el PDF debería estar accesible en:
- `/catalogo.pdf` (si está en public)
- O la URL de Supabase Storage (si lo subiste ahí)
