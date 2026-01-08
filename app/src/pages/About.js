import { useProducts } from "../hooks/useProducts";
import Footer from "../components/Footer";
import Timeline from "../components/Timeline";

export default function About() {
  // Obtener algunos productos para mostrar imágenes
  const { products } = useProducts();
  const sampleProducts = products.slice(0, 3);
  
  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      <div className="flex-1">
        {/* Header Section */}
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-6 sm:px-8 md:px-10">
            <div className="text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-accent sm:text-sm">Sobre Nosotros</p>
              <h1 className="font-display text-3xl uppercase tracking-[0.15em] text-white sm:text-4xl sm:tracking-[0.2em] md:text-5xl lg:text-6xl">
                About Us
              </h1>
            </div>
          </div>
        </section>

        {/* Taller de vaciados Section */}
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-10">
            <div className="grid md:grid-cols-2 gap-10 sm:gap-14 items-center">
              {/* Contenido texto */}
              <div>
                <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl mb-8">
                  Taller de vaciados
                </h2>
                <div className="space-y-6">
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    The Spanish Gipsoteca dispone de una amplia colección de reproducciones escultóricas en escayola para su venta y difusión.
                  </p>
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Nuestro taller de vaciados elabora cada pieza de forma artesanal mediante técnicas tradicionales de reproducción escultórica combinadas con materiales y procesos modernos que permiten optimizar las propiedades técnicas de nuestros productos.
                  </p>
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
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

        {/* Transformación de espacios Section */}
        <section className="bg-black/60 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-10">
            <div className="grid md:grid-cols-2 gap-10 sm:gap-14 items-center">
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
                <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl mb-8">
                  Transformación de espacios
                </h2>
                <div className="space-y-6">
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Además de la colección de vaciados, The Spanish Gipsoteca dispone de una amplia variedad de piezas arquitectónicas de carácter ornamental: molduras, rosetones, columnas, pilastras y otros elementos decorativos que han moldeado el criterio estético del diseño de interiores durante siglos.
                  </p>
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Nuestro propósito es ofrecer la posibilidad de incorporar este legado a cualquier hogar o comercio que quiera dotar a sus espacios de un carácter clásico y distinguido.
                  </p>
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Las piezas de yesería de la colección abarcan algunos de los estilos más representativos de la tradición ornamental: desde las formas más exuberantes y dinámicas propias del gusto barroco, pasando por la elegancia equilibrada del neoclasicismo, a las orgánicas y vibrantes líneas del Modernismo o la riqueza decorativa del arte árabe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Servicios especializados Section */}
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-10">
            <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl mb-10 sm:mb-12">
              Servicios especializados
            </h2>
            
            {/* Tarjetas de servicios */}
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 mb-10 sm:mb-12">
              <div className="border border-white/10 bg-black/50 p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-5">Moldes y Reproducciones</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base text-left">
                  Realizamos moldes y reproducciones en una amplia variedad de materiales – resinas, yesos, bronce, entre otros - garantizando fidelidad y durabilidad.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-5">Escaneo e Impresión 3D</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base text-left">
                  Digitalizamos piezas, generamos prototipos y producimos réplicas exactas que optimizan tiempos y resultados.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-5">Estructuras y Soporte</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base text-left">
                  Diseñamos y construimos estructuras internas adaptadas a las necesidades de cada obra, asegurando estabilidad y seguridad.
                </p>
              </div>
              <div className="border border-white/10 bg-black/50 p-6 sm:p-8 hover:border-white/20 transition-all">
                <h3 className="font-display text-lg uppercase tracking-[0.1em] text-white mb-5">Restauración y Conservación</h3>
                <p className="text-sm leading-relaxed text-white/80 sm:text-base text-left">
                  Aplicamos criterios profesionales para recuperar el aspecto original de esculturas dañadas o deterioradas.
                </p>
              </div>
            </div>

            <div className="border border-white/10 bg-black/50 p-6 sm:p-8 md:p-10">
              <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-center italic">
                Nuestra filosofía se basa en el acompañamiento cercano: escuchamos cada idea, asesoramos en materiales y procesos, y trabajamos de forma colaborativa para convertir cada proyecto en una realidad única.
              </p>
            </div>
          </div>
        </section>

        {/* About Me Section */}
        <section className="bg-black/60 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 md:px-10">
            <div className="grid md:grid-cols-2 gap-10 sm:gap-14 items-start">
              {/* Columna izquierda - Texto e info */}
              <div>
                <h2 className="font-display text-2xl uppercase tracking-[0.15em] text-white sm:text-3xl sm:tracking-[0.2em] md:text-4xl mb-8">
                  About Me
                </h2>
                <div className="space-y-6 mb-12">
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Javier De Mendoza es un escultor situado en Barcelona. Cuenta con más de diez años de experiencia en el mundo de la escultura y la producción de moldes.
                  </p>
                  <p className="text-sm leading-relaxed text-white/85 sm:text-base md:text-lg text-left">
                    Actualmente se dedica a la fabricación de moldes para proyectos escultóricos y lleva la dirección de The Spanish Gipsoteca.
                  </p>
                </div>

                {/* Timeline de Formación */}
                <div className="mt-10">
                  <Timeline 
                    title="Formación y Trayectoria"
                    items={[
                      {
                        date: '2010 — 2014',
                        title: 'Barcelona Academy of Art',
                        location: 'Barcelona, España',
                        description: 'Formación en escultura clásica y técnicas de modelado tradicional.',
                        icon: 'education',
                      },
                      {
                        date: '2014 — 2016',
                        title: 'Rome University of Fine Arts',
                        location: 'Roma, Italia',
                        description: 'Especialización en restauración y reproducción de esculturas clásicas.',
                        icon: 'education',
                      },
                      {
                        date: '2016 — 2018',
                        title: 'Universidad de Barcelona',
                        location: 'Facultad de Bellas Artes',
                        description: 'Estudios avanzados en técnicas de vaciado y moldes.',
                        icon: 'education',
                      },
                      {
                        date: '2018 — Presente',
                        title: 'The Spanish Gipsoteca',
                        location: 'Barcelona, España',
                        description: 'Fundador y Director. Creación y venta de reproducciones escultóricas de alta calidad.',
                        icon: 'work',
                        current: true,
                      },
                    ]}
                  />
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
                    <div className="absolute bottom-6 left-6 right-6">
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
