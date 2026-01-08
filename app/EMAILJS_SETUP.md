# Configuración de EmailJS

Para que el sistema de checkout funcione correctamente y se envíen emails a Javier cuando un cliente realiza un pedido, necesitas configurar EmailJS.

## Pasos para configurar EmailJS:

1. **Crear cuenta en EmailJS**
   - Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
   - Crea una cuenta gratuita (permite hasta 200 emails/mes)

2. **Crear un servicio de email**
   - En el dashboard de EmailJS, ve a "Email Services"
   - Selecciona tu proveedor de email (Gmail, Outlook, etc.)
   - Conecta tu cuenta de email
   - Anota el **Service ID** que se genera

3. **Crear una plantilla de email**
   - Ve a "Email Templates"
   - Crea una nueva plantilla
   - Usa esta estructura como referencia:

```
Asunto: Nueva Solicitud de Pedido - The Spanish Gipsoteca

Hola {{to_name}},

Has recibido una nueva solicitud de pedido desde la web de The Spanish Gipsoteca.

Información del Cliente:
- Nombre: {{from_name}}
- Email: {{from_email}}
- Teléfono: {{phone}}
- Dirección: {{address}}

Productos Solicitados:
{{products}}

Total: {{total}} ({{total_items}} artículo(s))

Mensaje del Cliente:
{{message}}

---
Este email fue enviado desde el formulario de checkout de la web.
```

   - Anota el **Template ID** que se genera

4. **Obtener la Public Key**
   - Ve a "Account" > "General"
   - Copia tu **Public Key**

5. **Configurar variables de entorno**

   En tu archivo `.env` (local) o en Vercel (producción), agrega:

```env
REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=tu_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key
```

6. **Actualizar el archivo .env.example**

   El archivo `.env.example` ya incluye estas variables como referencia.

## Nota importante:

- **NO** subas tu archivo `.env` a Git (ya está en `.gitignore`)
- En Vercel, configura estas variables en Settings > Environment Variables
- El email se enviará a la dirección de email que configuraste en el servicio de EmailJS

## Prueba del sistema:

1. Añade productos al carrito
2. Ve a checkout
3. Completa el formulario
4. Envía la solicitud
5. Verifica que recibes el email en tu bandeja de entrada

## Alternativa sin EmailJS:

Si prefieres no usar EmailJS, puedes modificar `src/pages/Checkout.js` para:
- Mostrar los datos del pedido en pantalla
- Copiar al portapapeles
- O integrar con otro servicio de email (SendGrid, Mailgun, etc.)
