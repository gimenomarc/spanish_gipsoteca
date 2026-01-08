# Configuración de Variables de Entorno en Vercel

Este documento explica cómo configurar las variables de entorno de Supabase en Vercel para que la aplicación funcione correctamente en producción.

## Variables de Entorno Necesarias

La aplicación necesita las siguientes variables de entorno:

1. `REACT_APP_SUPABASE_URL` - URL de tu proyecto Supabase
2. `REACT_APP_SUPABASE_ANON_KEY` - Clave pública/anónima de Supabase (publishable key)

## Pasos para Configurar en Vercel

### 1. Obtener las Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** > **API**
3. Encuentra:
   - **Project URL**: Esta es tu `REACT_APP_SUPABASE_URL`
   - **anon/public key**: Esta es tu `REACT_APP_SUPABASE_ANON_KEY` (la clave pública, NO la service_role)

### 2. Configurar Variables en Vercel

#### Opción A: Desde el Dashboard de Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables:

   **Variable 1:**
   - Name: `REACT_APP_SUPABASE_URL`
   - Value: `https://vnefocljtdvkabfxwoqg.supabase.co`
   - Environment: Selecciona **Production**, **Preview**, y **Development**

   **Variable 2:**
   - Name: `REACT_APP_SUPABASE_ANON_KEY`
   - Value: Tu clave pública/anónima (debe empezar con `sb_publishable_...`)
   - Environment: Selecciona **Production**, **Preview**, y **Development**

5. Haz clic en **Save**

#### Opción B: Desde la CLI de Vercel

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Configurar variables de entorno
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
```

### 3. Redesplegar la Aplicación

Después de agregar las variables de entorno:

1. Ve a **Deployments** en Vercel
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo push a tu repositorio

## Verificación

Después de redesplegar, verifica que:

1. La aplicación carga correctamente
2. Los productos se muestran desde Supabase
3. Las imágenes se cargan desde Supabase Storage

## Seguridad

⚠️ **IMPORTANTE:**

- ✅ Usa la clave **PUBLIC/ANON** (publishable key) en el cliente
- ❌ **NUNCA** uses la clave **SERVICE_ROLE** (secret key) en el cliente
- ✅ Las variables de entorno están configuradas correctamente en `.gitignore`
- ✅ Las claves no se suben a git

## Troubleshooting

### Las imágenes no se cargan

- Verifica que el bucket `product-images` en Supabase Storage sea **público**
- Verifica que las políticas RLS permitan lectura pública

### Los productos no se cargan

- Verifica que las políticas RLS en Supabase permitan lectura pública
- Revisa la consola del navegador para errores
- Verifica que las variables de entorno estén configuradas correctamente en Vercel

### Error: "Invalid API key"

- Verifica que estés usando la clave **PUBLIC/ANON** y no la SERVICE_ROLE
- Verifica que la clave esté correctamente configurada en Vercel
- Asegúrate de que el nombre de la variable sea exactamente `REACT_APP_SUPABASE_ANON_KEY`

## Desarrollo Local

Para desarrollo local, crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_SUPABASE_URL=https://vnefocljtdvkabfxwoqg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=tu_publishable_key_aqui
```

El archivo `.env` ya está en `.gitignore`, así que no se subirá a git.

