import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categories } from "../data/products";
import Footer from "../components/Footer";

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Función para obtener todas las imágenes de un producto
function getProductImages(categoryId, productFolder, productCode) {
  const basePath = `/images/categorias/${categoryId}/${productFolder}/`;
  
  // Lista extendida de posibles nombres de imágenes
  const possibleNames = [
    `${productCode}.jpg`,
    `${productCode}.png`,
    `DSC04562 (1).jpg`,
    `DSC04563.jpg`,
    `DSC04564.jpg`,
    `DSC04584.jpg`,
    `DSC04551.jpg`,
    `DSC04571.jpg`,
    `DSC04378 (1).jpg`,
    `DSC04622 (1).jpg`,
    `DSC04503.jpg`,
    `M004.jpg`,
    `DSC03549.jpg`,
    `DSC03561.jpg`,
    `DSC03892.jpg`,
    `M007.jpg`,
    `DSC03506.jpg`,
    `DSC03517.jpg`,
    `DSC03524.jpg`,
    `DSC03619.jpg`,
    `DSC04408.jpg`,
    `la buena.jpg`,
    `DSC03985.jpg`,
    `DSC04013.jpg`,
    `DSC04005.jpg`,
    `DSC03590.jpg`,
    `DSC04427.jpg`,
    `DSC04342.jpg`,
    `DSC03675.jpg`,
    `DSC03693.jpg`,
    `DSC04332.jpg`,
    `DSC04350.jpg`,
    `DSC03778 (1).jpg`,
    `DSC03702.jpg`,
    `DSC04114.jpg`,
    `M023.jpg`,
    `DSC04634 (1).jpg`,
    `DSC04701.jpg`,
    `DSC04206.jpg`,
    `DSC04220.jpg`,
    `DSC03824.jpg`,
    `DSC04234 (1).jpg`,
    `DSC04240.jpg`,
    `DSC02490.jpg`,
    `DSC04277.jpg`,
    `DSC04289.jpg`,
    `DSC04041.jpg`,
    `DSC03870.jpg`,
    `DSC03907.jpg`,
    `DSC03949.jpg`,
    `DSC03939 (1).jpg`,
    `DSC03839 (1) (1).jpg`,
    `DSC03969.jpg`,
    `DSC02686.jpg`,
    `DSC04587.jpg`,
    `DSC04849.jpg`,
  ];
  
  return possibleNames.map(name => `${basePath}${name}`).slice(0, 4);
}

