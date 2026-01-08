import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImageUrls, imagePresets } from '../utils/imageOptimizer';

export function useProducts(categoryId = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        let query = supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              name_en
            )
          `)
          .order('code', { ascending: true });

        // Si hay categoryId, filtrar por categoría
        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transformar datos al formato esperado por la aplicación
        const transformedProducts = data.map(product => ({
          code: product.code,
          name: product.name,
          folder: product.folder_name || '',
          price: product.price || '',
          artist: product.artist || 'Unknown artist',
          dimensions: product.dimensions || '',
          description: product.description || '',
          // Optimizar URLs de imágenes para tarjetas de producto (600x800, webp, quality 75)
          images: optimizeImageUrls(product.images || [], imagePresets.card),
          categoryId: product.category_id,
          categoryName: product.categories?.name || '',
        }));

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error('Error cargando productos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
}

export function useProduct(categoryId, productCode) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!categoryId || !productCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              name_en
            )
          `)
          .eq('code', productCode)
          .eq('category_id', categoryId)
          .single();

        if (error) throw error;

        if (data) {
          const transformedProduct = {
            code: data.code,
            name: data.name,
            folder: data.folder_name || '',
            price: data.price || '',
            artist: data.artist || 'Unknown artist',
            dimensions: data.dimensions || '',
            description: data.description || '',
            // Optimizar URLs de imágenes para página de detalle (1200x1600, webp, quality 85)
            images: optimizeImageUrls(data.images || [], imagePresets.detail),
            categoryId: data.category_id,
            categoryName: data.categories?.name || '',
          };
          setProduct(transformedProduct);
        } else {
          setProduct(null);
        }
        setError(null);
      } catch (err) {
        console.error('Error cargando producto:', err);
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [categoryId, productCode]);

  return { product, loading, error };
}
