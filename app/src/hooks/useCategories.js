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
        const categoriesMap = {};
        data.forEach(cat => {
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

