import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        // Transformar datos a formato esperado por la aplicación
        // Filtrar categoría "Actualización enero 2026" o similares
        const categoriesMap = {};
        data.forEach(cat => {
          // Excluir categorías de actualización temporal
          const nameLower = (cat.name || '').toLowerCase();
          if (nameLower.includes('actualización') || nameLower.includes('enero 2026') || nameLower.includes('january 2026')) {
            return; // Saltar esta categoría
          }
          
          categoriesMap[cat.id] = {
            id: cat.id,
            name: cat.name,
            nameEn: cat.name_en,
          };
        });

        setCategories(categoriesMap);
        setError(null);
      } catch (err) {
        console.error('Error cargando categorías:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
