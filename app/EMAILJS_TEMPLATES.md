# Templates de EmailJS para The Spanish Gipsoteca

Este documento describe los templates de EmailJS que debes configurar en tu cuenta de EmailJS para que los emails se envíen correctamente a **thespanishgipsoteca@gmail.com**.

## Configuración General

- **Email de destino**: thespanishgipsoteca@gmail.com
- **Service ID**: Configurar en variables de entorno como `REACT_APP_EMAILJS_SERVICE_ID`
- **Public Key**: Configurar en variables de entorno como `REACT_APP_EMAILJS_PUBLIC_KEY`

---

## Template 1: NUEVO PEDIDO RECIBIDO (Checkout)

**Template ID**: Configurar como `REACT_APP_EMAILJS_TEMPLATE_ID`

**Asunto del Email**:
```
🛒 NUEVO PEDIDO RECIBIDO - The Spanish Gipsoteca
```

**Cuerpo del Email (HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; }
    .section { margin-bottom: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #d0b06a; }
    .section-title { font-weight: bold; color: #000; margin-bottom: 10px; font-size: 16px; text-transform: uppercase; }
    .info-row { margin: 8px 0; }
    .product-item { padding: 10px; margin: 5px 0; background-color: #f5f5f5; border-radius: 4px; }
    .total { font-size: 20px; font-weight: bold; color: #000; text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #d0b06a; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛒 NUEVO PEDIDO RECIBIDO</h1>
      <p>The Spanish Gipsoteca</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">📅 Información del Pedido</div>
        <div class="info-row"><strong>Fecha Completa:</strong> {{date_full}}</div>
        <div class="info-row"><strong>Hora:</strong> {{time}}</div>
        <div class="info-row"><strong>Fecha y Hora:</strong> {{date}}</div>
        <div class="info-row"><strong>Zona Horaria:</strong> {{timezone}}</div>
        <div class="info-row"><strong>Total de Artículos:</strong> {{total_items}}</div>
        <div class="info-row"><strong>Total del Pedido:</strong> {{total}}</div>
      </div>

      <div class="section">
        <div class="section-title">💻 Información Técnica</div>
        <div class="info-row"><strong>Tipo de Dispositivo:</strong> {{device_type}}</div>
        <div class="info-row"><strong>Plataforma:</strong> {{platform}}</div>
        <div class="info-row"><strong>Idioma:</strong> {{language}}</div>
        <div class="info-row"><strong>Resolución de Pantalla:</strong> {{screen_size}}</div>
        <div class="info-row"><strong>Tamaño de Ventana:</strong> {{viewport_size}}</div>
        <div class="info-row"><strong>Origen:</strong> {{origin_url}}</div>
        <div class="info-row"><strong>Referrer:</strong> {{referrer}}</div>
      </div>

      <div class="section">
        <div class="section-title">👤 Información del Cliente</div>
        <div class="info-row"><strong>Nombre:</strong> {{from_name}}</div>
        <div class="info-row"><strong>Email:</strong> {{from_email}}</div>
        <div class="info-row"><strong>Teléfono:</strong> {{phone}}</div>
      </div>

      <div class="section">
        <div class="section-title">📍 Dirección de Envío</div>
        <div class="info-row"><strong>Dirección:</strong> {{address}}</div>
        <div class="info-row"><strong>Ciudad:</strong> {{city}}</div>
        <div class="info-row"><strong>Código Postal:</strong> {{postal_code}}</div>
        <div class="info-row"><strong>País:</strong> {{country}}</div>
        <div class="info-row" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee;">
          <strong>Dirección Completa:</strong><br>
          {{full_address}}
        </div>
      </div>

      <div class="section">
        <div class="section-title">🛍️ Productos Solicitados</div>
        <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 15px; border-radius: 4px;">{{products_list}}</pre>
      </div>

      {{#message}}
      <div class="section">
        <div class="section-title">💬 Mensaje del Cliente</div>
        <div style="padding: 10px; background-color: #f5f5f5; border-radius: 4px; white-space: pre-wrap;">{{message}}</div>
      </div>
      {{/message}}

      <div class="total">
        TOTAL: {{total}}
      </div>
    </div>

    <div class="footer">
      <p>Este email fue generado automáticamente desde el formulario de checkout de The Spanish Gipsoteca.</p>
      <p>Por favor, contacta con el cliente en un plazo de 24-48 horas para coordinar el pago y la entrega.</p>
    </div>
  </div>
</body>
</html>
```

**Cuerpo del Email (Texto Plano - alternativa)**:
```
🛒 NUEVO PEDIDO RECIBIDO - The Spanish Gipsoteca

═══════════════════════════════════════════════════════════

📅 INFORMACIÓN DEL PEDIDO
───────────────────────────────────────────────────────────
Fecha Completa: {{date_full}}
Hora: {{time}}
Fecha y Hora: {{date}}
Zona Horaria: {{timezone}}
Total de Artículos: {{total_items}}
Total del Pedido: {{total}}

═══════════════════════════════════════════════════════════

💻 INFORMACIÓN TÉCNICA
───────────────────────────────────────────────────────────
Tipo de Dispositivo: {{device_type}}
Plataforma: {{platform}}
Idioma: {{language}}
Resolución de Pantalla: {{screen_size}}
Tamaño de Ventana: {{viewport_size}}
Origen: {{origin_url}}
Referrer: {{referrer}}

═══════════════════════════════════════════════════════════

👤 INFORMACIÓN DEL CLIENTE
───────────────────────────────────────────────────────────
Nombre: {{from_name}}
Email: {{from_email}}
Teléfono: {{phone}}

═══════════════════════════════════════════════════════════

📍 DIRECCIÓN DE ENVÍO
───────────────────────────────────────────────────────────
Dirección: {{address}}
Ciudad: {{city}}
Código Postal: {{postal_code}}
País: {{country}}

Dirección Completa:
{{full_address}}

═══════════════════════════════════════════════════════════

🛍️ PRODUCTOS SOLICITADOS
───────────────────────────────────────────────────────────
{{products_list}}

═══════════════════════════════════════════════════════════

💬 MENSAJE DEL CLIENTE
───────────────────────────────────────────────────────────
{{message}}

═══════════════════════════════════════════════════════════

TOTAL: {{total}}

═══════════════════════════════════════════════════════════

Este email fue generado automáticamente desde el formulario de checkout de The Spanish Gipsoteca.

Por favor, contacta con el cliente en un plazo de 24-48 horas para coordinar el pago y la entrega.
```

---

## Template 2: NUEVA CONSULTA - CONTACTO

**Template ID**: Configurar como `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID` (o usar el mismo que checkout)

**Asunto del Email**:
```
📧 NUEVA CONSULTA - The Spanish Gipsoteca
```

**Cuerpo del Email (HTML)**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; }
    .section { margin-bottom: 20px; padding: 15px; background-color: #fff; border-left: 4px solid #d0b06a; }
    .section-title { font-weight: bold; color: #000; margin-bottom: 10px; font-size: 16px; text-transform: uppercase; }
    .info-row { margin: 8px 0; }
    .message-box { padding: 15px; background-color: #f5f5f5; border-radius: 4px; white-space: pre-wrap; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📧 NUEVA CONSULTA</h1>
      <p>The Spanish Gipsoteca</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">📅 Información de la Consulta</div>
        <div class="info-row"><strong>Fecha y Hora:</strong> {{date}}</div>
        <div class="info-row"><strong>Asunto:</strong> {{subject}}</div>
      </div>

      <div class="section">
        <div class="section-title">👤 Información del Contacto</div>
        <div class="info-row"><strong>Nombre:</strong> {{from_name}}</div>
        <div class="info-row"><strong>Email:</strong> {{from_email}}</div>
        <div class="info-row" style="margin-top: 10px;">
          <a href="mailto:{{from_email}}" style="background-color: #d0b06a; color: #000; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Responder al Cliente
          </a>
        </div>
      </div>

      <div class="section">
        <div class="section-title">💬 Mensaje</div>
        <div class="message-box">{{message}}</div>
      </div>
    </div>

    <div class="footer">
      <p>Este email fue generado automáticamente desde el formulario de contacto de The Spanish Gipsoteca.</p>
      <p>Por favor, responde al cliente en un plazo de 24-48 horas.</p>
    </div>
  </div>
</body>
</html>
```

**Cuerpo del Email (Texto Plano - alternativa)**:
```
📧 NUEVA CONSULTA - The Spanish Gipsoteca

═══════════════════════════════════════════════════════════

📅 INFORMACIÓN DE LA CONSULTA
───────────────────────────────────────────────────────────
Fecha y Hora: {{date}}
Asunto: {{subject}}

═══════════════════════════════════════════════════════════

👤 INFORMACIÓN DEL CONTACTO
───────────────────────────────────────────────────────────
Nombre: {{from_name}}
Email: {{from_email}}

Para responder, envía un email a: {{from_email}}

═══════════════════════════════════════════════════════════

💬 MENSAJE
───────────────────────────────────────────────────────────
{{message}}

═══════════════════════════════════════════════════════════

Este email fue generado automáticamente desde el formulario de contacto de The Spanish Gipsoteca.

Por favor, responde al cliente en un plazo de 24-48 horas.
```

---

## Variables Disponibles

### Para Checkout (Template de Pedido):
- `to_email`: thespanishgipsoteca@gmail.com
- `to_name`: The Spanish Gipsoteca
- `from_name`: Nombre del cliente
- `from_email`: Email del cliente
- `phone`: Teléfono del cliente
- `address`: Dirección
- `city`: Ciudad
- `postal_code`: Código postal
- `country`: País
- `full_address`: Dirección completa
- `message`: Mensaje adicional del cliente
- `products_list`: Lista detallada de productos
- `products_summary`: Resumen de productos
- `total`: Total del pedido
- `total_items`: Número total de artículos
- `date`: Fecha y hora del pedido

### Para Contacto (Template de Consulta):
- `to_email`: thespanishgipsoteca@gmail.com
- `from_name`: Nombre del contacto
- `from_email`: Email del contacto
- `subject`: Asunto del mensaje
- `message`: Mensaje del contacto
- `date`: Fecha y hora de la consulta

---

## Configuración en EmailJS

1. **Crear los templates en EmailJS**:
   - Ve a tu dashboard de EmailJS
   - Crea dos templates separados (uno para pedidos, otro para contacto)
   - Copia y pega el contenido HTML o texto plano de arriba
   - Asegúrate de que el email de destino esté configurado como `thespanishgipsoteca@gmail.com`

2. **Configurar variables de entorno**:
   ```env
   REACT_APP_EMAILJS_SERVICE_ID=tu_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=template_id_para_pedidos
   REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=template_id_para_contacto
   REACT_APP_EMAILJS_PUBLIC_KEY=tu_public_key
   ```

3. **Nota**: Si no configuras `REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID`, el formulario de contacto usará el mismo template que checkout (no recomendado, pero funcionará).

---

## Pruebas

1. **Probar Checkout**:
   - Añade productos al carrito
   - Completa el formulario de checkout
   - Verifica que recibes el email en thespanishgipsoteca@gmail.com con el asunto "🛒 NUEVO PEDIDO RECIBIDO"

2. **Probar Contacto**:
   - Completa el formulario de contacto
   - Verifica que recibes el email en thespanishgipsoteca@gmail.com con el asunto "📧 NUEVA CONSULTA"
