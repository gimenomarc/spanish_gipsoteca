import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-20 sm:pt-24">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:px-10">
        <Link
          to="/"
          className="mb-8 inline-block text-sm text-white/70 transition hover:text-white"
        >
          ← Volver al inicio
        </Link>
        
        <h1 className="mb-8 font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl">
          Política de Privacidad
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-white/80">
          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              1. Información que Recopilamos
            </h2>
            <p>
              Recopilamos información que usted nos proporciona directamente, como cuando realiza una compra, se registra en nuestro sitio, o se pone en contacto con nosotros. Esta información puede incluir nombre, dirección de correo electrónico, dirección postal y número de teléfono.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              2. Uso de la Información
            </h2>
            <p>
              Utilizamos la información recopilada para procesar sus pedidos, comunicarnos con usted, mejorar nuestros servicios y personalizar su experiencia en nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              3. Protección de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              4. Compartir Información
            </h2>
            <p>
              No vendemos, alquilamos ni compartimos su información personal con terceros, excepto cuando sea necesario para procesar su pedido o cuando la ley lo requiera.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              5. Sus Derechos
            </h2>
            <p>
              Usted tiene derecho a acceder, rectificar, eliminar o oponerse al tratamiento de sus datos personales. Para ejercer estos derechos, puede contactarnos a través de nuestra página de contacto.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies para mejorar su experiencia en nuestro sitio web. Para más información sobre cómo utilizamos las cookies, consulte nuestra Política de Cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              7. Cambios en esta Política
            </h2>
            <p>
              Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos cualquier cambio publicando la nueva política en esta página.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              8. Contacto
            </h2>
            <p>
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de nuestra página de contacto.
            </p>
          </section>
        </div>

        <div className="mt-12 text-xs text-white/50">
          <p>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