export default function ProductDetail() {
  const { categoryId, productCode } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  // Layout por defecto: option-iii (thumbnails izquierda, imagen centro, info derecha)
  const [layout, setLayout] = useState("option-iii"); // option-ii, option-iii, option-iv

  // Buscar el producto
  const category = categories[categoryId];
  const product = category?.products.find((p) => p.code === productCode);

  useEffect(() => {
    if (!product) {
      navigate("/shop");
    }
  }, [product, navigate]);

  if (!product) {
    return null;
  }

  // Obtener imágenes del producto
  const productImages = getProductImages(categoryId, product.folder, product.code);
  const mainImage = productImages[selectedImage] || productImages[0];
  const thumbnails = productImages.slice(1);

  // Descripción extendida
  const extendedDescription = product.description || 
    "This piece is probably one of the most iconic sculptures of all times. Sign of beauty and perfection, this sculpture was made by an unknown artist around 130-100 a.e.c. in Greece. After centuries of disappearance, it was found by a french archeologist, who later sold the sculpture to the french monarchy under the power of Luis XIV. This sculpture has been one of the most used casts in classic academies and it's still an essential figure for nowadays art academies.";

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header simplificado para la página de producto */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-black/50 px-6 py-4 backdrop-blur-md md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="text-white transition-colors hover:text-accent"
        >
          ← Volver
        </button>
        <h1 className="font-display text-base uppercase tracking-[0.35em] text-white md:text-lg">
          THE SPANISH GIPSOTECA
        </h1>
        <div className="flex items-center gap-3">
          <button className="text-white transition-colors hover:text-accent">
            <SearchIcon />
          </button>
          <button className="text-white transition-colors hover:text-accent">
            <BagIcon />
          </button>
        </div>
      </div>

      {/* Layout Option III - Thumbnails izquierda, imagen centro, info derecha */}
      {layout === "option-iii" && (
        <section className="bg-black py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Thumbnails izquierda */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className="aspect-[3/4] overflow-hidden bg-black cursor-pointer group"
                    onClick={() => setSelectedImage(idx + 1)}
                  >
                    <img
                      src={thumb}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-xs text-white/50">Imagen no disponible</p></div></div>';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Imagen principal centro */}
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-xs text-white/50">Imagen no disponible</p></div></div>';
                    }}
                  />
                </div>
              </div>

              {/* Info derecha */}
              <div className="lg:col-span-1">
                <h2 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white md:text-4xl">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  {product.artist}, ca.130-100 a.e.c.
                </p>
                <p className="mb-6 text-2xl font-medium text-white">{product.price}</p>
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                  {extendedDescription}
                </p>
                <div className="mb-6 space-y-2 text-sm text-white/70">
                  <p>{product.dimensions}</p>
                  <p>Code: {product.code}</p>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex items-center border border-white/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-white transition hover:bg-white/10"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-white transition hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                  <button className="flex-1 rounded-sm bg-white px-6 py-2 text-sm font-medium uppercase tracking-[0.15em] text-black transition hover:bg-white/90">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Layout Option II - Info izquierda, imagen centro, thumbnails derecha */}
      {layout === "option-ii" && (
        <section className="bg-black py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Info izquierda */}
              <div className="lg:col-span-1">
                <h2 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  {product.artist}, ca.130-100 a.e.c.
                </p>
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                  {extendedDescription} +
                </p>
                <div className="mb-6 space-y-2 text-sm text-white/70">
                  <p>{product.dimensions}</p>
                  <p>Code: {product.code}</p>
                  <p className="text-xl font-medium text-white">{product.price}</p>
                </div>
                <button className="rounded-sm bg-white px-6 py-2 text-sm font-medium uppercase tracking-[0.15em] text-black transition hover:bg-white/90">
                  Add to cart
                </button>
              </div>

              {/* Imagen principal centro */}
              <div className="lg:col-span-1">
                <div className="aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-xs text-white/50">Imagen no disponible</p></div></div>';
                    }}
                  />
                </div>
              </div>

              {/* Thumbnails derecha */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {thumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-black group"
                    onClick={() => setSelectedImage(idx + 1)}
                  >
                    <img
                      src={thumb}
                      alt={`${product.name} ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-xs text-white/50">Imagen no disponible</p></div></div>';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <SearchIcon className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Layout Option IV - Info izquierda, galería derecha con navegación */}
      {layout === "option-iv" && (
        <section className="bg-black py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Info izquierda */}
              <div>
                <h2 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  {product.artist}, ca.130-100 a.e.c.
                </p>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  Code: {product.code}
                </p>
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                  {extendedDescription}
                </p>
                <div className="mb-6 space-y-2 text-sm text-white/70">
                  <p>{product.dimensions}</p>
                  <p className="text-xl font-medium text-white">{product.price}</p>
                </div>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex items-center border border-white/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-white transition hover:bg-white/10"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-white transition hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                  <button className="flex-1 rounded-sm bg-white px-6 py-2 text-sm font-medium uppercase tracking-[0.15em] text-black transition hover:bg-white/90">
                    Add to cart
                  </button>
                </div>
              </div>

              {/* Galería derecha */}
              <div className="relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-12 w-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><p class="mt-2 text-xs text-white/50">Imagen no disponible</p></div></div>';
                    }}
                  />
                  {/* Flechas de navegación */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length)}
                      className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <ArrowLeftIcon />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % productImages.length)}
                      className="rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
                    >
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
                {/* Thumbnails debajo */}
                <div className="mt-4 flex gap-4">
                  {thumbnails.map((thumb, idx) => (
                    <div
                      key={idx}
                      className="aspect-[3/4] w-24 cursor-pointer overflow-hidden bg-black"
                      onClick={() => setSelectedImage(idx + 1)}
                    >
                      <img
                        src={thumb}
                        alt={`${product.name} ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML = '<div class="flex h-full w-full items-center justify-center bg-black/80"><div class="text-center"><svg class="mx-auto h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div></div>';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Selector de layout (oculto por defecto, puedes activarlo para testing) */}
      {false && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setLayout("option-ii")}
            className="rounded bg-white/10 px-3 py-1 text-xs text-white"
          >
            Layout II
          </button>
          <button
            onClick={() => setLayout("option-iii")}
            className="rounded bg-white/10 px-3 py-1 text-xs text-white"
          >
            Layout III
          </button>
          <button
            onClick={() => setLayout("option-iv")}
            className="rounded bg-white/10 px-3 py-1 text-xs text-white"
          >
            Layout IV
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

