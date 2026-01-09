import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImageUrls, imagePresets } from '../utils/imageOptimizer';

/**
 * Ordena las imágenes priorizando las que tienen "DEF" en el nombre
 * (fotos definitivas en blanco y negro para coherencia visual)
 * 
 * Prioridad:
 * 1. Imágenes con "DEF" en el nombre van PRIMERO (son las principales)
 * 2. Luego imágenes con números bajos (1, 01, _1)
 * 3. Las demás mantienen su orden original
 */
function sortImagesByBackground(images) {
  if (!images || images.length <= 1) return images;

  return [...images].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // PRIORIDAD MÁXIMA: Imágenes con "DEF" en el nombre
    const aIsDef = aLower.includes('def');
    const bIsDef = bLower.includes('def');
    
    // Si una tiene DEF y la otra no, la DEF va primero
    if (aIsDef && !bIsDef) return -1;
    if (bIsDef && !aIsDef) return 1;
    
    // Si ambas tienen DEF o ninguna, ordenar por número
    const getFileNumber = (url) => {
      const filename = url.split('/').pop().split('.')[0];
      // Buscar patrones como: _1, -1, 01, 1 al final del nombre
      const match = filename.match(/[_-]?(\d+)$/);
      return match ? parseInt(match[1], 10) : 999;
    };
    
    const aNum = getFileNumber(a);
    const bNum = getFileNumber(b);
    
    // Números más bajos primero
    return aNum - bNum;
  });
}

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
        const transformedProducts = data.map(product => {
          // Ordenar imágenes priorizando fondo negro
          const sortedImages = sortImagesByBackground(product.images || []);
          return {
            code: product.code,
            name: product.name,
            folder: product.folder_name || '',
            price: product.price || '',
            artist: product.artist || 'Unknown artist',
            dimensions: product.dimensions || '',
            description: product.description || '',
            // Optimizar URLs de imágenes para tarjetas de producto (600x800, webp, quality 75)
            images: optimizeImageUrls(sortedImages, imagePresets.card),
            categoryId: product.category_id,
            categoryName: product.categories?.name || '',
          };
        });

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
          // Ordenar imágenes priorizando fondo negro
          const sortedImages = sortImagesByBackground(data.images || []);
          const transformedProduct = {
            code: data.code,
            name: data.name,
            folder: data.folder_name || '',
            price: data.price || '',
            artist: data.artist || 'Unknown artist',
            dimensions: data.dimensions || '',
            description: data.description || '',
            // Optimizar URLs de imágenes para página de detalle (1200x1600, webp, quality 85)
            images: optimizeImageUrls(sortedImages, imagePresets.detail),
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

// Hook para obtener productos relacionados (misma categoría, excluyendo el actual)
export function useRelatedProducts(categoryId, currentProductCode, limit = 4) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!categoryId || !currentProductCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Primero intentamos obtener productos de la misma categoría
        let { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name,
              name_en
            )
          `)
          .eq('category_id', categoryId)
          .neq('code', currentProductCode)
          .limit(limit);

        if (error) throw error;

        // Si no hay suficientes productos en la misma categoría, obtener de otras
        if (data.length < limit) {
          const remaining = limit - data.length;
          const existingCodes = [currentProductCode, ...data.map(p => p.code)];
          
          const { data: moreProducts, error: moreError } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                id,
                name,
                name_en
              )
            `)
            .not('code', 'in', `(${existingCodes.join(',')})`)
            .limit(remaining);

          if (!moreError && moreProducts) {
            data = [...data, ...moreProducts];
          }
        }

        // Transformar datos
        const transformedProducts = data.map(product => {
          // Ordenar imágenes priorizando fondo negro
          const sortedImages = sortImagesByBackground(product.images || []);
          return {
            code: product.code,
            name: product.name,
            folder: product.folder_name || '',
            price: product.price || '',
            artist: product.artist || 'Unknown artist',
            dimensions: product.dimensions || '',
            description: product.description || '',
            images: optimizeImageUrls(sortedImages, imagePresets.card),
            categoryId: product.category_id,
            categoryName: product.categories?.name || '',
          };
        });

        setRelatedProducts(transformedProducts);
      } catch (err) {
        console.error('Error cargando productos relacionados:', err);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [categoryId, currentProductCode, limit]);

  return { relatedProducts, loading };
}