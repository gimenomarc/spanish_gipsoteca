# 📸 Instrucciones para Subir Fondo de FAQs

## Opción 1: Usar el Script Automático

1. **Asegúrate de que el archivo esté en Descargas** con uno de estos nombres:
   - `Fondo FAQS.jpg`
   - `Fondo FAQs.jpg`
   - `Fondo_FAQS.jpg`
   - O cualquier nombre que contenga "fondo" y "faq"

2. **Ejecuta el script:**
   ```bash
   cd C:\Users\gimen\Documents\spanish_gipsoteca\app
   node scripts/upload-faqs-background.js
   ```

## Opción 2: Pasar la Ruta Manualmente

Si el archivo tiene otro nombre o está en otra ubicación:

```bash
cd C:\Users\gimen\Documents\spanish_gipsoteca\app
node scripts/upload-faqs-background.js "C:\Users\gimen\Downloads\nombre-del-archivo.jpg"
```

## Opción 3: Subir Manualmente a Supabase

1. Ve a **Supabase Dashboard > Storage > product-images**
2. Crea la carpeta `faqs` si no existe
3. Sube el archivo como `Fondo FAQS.jpg` (o el nombre que prefieras)
4. Copia la URL pública
5. Actualiza la ruta en `src/pages/FAQs.js` línea ~29

## ✅ Verificación

Una vez subido, la imagen estará disponible en:
```
https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/faqs/Fondo%20FAQS.jpg
```

La página de FAQs la cargará automáticamente.
