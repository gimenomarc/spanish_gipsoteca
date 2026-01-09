import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProduct, useRelatedProducts } from "../hooks/useProducts";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import OptimizedImage from "../components/OptimizedImage";
import ImageZoom from "../components/ImageZoom";

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

// Función para obtener todas las imágenes de un producto desde Supabase
function getProductImages(product) {
  // Si el producto tiene imágenes de Supabase Storage, usarlas
  if (product && product.images && product.images.length > 0) {
    return product.images;
  }
  
  // Fallback: si no hay imágenes en Supabase, retornar array vacío
  return [];
}

export default function ProductDetail() {
  const { categoryId, productCode } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(categoryId, productCode);
  const { relatedProducts, loading: loadingRelated } = useRelatedProducts(categoryId, productCode, 4);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  // Layout por defecto: option-iii (thumbnails izquierda, imagen centro, info derecha)
  const [layout, setLayout] = useState("option-iii"); // option-ii, option-iii, option-iv

  useEffect(() => {
    if (!loading && !product) {
      navigate("/shop");
    }
  }, [product, loading, navigate]);

  // Obtener imágenes del producto desde Supabase (antes de los returns)
  const productImages = product ? getProductImages(product) : [];
  const mainImage = productImages[selectedImage] || productImages[0] || '';

  // Preload optimizado: solo la imagen principal y la siguiente
  // OptimizedImage ya maneja el preload con priority, así que solo preloadamos la siguiente
  useEffect(() => {
    if (!productImages || productImages.length === 0) return;

    // Preload de la siguiente imagen con prioridad baja (para navegación rápida)
    // Reducido a solo 1 imagen siguiente para evitar sobrecarga
    const nextImage = productImages[selectedImage + 1];
    if (nextImage) {
      const img = new Image();
      img.src = nextImage;
      img.fetchPriority = 'low';
    }
  }, [productImages, selectedImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white pt-20 flex items-center justify-center">
        <p className="text-white/70">Cargando producto...</p>
      </div>
    );
  }

  if (!product || error) {
    return null;
  }

  // Todas las imágenes para mostrar como thumbnails
  const allImages = productImages;
  
  // Función para intercambiar imagen al hacer clic en thumbnail
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  // Descripción extendida
  const extendedDescription = product.description || 
    "This piece is probably one of the most iconic sculptures of all times. Sign of beauty and perfection, this sculpture was made by an unknown artist around 130-100 a.e.c. in Greece. After centuries of disappearance, it was found by a french archeologist, who later sold the sculpture to the french monarchy under the power of Luis XIV. This sculpture has been one of the most used casts in classic academies and it's still an essential figure for nowadays art academies.";

  return (
    <div className="flex min-h-screen flex-col bg-black text-white pt-16 sm:pt-20">
      {/* Header simplificado para la página de producto */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-black/50 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 md:px-10">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-white transition-colors hover:text-accent sm:text-base flex-shrink-0"
        >
          ← Volver
        </button>
        <h1 className="font-display text-xs uppercase tracking-[0.2em] text-white sm:text-sm sm:tracking-[0.3em] md:text-base md:tracking-[0.35em] lg:text-lg flex-shrink min-w-0 px-2 text-center">
          <span className="hidden sm:inline">THE SPANISH GIPSOTECA</span>
          <span className="sm:hidden">TSG</span>
        </h1>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <button className="text-white transition-colors hover:text-accent">
            <SearchIcon />
          </button>
          <button className="text-white transition-colors hover:text-accent">
            <BagIcon />
          </button>
        </div>
      </div>

      <div className="flex-1">
      {/* Layout Principal - Imagen grande + thumbnails pequeñas al lado */}
      <section className="bg-black py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            {/* Columna izquierda - Imágenes */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Thumbnails pequeñas - Vertical en desktop, horizontal en móvil */}
              {allImages.length > 1 && (
                <div className="flex lg:flex-col gap-2 lg:gap-3 order-2 lg:order-1">
                  {allImages.map((img, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 aspect-[3/4] w-16 h-20 lg:w-20 lg:h-28 cursor-pointer overflow-hidden bg-black border-2 transition-all ${
                        selectedImage === index
                          ? 'border-white scale-105'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      onClick={() => handleThumbnailClick(index)}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                        priority={false}
                        aspectRatio="3/4"
                        size="galleryThumb"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Imagen principal grande con zoom */}
              <div className="flex-1 order-1 lg:order-2">
                <div className="aspect-[3/4] bg-black">
                  <ImageZoom
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full"
                    zoomScale={2.5}
                    zoomSize={350}
                  />
                </div>
              </div>
            </div>

            {/* Columna derecha - Información del producto */}
            <div className="lg:col-span-1">
                <h2 className="mb-2 font-display text-xl uppercase tracking-[0.1em] text-white sm:text-2xl sm:tracking-[0.15em] md:text-3xl lg:text-4xl">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-3 text-xs uppercase tracking-[0.15em] text-white/70 sm:mb-4 sm:text-sm sm:tracking-[0.2em]">
                  {product.artist}
                </p>
                <p className="mb-4 text-xl font-medium text-white sm:mb-6 sm:text-2xl">{product.price}</p>
                <p className="mb-4 text-xs leading-relaxed text-white/80 sm:mb-6 sm:text-sm">
                  {extendedDescription}
                </p>
                <div className="mb-4 space-y-1.5 text-xs text-white/70 sm:mb-6 sm:space-y-2 sm:text-sm">
                  <p>{product.dimensions}</p>
                  <p>Code: {product.code}</p>
                </div>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center border border-white/20 w-full sm:w-auto">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-white transition hover:bg-white/10 sm:px-3"
                    >
                      −
                    </button>
                    <span className="flex-1 px-4 py-2 text-center text-white sm:flex-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-white transition hover:bg-white/10 sm:px-3"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (product) {
                        console.log('Añadiendo al carrito:', product, 'Cantidad:', quantity);
                        console.log('Product categoryId:', product.categoryId);
                        console.log('Product code:', product.code);
                        
                        // Animación del botón
                        setIsAddingToCart(true);
                        setTimeout(() => setIsAddingToCart(false), 600);
                        
                        // Notificación
                        setShowAddedNotification(true);
                        setTimeout(() => setShowAddedNotification(false), 3000);
                        
                        addToCart(product, quantity);
                        console.log('Producto añadido al carrito');
                      } else {
                        console.error('Producto no disponible');
                      }
                    }}
                    className={`w-full rounded-sm bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-black transition-all hover:bg-white/90 sm:w-auto sm:flex-1 sm:px-6 sm:py-2 sm:text-sm sm:tracking-[0.15em] ${
                      isAddingToCart ? 'animate-pulse scale-95' : ''
                    }`}
                  >
                    {isAddingToCart ? 'Añadiendo...' : 'Add to cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Layouts antiguos (ocultos por defecto) */}
      {false && layout === "option-ii" && (
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
              {/* Info izquierda */}
              <div className="lg:col-span-1">
                <h2 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  {product.artist}
                </p>
                <p className="mb-6 text-sm leading-relaxed text-white/80">
                  {extendedDescription} +
                </p>
                <div className="mb-6 space-y-2 text-sm text-white/70">
                  <p>{product.dimensions}</p>
                  <p>Code: {product.code}</p>
                  <p className="text-xl font-medium text-white">{product.price}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (product) {
                      console.log('Añadiendo al carrito (layout option-ii):', product, 'Cantidad:', quantity);
                      setIsAddingToCart(true);
                      setTimeout(() => setIsAddingToCart(false), 600);
                      setShowAddedNotification(true);
                      setTimeout(() => setShowAddedNotification(false), 3000);
                      addToCart(product, quantity);
                    }
                  }}
                  className={`rounded-sm bg-white px-6 py-2 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 ${
                    isAddingToCart ? 'animate-pulse scale-95' : ''
                  }`}
                >
                  {isAddingToCart ? 'Añadiendo...' : 'Add to cart'}
                </button>
              </div>

              {/* Imagen principal centro */}
              <div className="lg:col-span-1">
                <div className="aspect-[3/4]">
                  <OptimizedImage
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full"
                    priority={true}
                    aspectRatio="3/4"
                    size="detail"
                  />
                </div>
              </div>

              {/* Thumbnails derecha */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                {allImages.filter((_, idx) => idx !== selectedImage).map((img, idx) => {
                  const originalIdx = allImages.findIndex((_, i) => i !== selectedImage && i === idx + (idx >= selectedImage ? 1 : 0));
                  return originalIdx >= 0 ? (
                  <div
                    key={originalIdx}
                    className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-black group"
                    onClick={() => setSelectedImage(originalIdx)}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${product.name} ${originalIdx + 1}`}
                      className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                      priority={false}
                      aspectRatio="3/4"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                      <SearchIcon className="text-white" />
                    </div>
                  </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Layout Option IV - Info izquierda, galería derecha con navegación */}
      {false && layout === "option-iv" && (
        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Info izquierda */}
              <div>
                <h2 className="mb-2 font-display text-3xl uppercase tracking-[0.15em] text-white">
                  {product.name.toUpperCase()}
                </h2>
                <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">
                  {product.artist}
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
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (product) {
                        console.log('Añadiendo al carrito (layout option-iv):', product, 'Cantidad:', quantity);
                        setIsAddingToCart(true);
                        setTimeout(() => setIsAddingToCart(false), 600);
                        setShowAddedNotification(true);
                        setTimeout(() => setShowAddedNotification(false), 3000);
                        addToCart(product, quantity);
                      }
                    }}
                    className={`flex-1 rounded-sm bg-white px-6 py-2 text-sm font-medium uppercase tracking-[0.15em] text-black transition-all hover:bg-white/90 ${
                      isAddingToCart ? 'animate-pulse scale-95' : ''
                    }`}
                  >
                    {isAddingToCart ? 'Añadiendo...' : 'Add to cart'}
                  </button>
                </div>
              </div>

              {/* Galería derecha */}
              <div className="relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <OptimizedImage
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full"
                    priority={true}
                    aspectRatio="3/4"
                    size="detail"
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
                  {allImages.filter((_, idx) => idx !== selectedImage).map((img, idx) => {
                    const originalIdx = allImages.findIndex((_, i) => i !== selectedImage && i === idx + (idx >= selectedImage ? 1 : 0));
                    return originalIdx >= 0 ? (
                    <div
                      key={originalIdx}
                      className="aspect-[3/4] w-24 cursor-pointer overflow-hidden bg-black"
                      onClick={() => setSelectedImage(originalIdx)}
                    >
                      <OptimizedImage
                        src={img}
                        alt={`${product.name} ${originalIdx + 1}`}
                        className="h-full w-full"
                        priority={false}
                        aspectRatio="3/4"
                        size="galleryThumb"
                      />
                    </div>
                    ) : null;
                  })}
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
      </div>
      
      {/* Sección de Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-white/10 bg-black py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
            <div className="mb-8 sm:mb-10 flex items-center justify-between">
              <h3 className="font-display text-lg uppercase tracking-[0.15em] text-white sm:text-xl sm:tracking-[0.2em] md:text-2xl">
                También te puede interesar
              </h3>
              <Link 
                to="/shop" 
                className="text-xs uppercase tracking-[0.15em] text-white/50 transition-colors hover:text-white sm:text-sm"
              >
                Ver todo →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <Link
                  key={relatedProduct.code}
                  to={`/shop/${relatedProduct.categoryId}/${relatedProduct.code}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-black/50 mb-3 sm:mb-4">
                    <OptimizedImage
                      src={relatedProduct.images[0] || ''}
                      alt={relatedProduct.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 2}
                      aspectRatio="3/4"
                      size="card"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
                  </div>
                  <h4 className="text-xs uppercase tracking-[0.1em] text-white/80 transition-colors group-hover:text-white sm:text-sm sm:tracking-[0.15em]">
                    {relatedProduct.name}
                  </h4>
                  <p className="mt-1 text-xs text-white/50 sm:text-sm">
                    {relatedProduct.price}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Notificación de producto añadido */}
      {showAddedNotification && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform animate-in fade-in slide-in-from-bottom-4">
          <div className="rounded-sm border border-white/20 bg-black/95 px-6 py-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-medium text-white">
                Producto añadido al carrito
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

