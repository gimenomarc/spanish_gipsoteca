import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { optimizeImageUrl } from '../utils/imageOptimizer';

/**
 * Hook para obtener todas las colecciones de SG Gallery
 */
export function useSGCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('sg_gallery_collections')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        // Optimizar URLs de imágenes de portada
        const optimizedCollections = (data || []).map(collection => ({
          ...collection,
          cover_image: collection.cover_image 
            ? optimizeImageUrl(collection.cover_image, { width: 800, quality: 85, format: 'webp' })
            : null
        }));

        setCollections(optimizedCollections);
        setError(null);
      } catch (err) {
        console.error('Error cargando colecciones:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  return { collections, loading, error };
}

/**
 * Hook para obtener una colección específica por slug
 */
export function useSGCollection(slug) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCollection() {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('sg_gallery_collections')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .single();

        if (error) throw error;

        setCollection(data);
        setError(null);
      } catch (err) {
        console.error('Error cargando colección:', err);
        setError(err.message);
        setCollection(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [slug]);

  return { collection, loading, error };
}

/**
 * Hook para obtener las fotos de una colección
 */
export function useSGPhotos(collectionId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPhotos() {
      if (!collectionId) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('sg_gallery_photos')
          .select('*')
          .eq('collection_id', collectionId)
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;

        // Optimizar URLs de imágenes
        const optimizedPhotos = (data || []).map(photo => ({
          ...photo,
          image_url: photo.image_url 
            ? optimizeImageUrl(photo.image_url, { width: 600, quality: 80, format: 'webp' })
            : null,
          image_url_full: photo.image_url 
            ? optimizeImageUrl(photo.image_url, { width: 1400, quality: 90, format: 'webp' })
            : null
        }));

        setPhotos(optimizedPhotos);
        setError(null);
      } catch (err) {
        console.error('Error cargando fotos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotos();
  }, [collectionId]);

  return { photos, loading, error };
}

/**
 * Hook para obtener el detalle de una foto con sus productos relacionados
 */
export function useSGPhotoDetail(photoId) {
  const [photo, setPhoto] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPhotoDetail() {
      if (!photoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Obtener la foto
        const { data: photoData, error: photoError } = await supabase
          .from('sg_gallery_photos')
          .select(`
            *,
            sg_gallery_collections (
              id,
              name,
              slug
            )
          `)
          .eq('id', photoId)
          .single();

        if (photoError) throw photoError;

        // Obtener los productos relacionados
        const { data: productLinks, error: linksError } = await supabase
          .from('sg_gallery_photo_products')
          .select('product_code')
          .eq('photo_id', photoId);

        if (linksError) throw linksError;

        // Si hay productos relacionados, obtener sus datos
        let products = [];
        if (productLinks && productLinks.length > 0) {
          const productCodes = productLinks.map(link => link.product_code);
          
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select(`
              *,
              categories (
                id,
                name,
                name_en
              )
            `)
            .in('code', productCodes);

          if (productsError) throw productsError;
          
          products = (productsData || []).map(product => ({
            code: product.code,
            name: product.name,
            price: product.price || '',
            artist: product.artist || 'Unknown artist',
            images: product.images || [],
            categoryId: product.category_id,
            categoryName: product.categories?.name || '',
          }));
        }

        setPhoto({
          ...photoData,
          image_url_full: photoData.image_url 
            ? optimizeImageUrl(photoData.image_url, { width: 1400, quality: 90, format: 'webp' })
            : null
        });
        setRelatedProducts(products);
        setError(null);
      } catch (err) {
        console.error('Error cargando detalle de foto:', err);
        setError(err.message);
        setPhoto(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotoDetail();
  }, [photoId]);

  return { photo, relatedProducts, loading, error };
}

/**
 * Hook para administración: obtener todas las colecciones (incluyendo inactivas)
 */
export function useAdminSGCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sg_gallery_collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      setCollections(data || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando colecciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const createCollection = async (collectionData) => {
    try {
      const { data, error } = await supabase
        .from('sg_gallery_collections')
        .insert([collectionData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchCollections();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updateCollection = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('sg_gallery_collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCollections();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const deleteCollection = async (id) => {
    try {
      const { error } = await supabase
        .from('sg_gallery_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchCollections();
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  };

  return { 
    collections, 
    loading, 
    error, 
    refetch: fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection
  };
}

/**
 * Hook para administración: obtener fotos de una colección (incluyendo inactivas)
 */
export function useAdminSGPhotos(collectionId) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPhotos = async () => {
    if (!collectionId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sg_gallery_photos')
        .select(`
          *,
          sg_gallery_photo_products (
            product_code
          )
        `)
        .eq('collection_id', collectionId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Transformar datos para incluir array de product_codes
      const transformedPhotos = (data || []).map(photo => ({
        ...photo,
        product_codes: (photo.sg_gallery_photo_products || []).map(p => p.product_code)
      }));

      setPhotos(transformedPhotos);
      setError(null);
    } catch (err) {
      console.error('Error cargando fotos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId]);

  const createPhoto = async (photoData) => {
    try {
      const { product_codes, ...photoFields } = photoData;
      
      const { data, error } = await supabase
        .from('sg_gallery_photos')
        .insert([{ ...photoFields, collection_id: collectionId }])
        .select()
        .single();

      if (error) throw error;

      // Crear relaciones con productos si existen
      if (product_codes && product_codes.length > 0) {
        const productLinks = product_codes.map(code => ({
          photo_id: data.id,
          product_code: code
        }));

        await supabase
          .from('sg_gallery_photo_products')
          .insert(productLinks);
      }
      
      await fetchPhotos();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const updatePhoto = async (id, updates) => {
    try {
      const { product_codes, ...photoFields } = updates;
      
      const { data, error } = await supabase
        .from('sg_gallery_photos')
        .update(photoFields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar relaciones con productos si se proporcionaron
      if (product_codes !== undefined) {
        // Eliminar relaciones existentes
        await supabase
          .from('sg_gallery_photo_products')
          .delete()
          .eq('photo_id', id);

        // Crear nuevas relaciones
        if (product_codes.length > 0) {
          const productLinks = product_codes.map(code => ({
            photo_id: id,
            product_code: code
          }));

          await supabase
            .from('sg_gallery_photo_products')
            .insert(productLinks);
        }
      }
      
      await fetchPhotos();
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };

  const deletePhoto = async (id) => {
    try {
      // Las relaciones se eliminan automáticamente por CASCADE
      const { error } = await supabase
        .from('sg_gallery_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchPhotos();
      return { error: null };
    } catch (err) {
      return { error: err.message };
    }
  };

  return { 
    photos, 
    loading, 
    error, 
    refetch: fetchPhotos,
    createPhoto,
    updatePhoto,
    deletePhoto
  };
}
