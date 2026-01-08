import { useState } from "react";
import Footer from "../components/Footer";

const MailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7292C21.7209 20.9842 21.5573 21.2131 21.3518 21.4014C21.1462 21.5897 20.9031 21.7334 20.6371 21.8232C20.3711 21.913 20.088 21.9468 19.807 21.922C16.7432 21.5856 13.7842 20.5341 11.19 18.852C8.77382 17.3147 6.72533 15.2662 5.188 12.85C3.49997 10.2412 2.44824 7.27099 2.118 4.202C2.09318 3.92089 2.12698 3.63776 2.2168 3.37178C2.30661 3.1058 2.45026 2.86272 2.63857 2.65716C2.82688 2.4516 3.05581 2.28805 3.31078 2.17643C3.56575 2.06481 3.84152 2.00782 4.12 2.009H7.12C7.68147 1.99522 8.22806 2.16708 8.68189 2.49965C9.13572 2.83222 9.47129 3.30933 9.64 3.862C9.88979 4.72057 10.2362 5.54697 10.67 6.322C10.9058 6.75073 11.0064 7.23876 10.96 7.722C10.9136 8.20524 10.7218 8.66526 10.41 9.042L9.09 10.362C10.5144 12.9528 12.5272 14.9656 15.118 16.39L16.438 15.07C16.8147 14.7582 17.2748 14.5664 17.758 14.52C18.2412 14.4736 18.7293 14.5742 19.158 14.81C19.933 15.2438 20.7594 15.5902 21.618 15.84C22.1707 16.0087 22.6478 16.3443 22.9803 16.7981C23.3129 17.2519 23.4848 17.7985 23.471 18.36L22.471 18.36Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LocationIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
  </svg>
);

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
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

    // Simular envío (aquí puedes integrar con un servicio de email como EmailJS, Formspree, etc.)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
      {/* Hero Section */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 md:px-10">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-accent sm:mb-4 sm:text-sm">Contacto</p>
          <h1 className="mb-4 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] sm:mb-6 md:text-5xl lg:text-6xl">
            Ponte en Contacto
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
            Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-black py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Información de contacto */}
            <div>
              <h2 className="mb-4 font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] sm:mb-6">
                Información de Contacto
              </h2>
              <p className="mb-10 text-sm leading-relaxed text-white/70 sm:text-base">
                Si prefieres contactarnos directamente, puedes usar cualquiera de los siguientes medios. Estamos disponibles para responder tus consultas sobre nuestras piezas, pedidos personalizados o cualquier otra información que necesites.
              </p>

              <div className="space-y-8">
                {/* Email */}
                <div className="group relative">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-sm border border-white/20 bg-white/5 p-4 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                      <MailIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-white sm:text-base">
                        Email
                      </h3>
                      <a
                        href="mailto:info@spanishgipsoteca.com"
                        className="block text-sm text-white/70 transition-colors hover:text-white sm:text-base"
                      >
                        info@spanishgipsoteca.com
                      </a>
                      <p className="mt-1 text-xs text-white/50 sm:text-sm">
                        Respuesta en 24-48 horas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="group relative">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-sm border border-white/20 bg-white/5 p-4 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                      <PhoneIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-white sm:text-base">
                        Teléfono
                      </h3>
                      <a
                        href="tel:+34123456789"
                        className="block text-sm text-white/70 transition-colors hover:text-white sm:text-base"
                      >
                        +34 123 456 789
                      </a>
                      <p className="mt-1 text-xs text-white/50 sm:text-sm">
                        Lunes a Viernes, 9:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="group relative">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-sm border border-white/20 bg-white/5 p-4 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                      <LocationIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-white sm:text-base">
                        Dirección
                      </h3>
                      <p className="text-sm text-white/70 sm:text-base">
                        Madrid, España
                      </p>
                      <p className="mt-1 text-xs text-white/50 sm:text-sm">
                        Visitas con cita previa
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horarios */}
                <div className="group relative">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-sm border border-white/20 bg-white/5 p-4 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                      <ClockIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-2 text-sm font-medium uppercase tracking-[0.15em] text-white sm:text-base">
                        Horario de Atención
                      </h3>
                      <div className="space-y-1 text-sm text-white/70 sm:text-base">
                        <p>Lunes - Viernes: 9:00 - 18:00</p>
                        <p>Sábados: 10:00 - 14:00</p>
                        <p className="text-white/50">Domingos: Cerrado</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redes sociales */}
                <div className="group relative pt-4 border-t border-white/10">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 rounded-sm border border-white/20 bg-white/5 p-4 transition-all group-hover:border-white/40 group-hover:bg-white/10">
                      <InstagramIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.15em] text-white sm:text-base">
                        Síguenos
                      </h3>
                      <div className="flex gap-4">
                        <a
                          href="https://www.instagram.com/thespanishgipsoteca/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/icon rounded-sm border border-white/20 bg-white/5 p-3 text-white/70 transition-all hover:border-white/40 hover:bg-white/10 hover:text-white"
                          aria-label="Instagram"
                        >
                          <InstagramIcon className="h-6 w-6" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div>
              <h2 className="mb-4 font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] sm:mb-6">
                Envíanos un Mensaje
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-white/70 sm:text-base">
                Completa el formulario y nos pondremos en contacto contigo lo antes posible.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm"
                  >
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="Tu nombre"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm"
                  >
                    Email
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

                {/* Asunto */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm"
                  >
                    Asunto
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="Asunto del mensaje"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-xs uppercase tracking-[0.1em] text-white/70 sm:text-sm"
                  >
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={7}
                    className="w-full resize-none rounded-sm border border-white/20 bg-black/50 px-4 py-3.5 text-sm text-white placeholder-white/30 transition-all focus:border-white focus:bg-black/70 focus:outline-none sm:text-base"
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  />
                </div>

                {/* Mensaje de éxito/error */}
                {submitStatus === "success" && (
                  <div className="rounded-sm border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white">
                    ✓ Mensaje enviado correctamente. Te responderemos pronto.
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-sm bg-white px-6 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base sm:tracking-[0.2em]"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="border-t border-white/10 bg-black/60 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <h3 className="mb-3 font-display text-lg uppercase tracking-[0.15em] text-white sm:text-xl">
                Consultas Personalizadas
              </h3>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                ¿Buscas una pieza específica? Contáctanos y te ayudaremos a encontrar lo que necesitas.
              </p>
            </div>
            <div className="text-center">
              <h3 className="mb-3 font-display text-lg uppercase tracking-[0.15em] text-white sm:text-xl">
                Pedidos Especiales
              </h3>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                Realizamos moldes personalizados según tus especificaciones. Consulta disponibilidad.
              </p>
            </div>
            <div className="text-center">
              <h3 className="mb-3 font-display text-lg uppercase tracking-[0.15em] text-white sm:text-xl">
                Visitas al Taller
              </h3>
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                Organizamos visitas guiadas a nuestro taller. Reserva tu cita con antelación.
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
