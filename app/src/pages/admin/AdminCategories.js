import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', name_en: '' });
  const [newCategory, setNewCategory] = useState({ id: '', name: '', name_en: '' });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Obtener categorías con conteo de productos
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products (count)
        `)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, name_en: category.name_en || '' });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({ name: editForm.name, name_en: editForm.name_en })
        .eq('id', editingId);

      if (error) throw error;

      setCategories(categories.map(c =>
        c.id === editingId ? { ...c, ...editForm } : c
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar la categoría');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!newCategory.id || !newCategory.name) {
      alert('El ID y el nombre son obligatorios');
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          id: newCategory.id.toLowerCase().replace(/\s+/g, '-'),
          name: newCategory.name,
          name_en: newCategory.name_en || null,
        });

      if (error) throw error;

      await fetchCategories();
      setNewCategory({ id: '', name: '', name_en: '' });
      setShowNewForm(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    const category = categories.find(c => c.id === id);
    const productCount = category?.products?.[0]?.count || 0;

    if (productCount > 0) {
      alert(`No se puede eliminar: hay ${productCount} productos en esta categoría`);
      return;
    }

    if (!window.confirm('¿Eliminar esta categoría?')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCategories(categories.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/70">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
            Categorías
          </h1>
          <p className="text-sm text-white/50 mt-1">
            {categories.length} categorías
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="bg-white text-black px-6 py-2 text-sm uppercase tracking-[0.1em] hover:bg-white/90 transition-colors"
        >
          {showNewForm ? 'Cancelar' : '+ Nueva Categoría'}
        </button>
      </div>

      {/* New Category Form */}
      {showNewForm && (
        <form onSubmit={handleCreate} className="bg-black border border-white/10 p-6 mb-6">
          <h3 className="text-sm uppercase tracking-[0.1em] text-white/70 mb-4">Nueva Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">ID (slug)</label>
              <input
                type="text"
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                placeholder="mascaras-y-bustos"
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Nombre (ES)</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Máscaras y Bustos"
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Nombre (EN)</label>
              <input
                type="text"
                value={newCategory.name_en}
                onChange={(e) => setNewCategory({ ...newCategory, name_en: e.target.value })}
                placeholder="Masks & Busts"
                className="w-full bg-black border border-white/20 px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-white text-black px-6 py-2 text-sm hover:bg-white/90 transition-colors"
          >
            Crear Categoría
          </button>
        </form>
      )}

      {/* Categories List */}
      <div className="bg-black border border-white/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">ID</th>
              <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Nombre</th>
              <th className="text-left p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Name (EN)</th>
              <th className="text-center p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Productos</th>
              <th className="text-right p-4 text-xs uppercase tracking-[0.1em] text-white/50 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <span className="text-xs font-mono text-white/50">{category.id}</span>
                </td>
                <td className="p-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-black border border-white/30 px-2 py-1 text-sm text-white w-full"
                    />
                  ) : (
                    <span className="text-sm text-white">{category.name}</span>
                  )}
                </td>
                <td className="p-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editForm.name_en}
                      onChange={(e) => setEditForm({ ...editForm, name_en: e.target.value })}
                      className="bg-black border border-white/30 px-2 py-1 text-sm text-white w-full"
                    />
                  ) : (
                    <span className="text-sm text-white/70">{category.name_en || '—'}</span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <span className="text-sm text-white/70">{category.products?.[0]?.count || 0}</span>
                </td>
                <td className="p-4 text-right">
                  {editingId === category.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1 text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
