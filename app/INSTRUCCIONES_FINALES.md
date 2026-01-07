# ✅ Sistema de Productos Configurado

## 🎯 Lo que he hecho:

1. **✅ Estructura de carpetas creada** en `public/images/categorias/`:
   - `mascaras-y-bustos/`
   - `relieves/`
   - `figuras-anatomicas/`
   - `torsos-y-figuras/`
   - `arquitectura-y-diseno/`
   - `actualizacion-enero-2026/`

2. **✅ Archivo de datos de productos** (`src/data/products.js`):
   - Ya tiene todos los productos de "Máscaras y Bustos" configurados
   - Con códigos, nombres, precios, etc.
   - Fácil de actualizar cuando agregues más productos

3. **✅ Sistema de imágenes automático**:
   - El código busca automáticamente las imágenes en las carpetas
   - Si no encuentra una imagen, usa un placeholder
   - Cuando descargues las imágenes, funcionarán automáticamente

## 📥 Qué hacer ahora:

### Paso 1: Descargar desde Google Drive
1. Ve a Google Drive
2. Selecciona la carpeta "Fotos web"
3. Click derecho → "Descargar"
4. Extrae el ZIP

### Paso 2: Copiar las carpetas
Copia las carpetas manteniendo la estructura exacta:

```
Desde tu descarga:
Fotos web/Mascaras Y Bustos/CB001 - Angel Borromini/

A tu proyecto:
public/images/categorias/mascaras-y-bustos/CB001 - Angel Borromini/
```

**IMPORTANTE**: Mantén los nombres de las carpetas exactamente como están en Google Drive.

### Paso 3: Verificar
Después de copiar, deberías tener:
```
public/images/categorias/mascaras-y-bustos/
├── CB001 - Angel Borromini/
│   └── DSC04562 (1).jpg (o cualquier imagen)
├── CB002 - Cabeza niño pajaro/
└── ...
```

## 🔄 Cómo funciona:

1. **El código lee** `src/data/products.js` para obtener la lista de productos
2. **Busca las imágenes** en `public/images/categorias/[categoria]/[carpeta-producto]/`
3. **Usa la primera imagen** que encuentre en cada carpeta
4. **Si no encuentra imagen**, usa un placeholder temporal

## 📝 Agregar más productos:

Para agregar productos de otras categorías, edita `src/data/products.js`:

```javascript
"relieves": {
  id: "relieves",
  name: "Relieves",
  nameEn: "Reliefs",
  products: [
    {
      code: "R001",
      name: "Nombre del relieve",
      folder: "R001 - Nombre del relieve",
      price: "450€",
      // ...
    },
  ],
},
```

## 🚀 Próximos pasos:

1. **Descarga las imágenes** desde Google Drive
2. **Cópialas** a las carpetas del proyecto
3. **Ejecuta** `npm start` para ver la web con tus imágenes
4. **Agrega más productos** editando `src/data/products.js`

## 💡 Tips:

- **Nombres de archivos**: No importa cómo se llamen las imágenes dentro de cada carpeta, el código usará la primera que encuentre
- **Múltiples imágenes**: Si hay varias imágenes en una carpeta, todas estarán disponibles para usar
- **Actualizar productos**: Solo edita `src/data/products.js` y agrega la información

## ❓ ¿Necesitas ayuda?

Si tienes problemas al descargar o organizar las imágenes, avísame y te ayudo paso a paso.

