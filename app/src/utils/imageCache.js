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
    this.maxConcurrent = 6; // Límite de imágenes cargando simultáneamente
    this.currentLoading = 0;
    this.loadingQueue = [];
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
   * Con límite de carga concurrente para mejorar el rendimiento
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

    // Crear nueva promesa de carga con control de concurrencia
    const promise = new Promise((resolve, reject) => {
      const loadImage = () => {
        this.currentLoading++;
        const img = new Image();
        img.onload = () => {
          this.set(url, img);
          this.loadingPromises.delete(url);
          this.currentLoading--;
          this.processQueue(); // Procesar siguiente en la cola
          resolve(img);
        };
        img.onerror = () => {
          this.loadingPromises.delete(url);
          this.currentLoading--;
          this.processQueue(); // Procesar siguiente en la cola
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      };

      // Si hay espacio, cargar inmediatamente
      if (this.currentLoading < this.maxConcurrent) {
        loadImage();
      } else {
        // Agregar a la cola
        this.loadingQueue.push(loadImage);
      }
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  /**
   * Procesa la cola de carga cuando hay espacio disponible
   */
  processQueue() {
    while (this.loadingQueue.length > 0 && this.currentLoading < this.maxConcurrent) {
      const loadImage = this.loadingQueue.shift();
      loadImage();
    }
  }

  /**
   * Precarga múltiples imágenes con límite de concurrencia
   */
  async preloadBatch(urls, maxConcurrent = 6) {
    // Limitar el número de imágenes a preloadar simultáneamente
    const limitedUrls = urls.slice(0, 20); // Máximo 20 imágenes por batch
    return Promise.allSettled(limitedUrls.map(url => this.preload(url)));
  }

  /**
   * Limpia el caché
   */
  clear() {
    this.cache.clear();
    this.loadingPromises.clear();
    this.loadingQueue = [];
    this.currentLoading = 0;
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
