import { useEffect } from 'react';

/**
 * Sistema de caché de imágenes en memoria para mejorar el rendimiento
 * Evita recargar imágenes que ya se han cargado previamente
 */

class ImageCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.loadingPromises = new Map();
  }

  /**
   * Verifica si una imagen está en caché
   */
  has(url) {
    return this.cache.has(url);
  }

  /**
   * Obtiene una imagen del caché
   */
  get(url) {
    return this.cache.get(url);
  }

  /**
   * Añade una imagen al caché
   */
  set(url, image) {
    // Si el caché está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, image);
  }

  /**
   * Precarga una imagen y la guarda en caché
   */
  async preload(url) {
    // Si ya está en caché, retornar inmediatamente
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Si ya se está cargando, retornar la promesa existente
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    // Crear nueva promesa de carga
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Precarga múltiples imágenes
   */
  async preloadBatch(urls) {
    return Promise.allSettled(urls.map(url => this.preload(url)));
  }

  /**
   * Limpia el caché
   */
  clear() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  /**
   * Obtiene el tamaño del caché
   */
  size() {
    return this.cache.size;
  }
}

// Instancia singleton del caché
export const imageCache = new ImageCache(100);

/**
 * Hook para usar el caché de imágenes
 */
export function useImageCache(urls, options = {}) {
  const { priority = false } = options;

  useEffect(() => {
    if (!urls) return;

    const imageUrls = Array.isArray(urls) ? urls : [urls];
    
    // Precargar imágenes en segundo plano
    imageCache.preloadBatch(imageUrls).catch(err => {
      console.warn('Error precargando imágenes:', err);
    });
  }, [urls, priority]);
}
