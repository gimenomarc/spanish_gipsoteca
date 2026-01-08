# 🔧 Solución: Imagen Hero no se sube a Git/Vercel

## Problema
La imagen `hero-bg.jpg` funciona en local pero no en Vercel porque no está en Git.

## Solución

### Paso 1: Modificar .gitignore

El `.gitignore` está en la **raíz del repositorio** (un nivel arriba de `app/`).

Edita el archivo `../.gitignore` y cambia:

```gitignore
# ANTES (está mal):
images/
**/images/
app/public/images/categorias/
app/public/images/sculptures/ 
app/public/images/thumbnails/
```

Por esto:

```gitignore
# DESPUÉS (correcto):
images/
app/public/images/categorias/
app/public/images/sculptures/
app/public/images/thumbnails/
# Mantener hero - imágenes necesarias para el sitio (excepción)
!app/public/images/hero/
```

**IMPORTANTE:** Elimina la línea `**/images/` que está ignorando TODAS las carpetas images.

### Paso 2: Añadir la imagen a Git

Desde la **raíz del repositorio** (donde está el `.gitignore`), ejecuta:

```bash
# Añadir el .gitignore modificado
git add .gitignore

# Añadir la imagen hero (ahora debería funcionar)
git add app/public/images/hero/hero-bg.jpg

# Verificar que se añadió correctamente
git status

# Hacer commit
git commit -m "Añadir imagen hero-bg.jpg y corregir .gitignore"

# Push
git push
```

### Paso 3: Verificar en Vercel

Después del push, Vercel debería:
1. Detectar el cambio
2. Hacer un nuevo build
3. La imagen debería estar disponible en: `/images/hero/hero-bg.jpg`

## Verificación

Para verificar que la imagen está en Git:

```bash
git ls-files | grep hero-bg.jpg
```

Debería mostrar: `app/public/images/hero/hero-bg.jpg`

## Nota

Si después de estos pasos sigue sin funcionar, verifica que:
- La imagen existe en `app/public/images/hero/hero-bg.jpg`
- El `.gitignore` no tiene `**/images/` (debe estar eliminado)
- La excepción `!app/public/images/hero/` está presente
