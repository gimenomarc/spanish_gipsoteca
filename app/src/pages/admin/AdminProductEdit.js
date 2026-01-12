import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AdminProductEdit() {
  const { code } = useParams();
  const navigate = useNavigate();
  const isNew = code === 'new';

  const [product, setProduct] = useState({
    code: '',
    name: '',
    artist: '',
    dimensions: '',
    price: '',
    description: '',
    category_id: '',
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sgPhotos, setSgPhotos] = useState([]);
  const [relatedPhotoIds, setRelatedPhotoIds] = useState([]);
  const [loadingSGPhotos, setLoadingSGPhotos] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchProduct();
      fetchSGPhotos();
      fetchRelatedPhotos();
    }
  }, [code, isNew]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('code', code)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Producto no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSGPhotos = async () => {
    setLoadingSGPhotos(true);
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
      setLoadingSGPhotos(false);
    }
  };

  const fetchRelatedPhotos = async () => {
    if (!code || isNew) return;
    
    try {
      const { data, error } = await supabase
        .from('sg_gallery_photo_products')
        .select('photo_id')
        .eq('product_code', code);

      if (error) throw error;
      setRelatedPhotoIds((data || []).map(item => item.photo_id));
    } catch (error) {
      console.error('Error fetching related photos:', error);
    }
  };

  const togglePhotoRelation = async (photoId) => {
    if (!code || isNew) return;

    const isRelated = relatedPhotoIds.includes(photoId);
    
    try {
      if (isRelated) {
        // Eliminar relación
        const { error } = await supabase
          .from('sg_gallery_photo_products')
          .delete()
          .eq('product_code', code)
          .eq('photo_id', photoId);

        if (error) throw error;
        setRelatedPhotoIds(prev => prev.filter(id => id !== photoId));
      } else {
        // Añadir relación
        const { error } = await supabase
          .from('sg_gallery_photo_products')
          .insert({
            product_code: code,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (isNew) {
        // Crear nuevo producto
        if (!product.code) {
          throw new Error('El código del producto es obligatorio');
        }

        const { error } = await supabase
          .from('products')
          .insert({
            code: product.code.toUpperCase(),
            name: product.name,
            artist: product.artist,
            dimensions: product.dimensions,
            price: product.price,
            description: product.description,
            category_id: product.category_id || null,
          });

        if (error) throw error;
        setSuccess('Producto creado correctamente');
        setTimeout(() => navigate(`/admin-jdm-private/products/${product.code.toUpperCase()}`), 1500);
      } else {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update({
            name: product.name,
            artist: product.artist,
            dimensions: product.dimensions,
            price: product.price,
            description: product.description,
            category_id: product.category_id || null,
          })
          .eq('code', code);

        if (error) throw error;
        setSuccess('Producto actualizado correctamente');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando producto...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/admin-jdm-private/products"
          className="text-sm text-white/50 hover:text-white transition-colors mb-4 inline-block"
        >
          ← Volver a productos
        </Link>
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
          {isNew ? 'Nuevo Producto' : `Editar ${product.code}`}
        </h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Código */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
              Código *
            </label>
            <input
              type="text"
              name="code"
              value={product.code}
              onChange={handleChange}
              disabled={!isNew}
              required
              placeholder="M001, A002, etc."
              className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {!isNew && (
              <p className="text-xs text-white/40 mt-1">El código no se puede modificar</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
              Categoría
            </label>
            <select
              name="category_id"
              value={product.category_id || ''}
              onChange={handleChange}
              className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
            Nombre del Producto
          </label>
          <input
            type="text"
            name="name"
            value={product.name || ''}
            onChange={handleChange}
            placeholder="Máscara de Madonna della Pietà"
            className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
          />
        </div>

        {/* Artista */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
            Artista / Autoría
          </label>
          <input
            type="text"
            name="artist"
            value={product.artist || ''}
            onChange={handleChange}
            placeholder="Miguel Ángel Buonarroti"
            className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dimensiones */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
              Dimensiones
            </label>
            <input
              type="text"
              name="dimensions"
              value={product.dimensions || ''}
              onChange={handleChange}
              placeholder="26x18x13cm"
              className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
              Precio (PVP)
            </label>
            <input
              type="text"
              name="price"
              value={product.price || ''}
              onChange={handleChange}
              placeholder="95,00 €"
              className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none"
            />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={product.description || ''}
            onChange={handleChange}
            rows={6}
            placeholder="Descripción detallada del producto..."
            className="w-full bg-black border border-white/20 px-4 py-3 text-white text-sm focus:border-white focus:outline-none resize-none"
          />
        </div>

        {/* Imágenes (solo mostrar, no editar aquí) */}
        {!isNew && product.images && product.images.length > 0 && (
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-2">
              Imágenes ({product.images.length})
            </label>
            <div className="flex gap-2 flex-wrap">
              {product.images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 bg-white/10 overflow-hidden">
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-white/40 mt-2">
              Para gestionar imágenes, usa la sección de <Link to="/admin-jdm-private/images" className="text-white/60 hover:text-white underline">Imágenes</Link>
            </p>
          </div>
        )}

        {/* SG Gallery - Fotos relacionadas */}
        {!isNew && (
          <div className="border-t border-white/10 pt-6">
            <label className="block text-xs uppercase tracking-[0.15em] text-white/70 mb-4">
              📷 Fotos de SG Gallery Relacionadas
            </label>
            <p className="text-xs text-white/50 mb-4">
              Selecciona las fotos de SG Gallery que muestran este producto en la vida real. Estas fotos aparecerán en la página del producto.
            </p>
            
            {loadingSGPhotos ? (
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
                      type="button"
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
            {relatedPhotoIds.length > 0 && (
              <p className="text-xs text-white/50 mt-4">
                {relatedPhotoIds.length} foto{relatedPhotoIds.length !== 1 ? 's' : ''} relacionada{relatedPhotoIds.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black px-8 py-3 text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : isNew ? 'Crear Producto' : 'Guardar Cambios'}
          </button>
          <Link
            to="/admin-jdm-private/products"
            className="px-8 py-3 text-sm text-white/70 hover:text-white transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>

      {/* Preview Link */}
      {!isNew && (
        <div className="mt-8 p-4 bg-white/5 border border-white/10">
          <p className="text-xs text-white/50 mb-2">Ver en la web:</p>
          <Link
            to={`/product/${product.category_id}/${product.code}`}
            target="_blank"
            className="text-sm text-white hover:underline"
          >
            /product/{product.category_id}/{product.code} →
          </Link>
        </div>
      )}
    </div>
  );
}
