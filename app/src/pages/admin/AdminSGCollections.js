import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminSGCollections } from '../../hooks/useSGGallery';
import { supabase } from '../../lib/supabase';

// Función para generar slug desde nombre
function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminSGCollections() {
  const { 
    collections, 
    loading, 
    error, 
    createCollection, 
    updateCollection, 
    deleteCollection 
  } = useAdminSGCollections();

  const [editingId, setEditingId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    cover_image: '',
    display_order: 0,
    is_active: true
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      cover_image: '',
      display_order: collections.length,
      is_active: true
    });
    setEditingId(null);
    setShowNewForm(false);
  };

  const handleEdit = (collection) => {
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description || '',
      cover_image: collection.cover_image || '',
      display_order: collection.display_order || 0,
      is_active: collection.is_active
    });
    setEditingId(collection.id);
    setShowNewForm(false);
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generar slug solo si es una colección nueva o si el slug actual coincide con el auto-generado del nombre anterior
      slug: !editingId || prev.slug === generateSlug(prev.name) 
        ? generateSlug(name) 
        : prev.slug
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `sg-gallery/covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      alert('Error al subir la imagen: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await updateCollection(editingId, formData);
        if (error) throw new Error(error);
      } else {
        const { error } = await createCollection(formData);
        if (error) throw new Error(error);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar la colección "${name}"? Esto eliminará también todas las fotos asociadas.`)) {
      return;
    }

    const { error } = await deleteCollection(id);
    if (error) {
      alert('Error al eliminar: ' + error);
    }
  };

  const handleToggleActive = async (collection) => {
    await updateCollection(collection.id, { is_active: !collection.is_active });
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando colecciones...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
            SG Gallery - Colecciones
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Gestiona las colecciones de la galería
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowNewForm(true);
          }}
          className="px-4 py-2 bg-white text-black text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors"
        >
          + Nueva Colección
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Formulario de nueva/editar colección */}
      {(showNewForm || editingId) && (
        <div className="mb-8 p-6 bg-black border border-white/10">
          <h2 className="text-sm uppercase tracking-[0.15em] text-white/70 mb-6">
            {editingId ? 'Editar Colección' : 'Nueva Colección'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                  placeholder="Ej: The Studio Collection"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                  placeholder="the-studio-collection"
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
                placeholder="Descripción de la colección..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Imagen de Portada
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, cover_image: e.target.value }))}
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
                {formData.cover_image && (
                  <div className="mt-2 w-24 h-24 bg-black/50 overflow-hidden">
                    <img
                      src={formData.cover_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.1em] text-white/50 mb-2">
                  Orden de visualización
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 bg-black border border-white/20 text-white text-sm focus:border-white/40 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm text-white/70">
                Colección activa (visible en la web)
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

      {/* Lista de colecciones */}
      <div className="space-y-4">
        {collections.length === 0 ? (
          <div className="text-center py-12 border border-white/10">
            <p className="text-white/50 text-sm">No hay colecciones todavía</p>
            <button
              onClick={() => {
                resetForm();
                setShowNewForm(true);
              }}
              className="mt-4 text-accent text-sm hover:underline"
            >
              Crear la primera colección
            </button>
          </div>
        ) : (
          collections.map((collection) => (
            <div
              key={collection.id}
              className={`flex items-center gap-4 p-4 border transition-colors ${
                collection.is_active 
                  ? 'border-white/10 hover:border-white/20' 
                  : 'border-white/5 bg-white/5 opacity-60'
              }`}
            >
              {/* Imagen */}
              <div className="w-20 h-20 bg-black/50 overflow-hidden flex-shrink-0">
                {collection.cover_image ? (
                  <img
                    src={collection.cover_image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    🖼️
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium truncate">
                    {collection.name}
                  </h3>
                  {!collection.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-white/10 text-white/50">
                      Oculta
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/50 mt-1">
                  /{collection.slug}
                </p>
                {collection.description && (
                  <p className="text-sm text-white/60 mt-1 line-clamp-1">
                    {collection.description}
                  </p>
                )}
              </div>

              {/* Orden */}
              <div className="text-center px-4">
                <p className="text-xs text-white/40">Orden</p>
                <p className="text-lg text-white/70">{collection.display_order}</p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/admin-jdm-private/sg-gallery/${collection.id}/photos`}
                  className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  📷 Fotos
                </Link>
                <button
                  onClick={() => handleEdit(collection)}
                  className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(collection)}
                  className="px-3 py-1.5 text-xs text-white/70 hover:text-white border border-white/20 hover:border-white/40 transition-colors"
                >
                  {collection.is_active ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                  onClick={() => handleDelete(collection.id, collection.name)}
                  className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded">
        <p className="text-sm text-blue-400">
          <strong>💡 Tip:</strong> Las colecciones se muestran en la home ordenadas por el campo "Orden". 
          Las colecciones inactivas no serán visibles en la web pública.
        </p>
      </div>
    </div>
  );
}
