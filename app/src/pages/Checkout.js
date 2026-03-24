import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import emailjs from '@emailjs/browser';
import OptimizedImage from '../components/OptimizedImage';
import { supabase } from '../lib/supabase';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' o 'shipping'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Verificar conexión a Supabase
    console.log('🔍 Verificando conexión a Supabase...');
    console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL || 'https://vnefocljtdvkabfxwoqg.supabase.co');
    console.log('Supabase Key configurada:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

    try {
      // Obtener información del dispositivo y navegador
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const deviceType = isMobile ? 'Móvil' : 'Escritorio';
      const screenSize = `${window.screen.width}x${window.screen.height}`;
      const viewportSize = `${window.innerWidth}x${window.innerHeight}`;

      // Obtener zona horaria
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Formatear productos con toda la información
      const productsList = cart.map((item, index) => {
        // Manejar precio vacío o undefined
        let priceStr = item.price || '';
        if (!priceStr || priceStr.trim() === '') {
          priceStr = 'Precio no disponible';
        }
        // Extraer valor numérico del precio
        const priceValue = parseFloat(priceStr.toString().replace(/[€,\s]/g, '').replace(',', '.')) || 0;
        const subtotal = priceValue * item.quantity;
        return `${index + 1}. ${item.name || 'Sin nombre'}
   - Código: ${item.code || 'N/A'}
   - Categoría: ${item.categoryId || 'N/A'}
   - Artista: ${item.artist || 'N/A'}
   - Cantidad: ${item.quantity}
   - Precio unitario: ${priceStr}
   - Subtotal: ${subtotal > 0 ? subtotal.toFixed(2) + '€' : 'Precio no disponible'}`;
      }).join('\n\n');

      // Preparar datos del email con estructura completa
      const now = new Date();
      const deliveryTypeText = deliveryType === 'pickup' ? '📍 RECOGIDA EN TALLER' : '🚚 ENVÍO A DOMICILIO';
      const emailData = {
        to_email: 'thespanishgipsoteca@gmail.com',
        to_name: 'The Spanish Gipsoteca',
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone || 'No proporcionado',
        delivery_type: deliveryTypeText,
        address: deliveryType === 'shipping' ? (formData.address || 'No proporcionado') : 'N/A - Recogida en taller',
        city: deliveryType === 'shipping' ? (formData.city || 'No proporcionado') : 'N/A - Recogida en taller',
        postal_code: deliveryType === 'shipping' ? (formData.postalCode || 'No proporcionado') : 'N/A',
        country: deliveryType === 'shipping' ? (formData.country || 'No proporcionado') : 'N/A',
        full_address: deliveryType === 'shipping'
          ? `${formData.address || ''}, ${formData.city || ''}, ${formData.postalCode || ''}, ${formData.country || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'No proporcionado'
          : 'RECOGIDA EN TALLER - Barcelona',
        message: formData.message || 'Sin mensaje adicional',
        // Productos detallados
        products_list: productsList || 'No hay productos',
        products_summary: cart.map(item =>
          `${item.name || 'Sin nombre'} (${item.code || 'N/A'}) x${item.quantity} - ${item.price || '0.00€'}`
        ).join('\n') || 'No hay productos',
        total: `${getTotalPrice().toFixed(2)}€`,
        total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        // Fecha y hora completa
        date: now.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        date_full: now.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        time: now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        // Información del dispositivo
        device_type: deviceType,
        user_agent: userAgent,
        screen_size: screenSize,
        viewport_size: viewportSize,
        timezone: timezone,
        language: navigator.language || 'No disponible',
        platform: navigator.platform || 'No disponible',
        // URL de origen
        origin_url: window.location.origin,
        referrer: document.referrer || 'Directo (sin referrer)',
      };

      // Enviar email usando EmailJS
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      // Debug: verificar variables de entorno
      console.log('EmailJS Config:', {
        serviceId: serviceId ? '✓ Configurado' : '✗ Faltante',
        templateId: templateId ? '✓ Configurado' : '✗ Faltante',
        publicKey: publicKey ? '✓ Configurado' : '✗ Faltante'
      });

      // Guardar pedido en Supabase PRIMERO
      const orderItems = cart.map(item => ({
        code: item.code || 'N/A',
        name: item.name || 'Sin nombre',
        quantity: item.quantity,
        price: item.price || '0.00€',
        categoryId: item.categoryId || null,
        artist: item.artist || null
      }));

      const totalAmount = getTotalPrice();

      console.log('Guardando pedido en BD...', {
        order_type: 'checkout',
        customer_name: formData.name,
        customer_email: formData.email,
        total_amount: totalAmount
      });

      // Preparar datos para insertar
      const orderDataToInsert = {
        order_type: 'checkout',
        status: 'pending',
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone || null,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'shipping' ? formData.address : null,
        delivery_city: deliveryType === 'shipping' ? formData.city : null,
        delivery_postal_code: deliveryType === 'shipping' ? formData.postalCode : null,
        delivery_country: deliveryType === 'shipping' ? formData.country : null,
        order_items: orderItems,
        total_amount: totalAmount,
        shipping_cost: null,
        message: formData.message || null
      };

      console.log('📦 Datos a insertar en BD:', JSON.stringify(orderDataToInsert, null, 2));
      console.log('📦 Intentando insertar en tabla "orders"...');

      // Intentar insertar (sin .select() para evitar problemas con RLS)
      // Los usuarios públicos pueden insertar pero no leer, así que no usamos .select()
      const { error: dbError } = await supabase
        .from('orders')
        .insert(orderDataToInsert);

      if (dbError) {
        console.error('❌ ERROR AL GUARDAR PEDIDO EN BD:');
        console.error('=====================================');
        console.error('Código:', dbError.code);
        console.error('Mensaje:', dbError.message);
        console.error('Detalles:', dbError.details);
        console.error('Hint:', dbError.hint);
        console.error('Error completo:', JSON.stringify(dbError, null, 2));
        console.error('=====================================');

        // Mostrar alerta visual si es un error crítico
        if (dbError.code === '42P01' || dbError.message?.includes('does not exist')) {
          alert('⚠️ Error: La tabla "orders" no existe. Contacta al administrador.');
          console.error('⚠️ La tabla "orders" no existe. Ejecuta el script orders-schema.sql en Supabase.');
        } else if (dbError.code === '42501' || dbError.message?.includes('permission denied') || dbError.message?.includes('new row violates row-level security')) {
          alert('⚠️ Error de permisos. Verifica las políticas RLS en Supabase. Ejecuta fix-orders-rls-definitive.sql');
          console.error('⚠️ Error de permisos RLS. Ejecuta el script fix-orders-rls-definitive.sql en Supabase.');
          throw new Error('Error de permisos RLS');
        } else if (dbError.message?.includes('Timeout')) {
          alert('⚠️ Error: La conexión tardó demasiado. Verifica tu conexión a internet.');
        } else {
          // Mostrar error genérico al usuario
          alert(`⚠️ Error al guardar el pedido: ${dbError.message || 'Error desconocido'}. El pedido se envió por email pero no se guardó en la base de datos.`);
        }
        // Continuamos aunque falle la BD para no bloquear el proceso
      } else {
        console.log('✅✅✅ PEDIDO GUARDADO CORRECTAMENTE EN BD ✅✅✅');
        console.log('El pedido se ha guardado correctamente. Los usuarios públicos no pueden leer los datos después de insertar (comportamiento esperado por RLS).');
      }

      // Enviar email usando EmailJS
      if (serviceId && templateId && publicKey) {
        try {
          await emailjs.send(serviceId, templateId, emailData, publicKey);
          console.log('Email enviado correctamente');
        } catch (emailError) {
          console.error('Error enviando email:', emailError);
          // No bloqueamos si el email falla pero la BD funcionó
        }
      } else {
        console.warn('EmailJS no configurado. Variables faltantes:', {
          serviceId: !serviceId,
          templateId: !templateId,
          publicKey: !publicKey
        });
      }

      setSubmitStatus('success');
      setOrderSuccess(true);
      clearCart();

      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        message: '',
      });

      // NO redirigir automáticamente, mostrar mensaje de agradecimiento
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar mensaje de agradecimiento si el pedido fue exitoso
  if (orderSuccess || (cart.length === 0 && submitStatus === 'success')) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:px-10">
            <div className="mb-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-4 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl">
                ¡Pedido Enviado!
              </h1>
              <p className="mb-4 text-lg text-white/80">
                Gracias por tu pedido
              </p>
              <p className="mb-8 text-white/70">
                Hemos recibido tu solicitud correctamente. Nos pondremos en contacto contigo en un plazo de 24-48 horas para coordinar el pago y la entrega.
              </p>
              <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-6 text-left">
                <p className="mb-2 text-sm font-medium text-white">¿Qué sigue?</p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Revisaremos tu pedido y te contactaremos por email o teléfono</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Te informaremos sobre los métodos de pago disponibles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">✓</span>
                    <span>Coordinaremos la entrega o recogida según tu elección</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setSubmitStatus(null);
                  navigate('/shop');
                }}
                className="rounded-sm bg-white px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90"
              >
                Seguir Comprando
              </button>
              <button
                onClick={() => {
                  setOrderSuccess(false);
                  setSubmitStatus(null);
                  navigate('/');
                }}
                className="rounded-sm border border-white/20 bg-transparent px-8 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-all hover:border-white/40"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Mostrar carrito vacío solo si no hay pedido exitoso
  if (cart.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
        <div className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:px-10">
            <h1 className="mb-4 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl">
              Carrito Vacío
            </h1>
            <p className="mb-8 text-white/70">
              No hay productos en tu carrito.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="rounded-sm bg-white px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90"
            >
              Explorar Productos
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:px-10">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white sm:mb-8"
          >
            <ArrowLeftIcon />
            Volver
          </button>

          <h1 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:mb-4">
            Tramitar Pedido
          </h1>
          <p className="mb-8 text-sm text-white/70 sm:text-base">
            Completa tus datos y te contactaremos para finalizar tu pedido.
          </p>

          {/* Aviso importante */}
          <div className="mb-8 rounded-sm border border-white/20 bg-white/5 p-4 sm:p-6">
            <h2 className="mb-2 font-display text-lg uppercase tracking-[0.1em] text-white sm:text-xl">
              ⚠️ Información Importante
            </h2>
            <p className="mb-2 text-sm leading-relaxed text-white/80 sm:text-base">
              El pago online no está disponible actualmente. Al completar este formulario, enviaremos tu solicitud a <strong>Javier</strong>, quien se pondrá en contacto contigo para coordinar el pago y la entrega.
            </p>
            <p className="mb-2 text-sm leading-relaxed text-white/80 sm:text-base">
              <strong>Gastos de envío:</strong> Los gastos de envío se cobran aparte y se calcularán según el destino. Si eliges <strong>recogida en taller</strong>, no habrá gastos de envío.
            </p>
            <p className="text-sm text-white/70 sm:text-base">
              Recibirás una respuesta en un plazo de 24-48 horas.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <h2 className="mb-6 font-display text-xl uppercase tracking-[0.15em] text-white sm:text-2xl">
                Resumen del Pedido
              </h2>
              <div className="space-y-4 border-b border-white/10 pb-6">
                {cart.map((item) => (
                  <div key={`${item.categoryId}-${item.code}`} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="aspect-[3/4] w-16">
                        {item.images && item.images.length > 0 ? (
                          <OptimizedImage
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full"
                            priority={false}
                            aspectRatio="3/4"
                            size="thumbnail"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-black/50">
                            <svg className="h-6 w-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 text-sm font-medium text-white">{item.name}</h3>
                      <p className="mb-1 text-xs text-white/50">Code: {item.code}</p>
                      <p className="mb-1 text-xs text-white/70">Cantidad: {item.quantity}</p>
                      <p className="text-sm font-medium text-white">
                        {item.price}
                        <span className="text-xs text-white/50 ml-1">(+ gastos de envío)</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg uppercase tracking-[0.1em] text-white/70">Subtotal</span>
                  <span className="text-2xl font-medium text-white">
                    {getTotalPrice().toFixed(2)}€
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Gastos de envío</span>
                  <span className="text-white/50">Se calcularán según destino</span>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2">
              <h2 className="mb-6 font-display text-xl uppercase tracking-[0.15em] text-white sm:text-2xl">
                Información de Contacto
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Selector de Tipo de Entrega */}
                <div className="mb-8">
                  <label className="mb-4 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                    Método de Entrega *
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-4 sm:p-6 border text-left transition-all ${deliveryType === 'pickup'
                          ? 'border-white bg-white/10'
                          : 'border-white/20 bg-black/50 hover:border-white/40'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">📍</span>
                        <span className="font-display text-sm uppercase tracking-[0.1em] text-white sm:text-base">
                          Recogida en Taller
                        </span>
                      </div>
                      <p className="text-xs text-white/60 sm:text-sm">
                        Recoge tu pedido en nuestro taller de Barcelona. Te contactaremos para coordinar la recogida.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('shipping')}
                      className={`p-4 sm:p-6 border text-left transition-all ${deliveryType === 'shipping'
                          ? 'border-white bg-white/10'
                          : 'border-white/20 bg-black/50 hover:border-white/40'
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">🚚</span>
                        <span className="font-display text-sm uppercase tracking-[0.1em] text-white sm:text-base">
                          Envío a Domicilio
                        </span>
                      </div>
                      <p className="text-xs text-white/60 sm:text-sm">
                        Enviamos a toda España y Europa. Gastos de envío según destino.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="tu@email.com"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label htmlFor="phone" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="+34 123 456 789"
                  />
                </div>

                {/* Campos de dirección - Solo si es envío */}
                {deliveryType === 'shipping' && (
                  <>
                    {/* Dirección */}
                    <div>
                      <label htmlFor="address" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                        placeholder="Calle y número"
                      />
                    </div>

                    {/* Ciudad y Código Postal */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="city" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                          Código Postal *
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                          className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                          placeholder="28001"
                        />
                      </div>
                    </div>

                    {/* País */}
                    <div>
                      <label htmlFor="country" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                        País *
                      </label>
                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                        placeholder="España"
                      />
                    </div>
                  </>
                )}

                {/* Info de recogida en taller */}
                {deliveryType === 'pickup' && (
                  <div className="rounded-sm border border-white/10 bg-white/5 p-4 sm:p-6">
                    <h3 className="font-display text-sm uppercase tracking-[0.1em] text-white mb-3">
                      📍 Información de Recogida
                    </h3>
                    <p className="text-sm text-white/70 mb-2">
                      Te contactaremos por teléfono para coordinar el día y hora de recogida.
                    </p>
                    <p className="text-xs text-white/50">
                      Ubicación: Barcelona (se proporcionará dirección exacta al confirmar el pedido)
                    </p>
                  </div>
                )}

                {/* Mensaje adicional */}
                <div>
                  <label htmlFor="message" className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm">
                    Mensaje Adicional (Opcional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full resize-none rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="Comentarios adicionales sobre tu pedido..."
                  />
                </div>

                {/* Mensaje de éxito */}
                {submitStatus === 'success' && (
                  <div className="rounded-sm border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mb-3 font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl">
                      ¡Gracias por tu Pedido!
                    </h3>
                    <p className="mb-2 text-sm leading-relaxed text-white/90 sm:text-base">
                      Hemos recibido tu solicitud correctamente.
                    </p>
                    <p className="mb-4 text-sm leading-relaxed text-white/80 sm:text-base">
                      Nos pondremos en contacto contigo en un plazo de <strong className="text-white">24-48 horas</strong> para coordinar el pago y la entrega de tu pedido.
                    </p>
                    <p className="text-xs text-white/60 sm:text-sm">
                      Te redirigiremos a la tienda en unos segundos...
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="rounded-sm border border-red-500/50 bg-red-500/10 px-4 py-3.5 text-sm text-red-400">
                    ✗ Error al enviar la solicitud. Por favor, intenta de nuevo o contacta directamente.
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-sm bg-white px-6 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base sm:tracking-[0.2em]"
                >
                  {isSubmitting ? 'Enviando Solicitud...' : 'Enviar Solicitud de Pedido'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
