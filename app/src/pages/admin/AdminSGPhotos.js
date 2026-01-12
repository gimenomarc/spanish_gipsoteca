import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdminSGPhotos } from '../../hooks/useSGGallery';
import { supabase } from '../../lib/supabase';

export default function AdminSGPhotos() {
  const { collectionId } = useParams();
  const { 
    photos, 
    loading, 
    error, 
    createPhoto, 
    updatePhoto, 
    deletePhoto 
  } = useAdminSGPhotos(collectionId);

  const [collection, setCollection] = useState(null);
  const [loadingCollection, setLoadingCollection] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  
  const [editingId, setEditingId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    context_info: '',
    image_url: '',
    display_order: 0,
    is_active: true,
    product_codes: []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Cargar información de la colección
  useEffect(() => {
    async function fetchCollection() {
      try {
        const { data, error } = await supabase
          .from('sg_gallery_collections')
          .select('*')
          .eq('id', collectionId)
          .single();

        if (error) throw error;
        setCollection(data);
      } catch (err) {
        console.error('Error cargando colección:', err);
      } finally {
        setLoadingCollection(false);
      }
    }

    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId]);

  // Cargar todos los productos para el selector
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('code, name, images')
          .order('name');

        if (error) throw error;
        setAllProducts(data || []);
      } catch (err) {
        console.error('Error cargando productos:', err);
      }
    }

    fetchProducts();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      context_info: '',
      image_url: '',
      display_order: photos.length,
      is_active: true,
      product_codes: []
    });
    setEditingId(null);
    setShowNewForm(false);
    setProductSearch('');
  };

  const handleEdit = (photo) => {
    setFormData({
      title: photo.title,
      description: photo.description || '',
      context_info: photo.context_info || '',
      image_url: photo.image_url || '',
      display_order: photo.display_order || 0,
      is_active: photo.is_active,
      product_codes: photo.product_codes || []
    });
    setEditingId(photo.id);
    setShowNewForm(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sg-gallery/photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddProduct = (code) => {
    if (!formData.product_codes.includes(code)) {
      setFormData(prev => ({
        ...prev,
        product_codes: [...prev.product_codes, code]
      }));
    }
    setProductSearch('');
  };

  const handleRemoveProduct = (code) => {
    setFormData(prev => ({
      ...prev,
      product_codes: prev.product_codes.filter(c => c !== code)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await updatePhoto(editingId, formData);
        if (error) throw new Error(error);
      } else {
        const { error } = await createPhoto(formData);
        if (error) throw new Error(error);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`¿Estás seguro de eliminar la foto "${title}"?`)) {
      return;
    }

    const { error } = await deletePhoto(id);
    if (error) {
      alert('Error al eliminar: ' + error);
    }
  };

  const handleToggleActive = async (photo) => {
    await updatePhoto(photo.id, { is_active: !photo.is_active });
  };

  // Filtrar productos para búsqueda
  const filteredProducts = productSearch
    ? allProducts.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(productSearch.toLowerCase())
      ).slice(0, 10)
    : [];

  // Obtener info de productos seleccionados
  const selectedProducts = formData.product_codes.map(code => 
    allProducts.find(p => p.code === code)
  ).filter(Boolean);

  if (loadingCollection) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-8">
        <p className="text-red-400">Colección no encontrada</p>
        <Link to="/admin-jdm-private/sg-gallery" className="text-accent hover:underline mt-4 block">
          ← Volver a colecciones
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          to="/admin-jdm-private/sg-gallery" 
          className="text-xs uppercase tracking-[0.15em] text-white/50 hover:text-accent transition-colors mb-4 inline-block"
        >
          ← Volver a colecciones
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
              {collection.name}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Gestiona las fotos de esta colección
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowNewForm(true);
            }}
            className="px-4 py-2 bg-white text-black text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors"
          >
            + Nueva Foto
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario de nueva/editar foto */}
      {(showNewForm || editingId) && (
        <div className="mb-8 p-6 bg-black border border-white/10">
          <h2 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-6">
            {editingId ? 'Editar Foto' : 'Nueva Foto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                  placeholder="Título de la foto"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Orden
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none resize-none"
                placeholder="Descripción de la foto..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                Información Contextual
              </label>
              <textarea
                value={formData.context_info}
                onChange={(e) => setFormData(prev => ({ ...prev, context_info: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none resize-none"
                placeholder="Información sobre la obra o escena fotografiada..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                Imagen *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  required
                  className="flex-1 px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                  placeholder="URL de la imagen o subir archivo"
                />
                <label className="px-4 py-2 bg-white/10 text-white text-sm cursor-pointer hover:bg-white/20 transition-colors">
                  {uploading ? '...' : 'Subir'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {formData.image_url && (
                <div className="mt-2 w-32 h-32 bg-black/50 overflow-hidden">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Selector de productos relacionados */}
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                Productos Relacionados
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                  placeholder="Buscar producto por nombre o código..."
                />
                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-black border border-white/20 max-h-48 overflow-y-auto">
                    {filteredProducts.map(product => (
                      <button
                        key={product.code}
                        type="button"
                        onClick={() => handleAddProduct(product.code)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-3"
                      >
                        {product.images?.[0] && (
                          <img 
                            src={product.images[0]} 
                            alt="" 
                            className="w-8 h-8 object-cover"
                          />
                        )}
                        <div>
                          <span className="block">{product.name}</span>
                          <span className="text-xs text-white/50">{product.code}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Productos seleccionados */}
              {selectedProducts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedProducts.map(product => (
                    <div 
                      key={product.code}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-sm"
                    >
                      {product.images?.[0] && (
                        <img 
                          src={product.images[0]} 
                          alt="" 
                          className="w-6 h-6 object-cover"
                        />
                      )}
                      <span className="text-white">{product.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.code)}
                        className="text-white/50 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active_photo"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="is_active_photo" className="text-sm text-white/70">
                Foto activa (visible en la web)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-white text-black text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 border border-white/20 text-white text-sm uppercase tracking-[0.1em] hover:border-white/40 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de fotos */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-white/70">Cargando fotos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 border border-white/10">
          <p className="text-white/50 text-sm">Esta colección no tiene fotos todavía</p>
          <button
            onClick={() => {
              resetForm();
              setShowNewForm(true);
            }}
            className="mt-4 text-accent text-sm hover:underline"
          >
            Añadir la primera foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative border transition-colors ${
                photo.is_active 
                  ? 'border-white/10 hover:border-white/30' 
                  : 'border-white/5 opacity-50'
              }`}
            >
              {/* Imagen */}
              <div className="aspect-square bg-black/50 overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.title || 'Foto'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay con acciones */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/70 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(photo)}
                    className="p-2 bg-white text-black text-xs hover:bg-white/90"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(photo)}
                    className="p-2 bg-white/20 text-white text-xs hover:bg-white/30"
                  >
                    {photo.is_active ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id, photo.title)}
                    className="p-2 bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm text-white truncate">{photo.title || 'Sin título'}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-white/50">Orden: {photo.display_order}</p>
                  {photo.product_codes?.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent">
                      {photo.product_codes.length} productos
                    </span>
                  )}
                </div>
              </div>

              {/* Badge de inactiva */}
              {!photo.is_active && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-xs text-white/50">
                  Oculta
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
