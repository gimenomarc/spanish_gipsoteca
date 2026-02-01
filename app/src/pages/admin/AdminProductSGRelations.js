import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminProductSGRelations() {
  const [products, setProducts] = useState([]);
  const [sgPhotos, setSgPhotos] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [relatedPhotoIds, setRelatedPhotoIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSGPhotos();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      fetchRelatedPhotos(selectedProduct);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name
          )
        `)
        .eq('published', true)
        .order('code');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSGPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const { data, error } = await supabase
        .from('sg_gallery_photos')
        .select(`
          id,
          title,
          image_url,
          sg_gallery_collections (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSgPhotos(data || []);
    } catch (error) {
      console.error('Error fetching SG photos:', error);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const fetchRelatedPhotos = async (productCode) => {
    try {
      const { data, error } = await supabase
        .from('sg_gallery_photo_products')
        .select('photo_id')
        .eq('product_code', productCode);

      if (error) throw error;
      setRelatedPhotoIds((data || []).map(item => item.photo_id));
    } catch (error) {
      console.error('Error fetching related photos:', error);
    }
  };

  const togglePhotoRelation = async (photoId) => {
    if (!selectedProduct) return;

    const isRelated = relatedPhotoIds.includes(photoId);
    
    try {
      if (isRelated) {
        // Eliminar relación
        const { error } = await supabase
          .from('sg_gallery_photo_products')
          .delete()
          .eq('product_code', selectedProduct)
          .eq('photo_id', photoId);

        if (error) throw error;
        setRelatedPhotoIds(prev => prev.filter(id => id !== photoId));
      } else {
        // Añadir relación
        const { error } = await supabase
          .from('sg_gallery_photo_products')
          .insert({
            product_code: selectedProduct,
            photo_id: photoId
          });

        if (error) throw error;
        setRelatedPhotoIds(prev => [...prev, photoId]);
      }
    } catch (error) {
      console.error('Error updating photo relation:', error);
      alert('Error al actualizar la relación: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  const selectedProductData = products.find(p => p.code === selectedProduct);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white mb-2">
          📷 Relaciones Productos - SG Gallery
        </h1>
        <p className="text-sm text-white/50">
          Vincula productos con fotos de SG Gallery para que aparezcan en la página del producto
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Productos */}
        <div className="lg:col-span-1">
          <div className="bg-black border border-white/10 p-4 mb-4">
            <h2 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-4">
              Selecciona un Producto
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.code}
                  onClick={() => setSelectedProduct(product.code)}
                  className={`w-full text-left p-3 border transition-colors ${
                    selectedProduct === product.code
                      ? 'border-accent bg-accent/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 overflow-hidden flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">
                          Sin img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-white/70">{product.code}</p>
                      <p className="text-sm text-white truncate">{product.name || '—'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fotos de SG Gallery */}
        <div className="lg:col-span-2">
          {!selectedProduct ? (
            <div className="bg-black border border-white/10 p-12 text-center">
              <p className="text-white/50 text-sm">
                Selecciona un producto de la lista para ver y gestionar sus fotos relacionadas
              </p>
            </div>
          ) : (
            <div className="bg-black border border-white/10 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-display uppercase tracking-[0.15em] text-white mb-2">
                  {selectedProductData?.name || selectedProduct}
                </h2>
                <p className="text-xs text-white/50 mb-4">
                  Haz clic en las fotos para relacionarlas con este producto. Las fotos relacionadas aparecerán en la página del producto.
                </p>
                {relatedPhotoIds.length > 0 && (
                  <p className="text-xs text-accent">
                    {relatedPhotoIds.length} foto{relatedPhotoIds.length !== 1 ? 's' : ''} relacionada{relatedPhotoIds.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {loadingPhotos ? (
                <p className="text-white/50 text-sm">Cargando fotos...</p>
              ) : sgPhotos.length === 0 ? (
                <p className="text-white/50 text-sm">No hay fotos en SG Gallery todavía.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {sgPhotos.map((photo) => {
                    const isRelated = relatedPhotoIds.includes(photo.id);
                    return (
                      <button
                        key={photo.id}
                        onClick={() => togglePhotoRelation(photo.id)}
                        className={`relative aspect-square overflow-hidden border-2 transition-all group ${
                          isRelated
                            ? 'border-accent ring-2 ring-accent/50'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.title || 'Foto'}
                          className="w-full h-full object-cover"
                        />
                        {isRelated && (
                          <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                            <span className="text-accent text-2xl">✓</span>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-white text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
                          {photo.title && (
                            <span className="block text-white/90 text-[10px] mb-1">
                              {photo.title}
                            </span>
                          )}
                          {photo.sg_gallery_collections && (
                            <span className="block text-white/60 text-[10px]">
                              {photo.sg_gallery_collections.name}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
