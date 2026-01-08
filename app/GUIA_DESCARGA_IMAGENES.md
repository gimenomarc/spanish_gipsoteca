# Guía para Descargar y Organizar Imágenes desde Google Drive

## 📁 Estructura de Carpetas

Tu Google Drive tiene esta estructura:
```
Fotos web/
├── Mascaras Y Bustos/
│   ├── CB001 - Angel Borromini/
│   │   └── DSC04562 (1).jpg
│   ├── CB002 - Cabeza niño pajaro/
│   ├── M001 - Madonna Pietá/
│   └── ...
├── Relieves/
├── Figuras Anatomicas/
├── Torsos y Figuras/
├── Arquitectura y diseño/
└── Actualización Enero 2026/
```

## 📥 Cómo Descargar las Imágenes

### Opción 1: Descargar Carpeta Completa (Recomendado)
1. Ve a Google Drive
2. Selecciona la carpeta "Fotos web"
3. Click derecho → "Descargar"
4. Google Drive creará un archivo ZIP
5. Extrae el ZIP en tu escritorio

### Opción 2: Descargar por Categorías
1. Descarga cada carpeta de categoría individualmente
2. Extrae cada ZIP en su lugar correspondiente

## 📂 Cómo Organizar las Imágenes en el Proyecto

Una vez descargadas, copia las carpetas manteniendo la estructura:

### Paso 1: Copiar las Carpetas de Categorías
Copia cada carpeta de categoría desde tu descarga a:
```
public/images/categorias/[nombre-categoria]/
```

**Mapeo de nombres:**
- `Mascaras Y Bustos` → `mascaras-y-bustos`
- `Relieves` → `relieves`
- `Figuras Anatomicas` → `figuras-anatomicas`
- `Torsos y Figuras` → `torsos-y-figuras`
- `Arquitectura y diseño` → `arquitectura-y-diseno`
- `Actualización Enero 2026` → `actualizacion-enero-2026`

### Paso 2: Mantener la Estructura de Productos
Dentro de cada carpeta de categoría, mantén las carpetas de productos tal cual:
```
public/images/categorias/mascaras-y-bustos/
├── CB001 - Angel Borromini/
│   ├── DSC04562 (1).jpg
│   └── (otras imágenes...)
├── CB002 - Cabeza niño pajaro/
└── ...
```

## ✅ Verificación

Después de copiar todo, deberías tener:
- ✅ Todas las carpetas de categorías en `public/images/categorias/`
- ✅ Todas las carpetas de productos dentro de cada categoría
- ✅ Todas las imágenes dentro de cada carpeta de producto

## 🔄 Actualizar el Código

Una vez que tengas las imágenes:
1. El código ya está preparado para usar esta estructura
2. Las imágenes se cargarán automáticamente desde las rutas correctas
3. Si necesitas agregar más productos, edita `src/data/products.js`

## 📝 Notas Importantes

- **Nombres de carpetas**: Mantén los nombres exactos como están en Google Drive
- **Formato de imágenes**: JPG, PNG, WEBP funcionan todos
- **Tamaño**: Las imágenes grandes se optimizarán automáticamente
- **Primera imagen**: La primera imagen de cada carpeta se usará como imagen principal

## 🚀 Siguiente Paso

Una vez descargadas y organizadas las imágenes, el código las usará automáticamente. Si necesitas ayuda con algún paso, avísame.


