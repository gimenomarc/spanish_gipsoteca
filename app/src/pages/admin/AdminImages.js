import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminImages() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          code,
          name,
          images,
          category_id,
          categories (name)
        `)
        .order('code');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para sanitizar nombres de archivo (mantener nombre original pero seguro)
  const sanitizeFileName = (fileName) => {
    // Mantener el nombre original pero eliminar caracteres peligrosos
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales con _
      .replace(/_{2,}/g, '_') // Eliminar múltiples _ consecutivos
      .replace(/^_+|_+$/g, ''); // Eliminar _ al inicio y final
  };

  const handleFileUpload = async (e) => {
    if (!selectedProduct) return;
    
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const newImages = [...(selectedProduct.images || [])];
      const primaryImages = []; // Imágenes que deben ir al principio
      const regularImages = []; // Imágenes normales

      for (const file of files) {
        // Mantener el nombre original del archivo (sanitizado)
        const originalName = file.name;
        const ext = originalName.split('.').pop();
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const sanitizedName = sanitizeFileName(nameWithoutExt);
        const fileName = `${sanitizedName}.${ext}`;
        const path = `${selectedProduct.category_id}/${selectedProduct.code}/${fileName}`;

        // Verificar si debe ser principal: tiene "DEF" en el nombre O está marcado como principal
        const shouldBePrimary = isPrimary || nameWithoutExt.toUpperCase().includes('DEF');

        // Subir a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          // Si el archivo ya existe, intentar con un sufijo único
          const timestamp = Date.now();
          const uniqueFileName = `${sanitizedName}_${timestamp}.${ext}`;
          const uniquePath = `${selectedProduct.category_id}/${selectedProduct.code}/${uniqueFileName}`;
          
          const { error: retryError } = await supabase.storage
            .from('product-images')
            .upload(uniquePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryError) throw retryError;

          // Obtener URL pública con el nombre único
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(uniquePath);

          if (shouldBePrimary) {
            primaryImages.push(publicUrl);
          } else {
            regularImages.push(publicUrl);
          }
        } else {
          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(path);

          if (shouldBePrimary) {
            primaryImages.push(publicUrl);
          } else {
            regularImages.push(publicUrl);
          }
        }
      }

      // Combinar: primero las principales, luego las regulares, luego las existentes
      const finalImages = [...primaryImages, ...regularImages, ...newImages];

      // Actualizar producto con nuevas imágenes
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: finalImages })
        .eq('code', selectedProduct.code);

      if (updateError) throw updateError;

      // Actualizar estado local
      setSelectedProduct({ ...selectedProduct, images: finalImages });
      setProducts(products.map(p => 
        p.code === selectedProduct.code 
          ? { ...p, images: finalImages }
          : p
      ));

      // Resetear checkbox de principal
      setIsPrimary(false);

      alert('Imágenes subidas correctamente');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir las imágenes: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl, index) => {
    if (!selectedProduct) return;
    if (!window.confirm('¿Eliminar esta imagen?')) return;

    try {
      // Extraer path del URL
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const path = urlParts[1];
        
        // Eliminar de Storage
        await supabase.storage
          .from('product-images')
          .remove([path]);
      }

      // Actualizar array de imágenes
      const newImages = selectedProduct.images.filter((_, i) => i !== index);

      // Actualizar en base de datos
      const { error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', selectedProduct.code);

      if (error) throw error;

      // Actualizar estado local
      setSelectedProduct({ ...selectedProduct, images: newImages });
      setProducts(products.map(p => 
        p.code === selectedProduct.code 
          ? { ...p, images: newImages }
          : p
      ));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const handleSetPrimary = async (index) => {
    if (!selectedProduct || index === 0) return;

    const newImages = [...selectedProduct.images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);

    try {
      const { error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', selectedProduct.code);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, images: newImages });
      setProducts(products.map(p => 
        p.code === selectedProduct.code 
          ? { ...p, images: newImages }
          : p
      ));
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Error al reordenar las imágenes');
    }
  };

  const filteredProducts = products.filter(p =>
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
          Gestión de Imágenes
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Selecciona un producto para gestionar sus imágenes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <div className="bg-black border border-white/10 p-6 max-h-[600px] overflow-hidden flex flex-col">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none mb-4"
          />
          
          <div className="overflow-y-auto flex-1 space-y-2">
            {filteredProducts.map((product) => (
              <button
                key={product.code}
                onClick={() => setSelectedProduct(product)}
                className={`w-full text-left p-3 transition-colors flex items-center gap-3 ${
                  selectedProduct?.code === product.code
                    ? 'bg-white/10 border-l-2 border-white'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 bg-white/10 overflow-hidden flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{product.name || product.code}</p>
                  <p className="text-xs text-white/50">
                    {product.code} • {product.images?.length || 0} imgs
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Manager */}
        <div className="bg-black border border-white/10 p-6">
          {selectedProduct ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg text-white">{selectedProduct.name}</h2>
                  <p className="text-xs text-white/50">{selectedProduct.code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-2 text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      disabled={uploading}
                      className="w-4 h-4"
                    />
                    <span>Marcar como principal (DEF)</span>
                  </label>
                  <label className="bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.1em] hover:bg-white/90 transition-colors cursor-pointer">
                    {uploading ? 'Subiendo...' : '+ Subir Imágenes'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="space-y-3">
                  {selectedProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 border ${
                        idx === 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10'
                      }`}
                    >
                      <div className="w-16 h-16 bg-white/10 overflow-hidden flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate">{img.split('/').pop()}</p>
                        {idx === 0 && (
                          <span className="text-xs text-green-400">✓ Imagen principal</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {idx !== 0 && (
                          <button
                            onClick={() => handleSetPrimary(idx)}
                            className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
                            title="Hacer principal"
                          >
                            ★
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img, idx)}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/20">
                  <p className="text-white/50 text-sm">No hay imágenes</p>
                  <p className="text-white/30 text-xs mt-2">Sube imágenes para este producto</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 text-xs">
                <p className="text-blue-400 mb-2">
                  <strong>💡 Información:</strong>
                </p>
                <ul className="text-blue-300 space-y-1 ml-4 list-disc">
                  <li>El nombre del archivo se mantiene tal como lo subes</li>
                  <li>Marca "Marcar como principal" para que la imagen vaya al inicio</li>
                  <li>O incluye "DEF" en el nombre del archivo para que sea principal automáticamente</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/50">Selecciona un producto de la lista</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
