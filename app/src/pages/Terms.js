import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Terms() {
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
          Términos y Condiciones
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed text-white/80">
          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar el sitio web de The Spanish Gipsoteca, usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              2. Uso del Sitio Web
            </h2>
            <p>
              El contenido de este sitio web es solo para fines informativos y de compra. Usted se compromete a utilizar el sitio web de manera legal y de acuerdo con estos términos.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              3. Productos y Precios
            </h2>
            <p>
              Nos reservamos el derecho de modificar los precios y la disponibilidad de productos en cualquier momento. Las imágenes de los productos son solo ilustrativas y pueden no reflejar exactamente el producto final.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              4. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido de este sitio web, incluyendo textos, imágenes, logotipos y diseño, es propiedad de The Spanish Gipsoteca y está protegido por las leyes de propiedad intelectual.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              5. Limitación de Responsabilidad
            </h2>
            <p>
              The Spanish Gipsoteca no será responsable de ningún daño directo, indirecto, incidental o consecuente que resulte del uso o la imposibilidad de usar este sitio web.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              6. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-display text-xl uppercase tracking-[0.1em] text-white">
              7. Contacto
            </h2>
            <p>
              Si tiene alguna pregunta sobre estos términos y condiciones, puede contactarnos a través de nuestra página de contacto.
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
