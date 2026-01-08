# 🚀 Instrucciones Rápidas - EmailJS

Ya tienes el servicio configurado ✅ (service_ba5i13l)

## 📋 Checklist - Lo que necesitas hacer ahora:

### ✅ 1. Crear Template de PEDIDOS

1. En EmailJS, ve a **"Email Templates"** → **"Create New Template"**
2. Configura:
   - **Service**: Gmail (service_ba5i13l)
   - **Template Name**: `Pedido Checkout`
   - **To Email**: `thespanishgipsoteca@gmail.com` ⬅️ IMPORTANTE
   - **To Name**: `The Spanish Gipsoteca`
   - **From Name**: `The Spanish Gipsoteca`
   - **Subject**: `🛒 NUEVO PEDIDO RECIBIDO - The Spanish Gipsoteca`
   - **Content**: Copia el HTML del archivo `EMAILJS_TEMPLATES.md` (Template 1)
3. **Guarda** y anota el **Template ID** (ej: `template_abc123`)

### ✅ 2. Crear Template de CONTACTO

1. En **"Email Templates"** → **"Create New Template"** (otro nuevo)
2. Configura:
   - **Service**: Gmail (service_ba5i13l)
   - **Template Name**: `Contacto`
   - **To Email**: `thespanishgipsoteca@gmail.com` ⬅️ IMPORTANTE
   - **To Name**: `The Spanish Gipsoteca`
   - **From Name**: `The Spanish Gipsoteca`
   - **Subject**: `📧 NUEVA CONSULTA - The Spanish Gipsoteca`
   - **Content**: Copia el HTML del archivo `EMAILJS_TEMPLATES.md` (Template 2)
3. **Guarda** y anota el **Template ID** (ej: `template_xyz789`)

### ✅ 3. Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Copia la **"Public Key"** (ej: `abcdefghijklmnop`)

### ✅ 4. Crear archivo .env

1. En la raíz del proyecto (donde está `package.json`), crea un archivo llamado `.env`
2. Copia este contenido y reemplaza con tus valores reales:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_ba5i13l
REACT_APP_EMAILJS_TEMPLATE_ID=template_abc123
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_xyz789
REACT_APP_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

**Reemplaza**:
- `template_abc123` → Tu Template ID de PEDIDOS
- `template_xyz789` → Tu Template ID de CONTACTO
- `abcdefghijklmnop` → Tu Public Key

### ✅ 5. Reiniciar el servidor

Después de crear el archivo `.env`, reinicia el servidor de desarrollo:

```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo:
npm start
```

### ✅ 6. Configurar en Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Añade estas 4 variables (con los mismos valores que en tu .env):
   - `REACT_APP_EMAILJS_SERVICE_ID`
   - `REACT_APP_EMAILJS_TEMPLATE_ID`
   - `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID`
   - `REACT_APP_EMAILJS_PUBLIC_KEY`
4. Selecciona los entornos: **Production**, **Preview**, **Development**
5. **Save** y haz **Redeploy**

---

## 🧪 Probar que funciona

### Probar Checkout:
1. Añade un producto al carrito
2. Ve a `/checkout`
3. Completa el formulario
4. Envía
5. Verifica que recibes el email en **thespanishgipsoteca@gmail.com** con asunto "🛒 NUEVO PEDIDO RECIBIDO"

### Probar Contacto:
1. Ve a `/contact`
2. Completa el formulario
3. Envía
4. Verifica que recibes el email en **thespanishgipsoteca@gmail.com** con asunto "📧 NUEVA CONSULTA"

---

## ❓ ¿Dónde están los templates HTML?

Los templates HTML completos están en el archivo **`EMAILJS_TEMPLATES.md`**:
- **Template 1**: Para pedidos (checkout)
- **Template 2**: Para contacto

Copia y pega el contenido HTML en los templates de EmailJS.

---

## ⚠️ Importante

- El archivo `.env` NO se sube a Git (está en .gitignore)
- En Vercel, debes configurar las variables manualmente
- Los emails llegarán a **thespanishgipsoteca@gmail.com** porque está configurado en el template
