# Configuración de EmailJS - Guía Paso a Paso

## ¿Qué email usar para conectar el servicio?

**Respuesta corta**: Puedes usar CUALQUIER email que tengas acceso para conectar el servicio de EmailJS. El email que uses para conectar es solo para autenticación/autorización. Los correos se enviarán A la dirección que configures en el template (thespanishgipsoteca@gmail.com).

### Opciones:

1. **Si tienes acceso a thespanishgipsoteca@gmail.com**:
   - ✅ Conecta ese email directamente (más simple)
   - Los emails se enviarán desde esa cuenta

2. **Si NO tienes acceso a thespanishgipsoteca@gmail.com**:
   - ✅ Conecta tu email personal o cualquier otro email que tengas
   - Los emails se enviarán DESDE tu email personal PERO LLEGARÁN A thespanishgipsoteca@gmail.com
   - Esto es porque en el código configuramos `to_email: 'thespanishgipsoteca@gmail.com'`

---

## Pasos Detallados para Configurar EmailJS

### Paso 1: Crear cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta (puedes usar cualquier email)
3. El plan gratuito permite 200 emails/mes (suficiente para empezar)

### Paso 2: Crear un Servicio de Email

1. En el dashboard de EmailJS, ve a **"Email Services"** (menú lateral)
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado si usas Gmail)
   - **Outlook** (si usas Outlook/Hotmail)
   - **Yahoo** (si usas Yahoo)
   - O cualquier otro que uses

4. **Conectar tu email**:
   - Si eliges Gmail: te pedirá autorizar acceso a tu cuenta de Gmail
   - Si eliges Outlook: te pedirá autorizar acceso a tu cuenta de Outlook
   - **IMPORTANTE**: Este email es solo para AUTENTICACIÓN. Los correos se enviarán A la dirección que configures en el template.

5. Una vez conectado, anota el **Service ID** que se genera (algo como `service_xxxxx`)

### Paso 3: Crear Template para PEDIDOS (Checkout)

1. Ve a **"Email Templates"** (menú lateral)
2. Haz clic en **"Create New Template"**
3. Configura:

   **Nombre del Template**: `Pedido Checkout` (o el que prefieras)

   **Service**: Selecciona el servicio que acabas de crear

   **Template ID**: Se genera automáticamente (algo como `template_xxxxx`) - **ANÓTALO**

   **To Email**: `thespanishgipsoteca@gmail.com` ⬅️ **ESTE ES EL DESTINATARIO FINAL**

   **From Name**: `The Spanish Gipsoteca` (o el nombre que quieras)

   **From Email**: Puede ser tu email o el que conectaste (no importa mucho, el destinatario es el `To Email`)

   **Subject**: 
   ```
   🛒 NUEVO PEDIDO RECIBIDO - The Spanish Gipsoteca
   ```

   **Content (HTML)**: Copia el contenido del template de pedidos del archivo `EMAILJS_TEMPLATES.md`

4. Guarda el template

### Paso 4: Crear Template para CONTACTO

1. En **"Email Templates"**, haz clic en **"Create New Template"** de nuevo
2. Configura:

   **Nombre del Template**: `Contacto` (o el que prefieras)

   **Service**: El mismo servicio que creaste antes

   **Template ID**: Se genera automáticamente - **ANÓTALO** (será diferente al anterior)

   **To Email**: `thespanishgipsoteca@gmail.com` ⬅️ **ESTE ES EL DESTINATARIO FINAL**

   **From Name**: `The Spanish Gipsoteca`

   **Subject**: 
   ```
   📧 NUEVA CONSULTA - The Spanish Gipsoteca
   ```

   **Content (HTML)**: Copia el contenido del template de contacto del archivo `EMAILJS_TEMPLATES.md`

3. Guarda el template

### Paso 5: Obtener la Public Key

1. Ve a **"Account"** > **"General"** (menú lateral)
2. Busca **"Public Key"**
3. Copia la clave (algo como `xxxxxxxxxxxxx`)

### Paso 6: Configurar Variables de Entorno

Tienes dos opciones:

#### Opción A: Archivo .env local (para desarrollo)

Crea un archivo `.env` en la raíz del proyecto (junto a `package.json`) con:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxx
REACT_APP_EMAILJS_TEMPLATE_ID=template_xxxxx_pedidos
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_xxxxx_contacto
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

**Reemplaza**:
- `service_xxxxx` con tu Service ID
- `template_xxxxx_pedidos` con el Template ID del template de pedidos
- `template_xxxxx_contacto` con el Template ID del template de contacto
- `xxxxxxxxxxxxx` con tu Public Key

#### Opción B: Vercel (para producción)

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Añade cada variable:
   - `REACT_APP_EMAILJS_SERVICE_ID` = tu service id
   - `REACT_APP_EMAILJS_TEMPLATE_ID` = template id de pedidos
   - `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID` = template id de contacto
   - `REACT_APP_EMAILJS_PUBLIC_KEY` = tu public key

4. **IMPORTANTE**: Selecciona los entornos (Production, Preview, Development) donde quieres que estén disponibles
5. Guarda y haz redeploy

---

## Resumen de IDs que necesitas

Después de configurar EmailJS, deberías tener:

1. ✅ **Service ID**: `service_xxxxx` (uno solo, para ambos templates)
2. ✅ **Template ID Pedidos**: `template_xxxxx` (para checkout)
3. ✅ **Template ID Contacto**: `template_yyyyy` (para contacto, diferente al anterior)
4. ✅ **Public Key**: `xxxxxxxxxxxxx` (una sola, para todo)

---

## Prueba Rápida

1. **Probar Checkout**:
   - Añade un producto al carrito
   - Ve a checkout
   - Completa el formulario
   - Envía
   - Verifica que recibes el email en **thespanishgipsoteca@gmail.com**

2. **Probar Contacto**:
   - Ve a /contact
   - Completa el formulario
   - Envía
   - Verifica que recibes el email en **thespanishgipsoteca@gmail.com**

---

## Preguntas Frecuentes

**P: ¿Puedo usar mi email personal para conectar el servicio?**
R: Sí, absolutamente. El email que uses para conectar es solo para autenticación. Los correos llegarán a thespanishgipsoteca@gmail.com porque está configurado en el template.

**P: ¿Los correos se enviarán desde mi email personal?**
R: Técnicamente sí, pero el destinatario verá que viene de "The Spanish Gipsoteca" y llegará a thespanishgipsoteca@gmail.com. Si quieres que venga desde thespanishgipsoteca@gmail.com, conecta ese email directamente.

**P: ¿Necesito dos servicios diferentes para pedidos y contacto?**
R: No, puedes usar el mismo servicio para ambos. Solo necesitas dos templates diferentes.

**P: ¿Qué pasa si no configuro las variables de entorno?**
R: Los formularios mostrarán un error y no se enviarán los emails. Debes configurar las variables para que funcione.

---

## Solución de Problemas

**Error: "EmailJS no está configurado"**
- Verifica que todas las variables de entorno estén configuradas
- En desarrollo, reinicia el servidor después de crear el archivo .env
- En producción, verifica que las variables estén en Vercel y haz redeploy

**Error: "Failed to send email"**
- Verifica que el Service ID, Template IDs y Public Key sean correctos
- Verifica que el template tenga configurado `to_email: thespanishgipsoteca@gmail.com`
- Revisa la consola del navegador para más detalles del error

**No recibo los emails**
- Verifica la carpeta de spam
- Verifica que el `To Email` en el template sea correcto
- Verifica que el servicio de email esté correctamente conectado
