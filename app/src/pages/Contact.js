import { useState } from "react";
import Footer from "../components/Footer";
import emailjs from '@emailjs/browser';
import { supabase } from '../lib/supabase';

// Icono de Instagram moderno y minimalista
const InstagramIcon = ({ size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" 
      fill="currentColor"
    />
    <path 
      d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z" 
      fill="currentColor"
    />
    <circle cx="18.406" cy="5.594" r="1.44" fill="currentColor" />
  </svg>
);

// Icono de flecha para el botón
const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Contact() {
  // Imagen de fondo desde Supabase Storage
  // La imagen debe estar en: product-images/contacto/
  const contactBackground = "https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/contacto/contacto.jpg";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

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
      const emailData = {
        to_email: 'thespanishgipsoteca@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toLocaleString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };

      // Guardar contacto en Supabase
      const contactDataToInsert = {
        order_type: 'contact',
        status: 'pending',
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: null,
        subject: formData.subject,
        message: formData.message
      };

      console.log('📧 Guardando contacto en BD...', contactDataToInsert);

      const { data: contactData, error: dbError } = await supabase
        .from('orders')
        .insert(contactDataToInsert)
        .select();

      if (dbError) {
        console.error('❌ Error guardando contacto en BD:', dbError);
        console.error('Código:', dbError.code);
        console.error('Mensaje:', dbError.message);
        console.error('Detalles:', dbError.details);
        console.error('Hint:', dbError.hint);
      } else {
        console.log('✅ Contacto guardado correctamente en BD:', contactData);
      }

      if (dbError) {
        console.error('Error guardando contacto en BD:', dbError);
        // No bloqueamos el envío si falla la BD, pero lo registramos
      }

      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID || process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && publicKey) {
        await emailjs.send(serviceId, templateId, emailData, publicKey);
      } else {
        console.log('EmailJS no configurado. Datos del contacto:', emailData);
        // No lanzamos error si ya se guardó en BD
        if (dbError) {
          throw new Error('Error al guardar el mensaje. Por favor, intenta de nuevo.');
        }
      }

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen flex-col text-white pt-16 sm:pt-20"
      style={{
        backgroundImage: contactBackground 
          ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${contactBackground})` 
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#000000"
      }}
    >
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 md:py-16 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Contacto</p>
            <h1 className="mb-4 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-6xl sm:mb-6">
              Hablemos
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
              Estamos aquí para ayudarte con cualquier consulta sobre nuestras piezas
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="relative py-12 sm:py-16 md:py-20">
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-16 lg:grid-cols-5 lg:gap-20">
              
              {/* Info de contacto - Columna izquierda */}
              <div className="lg:col-span-2 space-y-12">
                
                {/* Email */}
                <div className="group">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Email
                  </p>
                  <a
                    href="mailto:thespanishgipsoteca@gmail.com"
                    className="text-lg sm:text-xl text-white/80 transition-colors duration-300 hover:text-white"
                  >
                    thespanishgipsoteca@gmail.com
                  </a>
                  <p className="mt-2 text-xs text-white/30">
                    Respuesta en 24-48h
                  </p>
                </div>

                {/* Teléfono */}
                <div className="group">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Teléfono
                  </p>
                  <a
                    href="tel:+34654371774"
                    className="text-lg sm:text-xl text-white/80 transition-colors duration-300 hover:text-white"
                  >
                    +34 654 371 774
                  </a>
                  <p className="mt-2 text-xs text-white/30">
                    Lun - Vie, 9:00 - 18:00
                  </p>
                </div>

                {/* Ubicación */}
                <div className="group">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Ubicación
                  </p>
                  <p className="text-lg sm:text-xl text-white/80">
                    Barcelona
                  </p>
                  <p className="mt-2 text-xs text-white/30">
                    Visitas con cita previa
                  </p>
                </div>

                {/* Instagram - Sección simplificada */}
                <div className="pt-8">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Síguenos
                  </p>
                  <a
                    href="https://www.instagram.com/thespanishgipsoteca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 group"
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 text-white/70 transition-all duration-300 group-hover:from-white/15 group-hover:to-white/10 group-hover:text-white group-hover:scale-110">
                      <InstagramIcon size={22} />
                    </span>
                    <span className="text-sm text-white/50 transition-colors duration-300 group-hover:text-white/80">
                      @thespanishgipsoteca
                    </span>
                  </a>
                </div>

              </div>

              {/* Formulario - Columna derecha */}
              <div className="lg:col-span-3">
                <div className="relative">
                  {/* Fondo del formulario */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl" />
                  
                  <form onSubmit={handleSubmit} className="relative p-6 sm:p-10 space-y-6">
                    
                    {/* Grid para nombre y email */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Nombre */}
                      <div className="relative">
                        <label
                          htmlFor="name"
                          className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                            focusedField === 'name' || formData.name 
                              ? 'top-0 text-[10px] uppercase tracking-[0.2em] text-white/40' 
                              : 'top-4 text-sm text-white/30'
                          }`}
                        >
                          Nombre
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('name')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full bg-transparent border-b border-white/10 pt-5 pb-3 text-white text-sm focus:border-white/40 focus:outline-none transition-colors duration-300"
                        />
                      </div>

                      {/* Email */}
                      <div className="relative">
                        <label
                          htmlFor="email"
                          className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                            focusedField === 'email' || formData.email 
                              ? 'top-0 text-[10px] uppercase tracking-[0.2em] text-white/40' 
                              : 'top-4 text-sm text-white/30'
                          }`}
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => setFocusedField(null)}
                          required
                          className="w-full bg-transparent border-b border-white/10 pt-5 pb-3 text-white text-sm focus:border-white/40 focus:outline-none transition-colors duration-300"
                        />
                      </div>
                    </div>

                    {/* Asunto */}
                    <div className="relative">
                      <label
                        htmlFor="subject"
                        className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                          focusedField === 'subject' || formData.subject 
                            ? 'top-0 text-[10px] uppercase tracking-[0.2em] text-white/40' 
                            : 'top-4 text-sm text-white/30'
                        }`}
                      >
                        Asunto
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        required
                        className="w-full bg-transparent border-b border-white/10 pt-5 pb-3 text-white text-sm focus:border-white/40 focus:outline-none transition-colors duration-300"
                      />
                    </div>

                    {/* Mensaje */}
                    <div className="relative pt-2">
                      <label
                        htmlFor="message"
                        className={`absolute left-0 transition-all duration-300 pointer-events-none ${
                          focusedField === 'message' || formData.message 
                            ? 'top-0 text-[10px] uppercase tracking-[0.2em] text-white/40' 
                            : 'top-6 text-sm text-white/30'
                        }`}
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        required
                        rows={5}
                        className="w-full bg-transparent border-b border-white/10 pt-5 pb-3 text-white text-sm focus:border-white/40 focus:outline-none transition-colors duration-300 resize-none"
                      />
                    </div>

                    {/* Mensajes de estado */}
                    {submitStatus === "success" && (
                      <div className="flex items-center gap-3 py-4 px-5 bg-emerald-500/10 rounded-lg">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <p className="text-sm text-emerald-400">
                          Mensaje enviado correctamente. Te responderemos pronto.
                        </p>
                      </div>
                    )}
                    
                    {submitStatus === "error" && (
                      <div className="flex items-center gap-3 py-4 px-5 bg-red-500/10 rounded-lg">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                        <p className="text-sm text-red-400">
                          Error al enviar. Contacta directamente a thespanishgipsoteca@gmail.com
                        </p>
                      </div>
                    )}

                    {/* Botón de envío */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-[0.15em] font-medium transition-all duration-300 hover:bg-white/90 hover:gap-5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>{isSubmitting ? "Enviando..." : "Enviar mensaje"}</span>
                        {!isSubmitting && (
                          <ArrowIcon />
                        )}
                        {isSubmitting && (
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Más sutil */}
        <section className="relative py-16 sm:py-20">
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 sm:grid-cols-2 sm:gap-8 max-w-3xl mx-auto">
              
              <div className="text-center sm:text-left">
                <div className="mb-4 text-3xl">✦</div>
                <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-white/80">
                  Consultas Personalizadas
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  ¿Buscas una pieza específica? Te ayudamos a encontrar exactamente lo que necesitas.
                </p>
              </div>

              <div className="text-center sm:text-left">
                <div className="mb-4 text-3xl">✦</div>
                <h3 className="mb-2 text-sm uppercase tracking-[0.2em] text-white/80">
                  Pedidos Especiales
                </h3>
                <p className="text-sm leading-relaxed text-white/40">
                  Realizamos moldes personalizados según tus especificaciones.
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}
