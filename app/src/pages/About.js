import { useProducts } from "../hooks/useProducts";
import Footer from "../components/Footer";

export default function About() {
  // Obtener algunos productos para mostrar imágenes
  const { products } = useProducts();
  const sampleProducts = products.slice(0, 3);
  
  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
        {/* Header Section */}
        <section className="bg-black py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-10">
            <div className="text-center mb-6 sm:mb-8">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Sobre Nosotros</p>
              <h1 className="font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-6xl mb-4 sm:mb-6">
                About Us
              </h1>
              <p className="text-lg leading-relaxed text-white/90 sm:text-xl md:text-2xl max-w-3xl mx-auto">
                THE SPANISH GIPSOTECA, UN TALLER DE VACIADOS DE ESCULTURA CLÁSICA DE LAS GRANDES OBRAS MAESTRAS DE TODOS LOS TIEMPOS
              </p>
            </div>
          </div>
        </section>

        {/* Taller de vaciados Section - Rediseñada sin tarjeta, más visual */}
        <section className="bg-black py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Contenido texto */}
              <div>
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                    Taller de vaciados
                  </h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    The Spanish Gipsoteca dispone de una amplia colección de reproducciones escultóricas en escayola para su venta y difusión.
                  </p>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Nuestro taller de vaciados elabora cada pieza de forma artesanal mediante técnicas tradicionales de reproducción escultórica combinadas con materiales y procesos modernos que permiten optimizar las propiedades técnicas de nuestros productos.
                  </p>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Trabajamos para ofrecer reproducciones escultóricas de máxima calidad, respetando fielmente los detalles de las obras originales y cumpliendo con las exigencias necesarias para su uso artístico y académico. El resultado son una selecta colección de vaciados de escayola de gran durabilidad y presencia, idóneas para su estudio en academias de arte o para inspirar a artistas y embellecer los hogares.
                  </p>
                </div>
              </div>
              {/* Imagen de producto */}
              {sampleProducts[0] && sampleProducts[0].images && sampleProducts[0].images[0] && (
                <div className="relative aspect-[3/4] overflow-hidden bg-black/50">
                  <img 
                    src={sampleProducts[0].images[0]} 
                    alt="Taller de vaciados"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Transformación de espacios Section - Sin línea divisoria */}
        <section className="bg-black/60 py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Imagen de producto */}
              {sampleProducts[1] && sampleProducts[1].images && sampleProducts[1].images[0] && (
                <div className="relative aspect-[3/4] overflow-hidden bg-black/50 order-2 md:order-1">
                  <img 
                    src={sampleProducts[1].images[0]} 
                    alt="Transformación de espacios"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-transparent"></div>
                </div>
              )}
              {/* Contenido texto */}
              <div className="order-1 md:order-2">
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                    Transformación de espacios
                  </h2>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Además de la colección de vaciados, The Spanish Gipsoteca dispone de una amplia variedad de piezas arquitectónicas de carácter ornamental: molduras, rosetones, columnas, pilastras y otros elementos decorativos que han moldeado el criterio estético del diseño de interiores durante siglos.
                  </p>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Nuestro propósito es ofrecer la posibilidad de incorporar este legado a cualquier hogar o comercio que quiera dotar a sus espacios de un carácter clásico y distinguido.
                  </p>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Las piezas de yesería de la colección abarcan algunos de los estilos más representativos de la tradición ornamental: desde las formas más exuberantes y dinámicas propias del gusto barroco, pasando por la elegancia equilibrada del neoclasicismo, a las orgánicas y vibrantes líneas del Modernismo o la riqueza decorativa del arte árabe. Esta variedad estilística cobra vida en nuestras reproducciones, diseñadas para integrarse armoniosamente en proyectos de decoración, restauración e interiorismo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios especializados Section - Rediseñada con tarjetas de servicios */}
        <section className="bg-black py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
            <div className="mb-8 sm:mb-12">
              <div className="mb-6 sm:mb-8">
                <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                  Servicios especializados en proyectos escultóricos
                </h2>
              </div>
            </div>
            
            {/* Tarjetas de servicios */}
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 mb-8 sm:mb-12">
              <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-4 sm:mb-6">Moldes y Reproducciones</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Realizamos moldes y reproducciones en una amplia variedad de materiales – resinas, yesos, bronce, entre otros - garantizando fidelidad y durabilidad.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-4 sm:mb-6">Escaneo e Impresión 3D</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Digitalizamos piezas, generamos prototipos y producimos réplicas exactas que optimizan tiempos y resultados.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-4 sm:mb-6">Estructuras y Soporte</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Diseñamos y construimos estructuras internas (armaduras y soportes) adaptadas a las necesidades de cada obra, asegurando estabilidad y seguridad.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-4 sm:mb-6">Restauración y Conservación</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base">
                  Aplicamos criterios profesionales para recuperar el aspecto original de esculturas dañadas o deterioradas.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-black/50 backdrop-blur-sm p-6 sm:p-8 md:p-10">
              <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg text-center italic">
                Nuestra filosofía se basa en el acompañamiento cercano: escuchamos cada idea, asesoramos en materiales y procesos, y trabajamos de forma colaborativa para convertir cada proyecto en una realidad y en una pieza única.
              </p>
            </div>
          </div>
        </section>

        {/* About Me Section - Rediseñada de forma creativa */}
        <section className="bg-black/60 py-8 sm:py-12 md:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start">
              {/* Columna izquierda - Texto e info */}
              <div>
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl">
                    About Me
                  </h2>
                </div>
                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Javier De Mendoza es un escultor situado en Barcelona. Cuenta con más de diez años de experiencia en el mundo de la escultura y la producción de moldes.
                  </p>
                  <p className="text-sm leading-relaxed text-white/90 sm:text-base md:text-lg">
                    Actualmente se dedica a la fabricación de moldes para proyectos escultóricos y lleva la dirección de The Spanish Gipsoteca.
                  </p>
                </div>

                {/* Formación con banderas y flechas */}
                <div className="mt-8 sm:mt-12">
                  <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white/70 mb-6 sm:mb-8">Formación Artística</h3>
                  <div className="space-y-6 sm:space-y-8">
                    {/* Barcelona Academy of Art */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-8 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        ES
                      </div>
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.1em] text-accent mb-1">Barcelona Academy of Art</p>
                        <p className="text-xs text-white/70">Barcelona, España</p>
                      </div>
                      <svg className="w-6 h-6 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Rome University of Fine Arts */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-8 bg-gradient-to-r from-green-500 via-white to-red-500 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <span className="relative z-10">IT</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.1em] text-accent mb-1">Rome University of Fine Arts</p>
                        <p className="text-xs text-white/70">Roma, Italia</p>
                      </div>
                      <svg className="w-6 h-6 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Universidad de Barcelona */}
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-8 bg-gradient-to-r from-yellow-400 via-red-500 to-red-600 rounded-sm flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        ES
                      </div>
                      <div className="flex-1">
                        <p className="text-sm uppercase tracking-[0.1em] text-accent mb-1">Universidad de Barcelona</p>
                        <p className="text-xs text-white/70">Facultad de Bellas Artes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imagen de producto */}
              {sampleProducts[2] && sampleProducts[2].images && sampleProducts[2].images[0] && (
                <div className="relative">
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/50">
                    <img 
                      src={sampleProducts[2].images[0]} 
                      alt="Javier De Mendoza"
                      className="w-full h-full object-cover opacity-70"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/80">+10 años</p>
                      <p className="text-sm text-white/60">de experiencia</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
