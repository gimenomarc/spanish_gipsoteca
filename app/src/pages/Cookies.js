import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Cookies() {
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
          Política de Cookies
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-white/80">
          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              1. ¿Qué son las Cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos ayudan a proporcionar, proteger y mejorar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              2. Tipos de Cookies que Utilizamos
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium text-white">Cookies Esenciales</h3>
                <p>
                  Estas cookies son necesarias para el funcionamiento del sitio web y no se pueden desactivar. Incluyen cookies de sesión y seguridad.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-white">Cookies de Funcionalidad</h3>
                <p>
                  Estas cookies permiten que el sitio web recuerde las elecciones que hace (como su idioma preferido) y proporcionan características mejoradas y más personales.
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-white">Cookies de Análisis</h3>
                <p>
                  Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web recopilando información de forma anónima.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              3. Cookies de Terceros
            </h2>
            <p>
              Algunas cookies son establecidas por servicios que aparecen en nuestras páginas. No controlamos estas cookies y le recomendamos que consulte las políticas de privacidad de estos servicios.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              4. Gestión de Cookies
            </h2>
            <p>
              Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su dispositivo y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              5. Más Información
            </h2>
            <p>
              Para obtener más información sobre cómo gestionar las cookies en diferentes navegadores, puede visitar los sitios web de ayuda de su navegador específico.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              6. Contacto
            </h2>
            <p>
              Si tiene preguntas sobre nuestra política de cookies, puede contactarnos a través de nuestra página de contacto.
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
