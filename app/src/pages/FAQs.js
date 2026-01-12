import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const faqs = [
  {
    id: 1,
    question: "¿Cómo se realiza un pedido?",
    answer: "Todos los pedidos se realizan a través de la página web. Una vez completado el formulario de compra, la empresa se pondrá en contacto con el cliente en un plazo de 24 a 48 horas para coordinar el pago y la entrega del pedido. Los gastos de envío no están incluídos en el precio del producto. Se notificará al cliente por correo electrónico sobre los métodos de pago disponibles. Se aceptan pedidos de toda la Península. Para pedidos internacionales consultar previamente por correo electrónico."
  },
  {
    id: 2,
    question: "¿Cuáles son los plazos aproximados de entrega?",
    answer: "Todas las piezas se realizan bajo pedido. Los plazos de entrega están sujetos a las particularidades de cada encargo y al volumen de piezas solicitadas. Los plazos estándares oscilan entre los 7 y 15 días para piezas medianas y entre los 15 y 30 días para piezas grandes."
  },
  {
    id: 3,
    question: "¿Cuáles son los métodos de envío disponibles?",
    answer: "La recepción de la pieza puede realizarse mediante un servicio de mensajería con un plazo de entrega de 24 a 48 horas. No obstante, se recomienda como primera opción la recogida directa en el taller. Los gastos de envío se cobran aparte."
  },
  {
    id: 4,
    question: "¿Se admiten devoluciones?",
    answer: "No se aceptan devoluciones. En el caso de que la pieza sufra una rotura producida por el envío y pueda ser demostrado, el cliente deberá proceder a la devolución de la pieza para que la empresa pueda reenviar una nueva copia al usuario sin coste adicional."
  }
];

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Imagen de fondo desde Supabase Storage
  // Archivo: F001_F003.jpg en la carpeta faqs
  const faqBackground = "https://vnefocljtdvkabfxwoqg.supabase.co/storage/v1/object/public/product-images/faqs/F001_F003.jpg";

  return (
    <div 
      className="flex min-h-screen flex-col text-white pt-16 sm:pt-20"
      style={{
        backgroundImage: faqBackground 
          ? `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${faqBackground})` 
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "#000000"
      }}
    >
      <div className="flex-1">
        {/* Header Section con introducción */}
        <section className="relative py-8 sm:py-12 md:py-16 overflow-hidden">
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
            <div className="text-center mb-6 sm:mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Preguntas Frecuentes</p>
              <h1 className="font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-6xl mb-4 sm:mb-6">
                FAQ's
              </h1>
              <p className="text-sm leading-relaxed text-white/80 sm:text-base md:text-lg max-w-2xl mx-auto">
                Encuentra respuestas a las preguntas más comunes sobre nuestros productos, procesos de pedido y envíos. Si no encuentras lo que buscas, no dudes en contactarnos.
              </p>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="relative py-2 sm:py-4 md:py-6">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
            <div className="space-y-4 sm:space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:border-white/30"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 sm:px-8 sm:py-6 text-left flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium uppercase tracking-[0.1em] text-white pr-4 sm:text-base sm:tracking-[0.15em] group-hover:text-accent transition-colors">
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-white/70 transition-transform duration-300 flex-shrink-0 ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 pb-5 sm:px-8 sm:pb-6 pt-0">
                      <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section className="relative py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10 text-center">
            <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] mb-4">
              ¿Tienes más preguntas?
            </h2>
            <p className="text-sm text-white/70 sm:text-base mb-6 sm:mb-8">
              Si no encuentras la respuesta que buscas, no dudes en contactarnos
            </p>
            <Link
              to="/contact"
              className="inline-block rounded-sm bg-white px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 hover:shadow-lg sm:px-8 sm:py-3 sm:text-sm sm:tracking-[0.2em]"
            >
              Contactar
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
