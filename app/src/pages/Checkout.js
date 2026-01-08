import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import emailjs from '@emailjs/browser';

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
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

    try {
      // Preparar datos del email
      const emailData = {
        to_name: 'Javier',
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        message: formData.message || 'Sin mensaje adicional',
        products: cart.map(item => 
          `${item.name} (${item.code}) - Cantidad: ${item.quantity} - ${item.price}`
        ).join('\n'),
        total: `${getTotalPrice().toFixed(2)}€`,
        total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
      };

      // Enviar email usando EmailJS
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, emailData, publicKey);
      } else {
        // Si EmailJS no está configurado, mostrar los datos en consola
        // En producción, esto debería estar configurado
        console.log('EmailJS no configurado. Datos del pedido:', emailData);
        // Simular éxito para desarrollo
        throw new Error('EmailJS no está configurado. Por favor, configura las variables de entorno. Ver EMAILJS_SETUP.md');
      }

      setSubmitStatus('success');
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

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/shop');
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Checkout
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
                    <div className="aspect-[3/4] w-16 overflow-hidden bg-black">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
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
                    <p className="text-sm font-medium text-white">{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-lg uppercase tracking-[0.1em] text-white/70">Total</span>
              <span className="text-2xl font-medium text-white">
                {getTotalPrice().toFixed(2)}€
              </span>
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 font-display text-xl uppercase tracking-[0.15em] text-white sm:text-2xl">
              Información de Contacto
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              {/* Mensajes de estado */}
              {submitStatus === 'success' && (
                <div className="rounded-sm border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white">
                  ✓ Solicitud enviada correctamente. Javier se pondrá en contacto contigo pronto. Redirigiendo...
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
