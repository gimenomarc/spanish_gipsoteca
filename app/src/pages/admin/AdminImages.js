import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

// ─── Crop Modal ───────────────────────────────────────────────────────────────

function ImageCropModal({ imageUrl, productCode, categoryId, imageIndex, onClose, onCropSaved }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [cropRect, setCropRect] = useState(null); // {x, y, w, h} in display px
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'new' | 'move' | 'resize-tl/tr/bl/br'
  const [dragStart, setDragStart] = useState(null);
  const [cropStart, setCropStart] = useState(null);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [saving, setSaving] = useState(false);
  const ASPECT = 3 / 4; // ancho/alto

  const initCrop = useCallback((dw, dh) => {
    let cw, ch;
    if (dw / dh > ASPECT) {
      ch = dh * 0.85;
      cw = ch * ASPECT;
    } else {
      cw = dw * 0.85;
      ch = cw / ASPECT;
    }
    setCropRect({ x: (dw - cw) / 2, y: (dh - ch) / 2, w: cw, h: ch });
  }, [ASPECT]);

  const handleImgLoad = (e) => {
    const img = e.target;
    const dw = img.offsetWidth;
    const dh = img.offsetHeight;
    setDisplaySize({ w: dw, h: dh });
    initCrop(dw, dh);
  };

  const getPos = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const HANDLE_RADIUS = 10;

  const hitCorner = (pos) => {
    if (!cropRect) return null;
    const corners = [
      { name: 'tl', x: cropRect.x, y: cropRect.y },
      { name: 'tr', x: cropRect.x + cropRect.w, y: cropRect.y },
      { name: 'bl', x: cropRect.x, y: cropRect.y + cropRect.h },
      { name: 'br', x: cropRect.x + cropRect.w, y: cropRect.y + cropRect.h },
    ];
    for (const c of corners) {
      if (Math.hypot(pos.x - c.x, pos.y - c.y) < HANDLE_RADIUS + 4) return c.name;
    }
    return null;
  };

  const insideCrop = (pos) =>
    cropRect &&
    pos.x > cropRect.x && pos.x < cropRect.x + cropRect.w &&
    pos.y > cropRect.y && pos.y < cropRect.y + cropRect.h;

  const handleMouseDown = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const corner = hitCorner(pos);
    if (corner) {
      setDragMode(`resize-${corner}`);
    } else if (insideCrop(pos)) {
      setDragMode('move');
    } else {
      setDragMode('new');
      setCropRect({ x: pos.x, y: pos.y, w: 0, h: 0 });
    }
    setIsDragging(true);
    setDragStart(pos);
    setCropStart(cropRect ? { ...cropRect } : null);
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const pos = getPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    const { w: dw, h: dh } = displaySize;

    if (dragMode === 'new') {
      let rw = pos.x - dragStart.x;
      let rh = pos.y - dragStart.y;
      if (aspectLocked && rw !== 0) rh = (Math.abs(rw) / ASPECT) * Math.sign(rh || 1);
      const rx = rw < 0 ? pos.x : dragStart.x;
      const ry = rh < 0 ? pos.y : dragStart.y;
      setCropRect({ x: clamp(rx, 0, dw), y: clamp(ry, 0, dh), w: Math.abs(rw), h: Math.abs(rh) });
    } else if (dragMode === 'move' && cropStart) {
      setCropRect({
        ...cropStart,
        x: clamp(cropStart.x + dx, 0, dw - cropStart.w),
        y: clamp(cropStart.y + dy, 0, dh - cropStart.h),
      });
    } else if (dragMode?.startsWith('resize-') && cropStart) {
      const corner = dragMode.split('-')[1];
      let r = { ...cropStart };
      if (corner === 'br') {
        r.w = Math.max(20, cropStart.w + dx);
        r.h = aspectLocked ? r.w / ASPECT : Math.max(20, cropStart.h + dy);
      } else if (corner === 'tr') {
        r.w = Math.max(20, cropStart.w + dx);
        r.h = aspectLocked ? r.w / ASPECT : Math.max(20, cropStart.h - dy);
        r.y = cropStart.y + cropStart.h - r.h;
      } else if (corner === 'bl') {
        r.w = Math.max(20, cropStart.w - dx);
        r.h = aspectLocked ? r.w / ASPECT : Math.max(20, cropStart.h + dy);
        r.x = cropStart.x + cropStart.w - r.w;
      } else if (corner === 'tl') {
        r.w = Math.max(20, cropStart.w - dx);
        r.h = aspectLocked ? r.w / ASPECT : Math.max(20, cropStart.h - dy);
        r.x = cropStart.x + cropStart.w - r.w;
        r.y = cropStart.y + cropStart.h - r.h;
      }
      r.x = clamp(r.x, 0, dw);
      r.y = clamp(r.y, 0, dh);
      r.w = Math.min(dw - r.x, r.w);
      r.h = Math.min(dh - r.y, r.h);
      setCropRect(r);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode(null);
  };

  const applyCrop = async () => {
    if (!cropRect || cropRect.w < 10 || cropRect.h < 10) return;
    setSaving(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + '_cb=' + Date.now();
      });

      const scaleX = img.naturalWidth / displaySize.w;
      const scaleY = img.naturalHeight / displaySize.h;

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cropRect.w * scaleX);
      canvas.height = Math.round(cropRect.h * scaleY);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        cropRect.x * scaleX, cropRect.y * scaleY,
        cropRect.w * scaleX, cropRect.h * scaleY,
        0, 0, canvas.width, canvas.height
      );

      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      const path = `${categoryId}/${productCode}/cropped_${Date.now()}.jpg`;

      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path);

      await onCropSaved(publicUrl, imageIndex);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
      alert('Error al guardar el recorte: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Cursor según posición
  const getCursor = (e) => {
    if (!imgRef.current) return;
    const pos = getPos(e);
    const corner = hitCorner(pos);
    if (corner) {
      imgRef.current.style.cursor = (corner === 'tl' || corner === 'br') ? 'nwse-resize' : 'nesw-resize';
    } else if (insideCrop(pos)) {
      imgRef.current.style.cursor = 'move';
    } else {
      imgRef.current.style.cursor = 'crosshair';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-neutral-900 border border-white/20 max-w-3xl w-full flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-sm uppercase tracking-[0.15em] text-white">Recortar Imagen</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={aspectLocked}
                onChange={e => setAspectLocked(e.target.checked)}
                className="w-3.5 h-3.5"
              />
              Proporción 3:4 (retrato)
            </label>
            <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Image + crop overlay */}
        <div ref={containerRef} className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
          <div
            ref={imgRef}
            className="relative inline-block select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={(e) => { handleMouseMove(e); getCursor(e); }}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={imageUrl}
              alt="Recortar"
              className="block max-w-full max-h-[55vh] object-contain pointer-events-none"
              onLoad={handleImgLoad}
              draggable={false}
            />

            {cropRect && displaySize.w > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={displaySize.w}
                height={displaySize.h}
                style={{ top: 0, left: 0, position: 'absolute' }}
              >
                <defs>
                  <mask id="cm">
                    <rect x="0" y="0" width={displaySize.w} height={displaySize.h} fill="white" />
                    <rect x={cropRect.x} y={cropRect.y} width={cropRect.w} height={cropRect.h} fill="black" />
                  </mask>
                </defs>
                {/* Dark overlay outside crop */}
                <rect x="0" y="0" width={displaySize.w} height={displaySize.h} fill="rgba(0,0,0,0.55)" mask="url(#cm)" />
                {/* Crop border */}
                <rect x={cropRect.x} y={cropRect.y} width={cropRect.w} height={cropRect.h} fill="none" stroke="white" strokeWidth="1.5" />
                {/* Rule of thirds grid */}
                <line x1={cropRect.x + cropRect.w/3} y1={cropRect.y} x2={cropRect.x + cropRect.w/3} y2={cropRect.y + cropRect.h} stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1={cropRect.x + 2*cropRect.w/3} y1={cropRect.y} x2={cropRect.x + 2*cropRect.w/3} y2={cropRect.y + cropRect.h} stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1={cropRect.x} y1={cropRect.y + cropRect.h/3} x2={cropRect.x + cropRect.w} y2={cropRect.y + cropRect.h/3} stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1={cropRect.x} y1={cropRect.y + 2*cropRect.h/3} x2={cropRect.x + cropRect.w} y2={cropRect.y + 2*cropRect.h/3} stroke="white" strokeWidth="0.5" strokeOpacity="0.4" />
                {/* Corner handles */}
                {[
                  [cropRect.x, cropRect.y],
                  [cropRect.x + cropRect.w, cropRect.y],
                  [cropRect.x, cropRect.y + cropRect.h],
                  [cropRect.x + cropRect.w, cropRect.y + cropRect.h],
                ].map(([cx, cy], i) => (
                  <circle key={i} cx={cx} cy={cy} r="5" fill="white" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-white/10 flex-shrink-0">
          <p className="text-xs text-white/40">
            Arrastra para crear área · Arrastra esquinas para redimensionar · Arrastra dentro para mover
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={applyCrop}
              disabled={!cropRect || cropRect.w < 10 || saving}
              className="px-5 py-2 text-xs bg-white text-black hover:bg-white/90 disabled:opacity-40 transition-colors uppercase tracking-[0.1em]"
            >
              {saving ? 'Guardando...' : 'Aplicar Recorte'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminImages() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [cropModal, setCropModal] = useState(null); // { imageUrl, imageIndex }
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          code,
          name,
          images,
          category_id,
          categories (name)
        `)
        .order('code');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const sanitizeFileName = (fileName) => {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const handleFileUpload = async (e) => {
    if (!selectedProduct) return;

    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const newImages = [...(selectedProduct.images || [])];
      const primaryImages = [];
      const regularImages = [];

      for (const file of files) {
        const originalName = file.name;
        const ext = originalName.split('.').pop();
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
        const sanitizedName = sanitizeFileName(nameWithoutExt);
        const fileName = `${sanitizedName}.${ext}`;
        const path = `${selectedProduct.category_id}/${selectedProduct.code}/${fileName}`;

        const shouldBePrimary = isPrimary || nameWithoutExt.toUpperCase().includes('DEF');

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(path, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          const timestamp = Date.now();
          const uniqueFileName = `${sanitizedName}_${timestamp}.${ext}`;
          const uniquePath = `${selectedProduct.category_id}/${selectedProduct.code}/${uniqueFileName}`;

          const { error: retryError } = await supabase.storage
            .from('product-images')
            .upload(uniquePath, file, { cacheControl: '3600', upsert: false });

          if (retryError) throw retryError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(uniquePath);

          if (shouldBePrimary) primaryImages.push(publicUrl);
          else regularImages.push(publicUrl);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(path);

          if (shouldBePrimary) primaryImages.push(publicUrl);
          else regularImages.push(publicUrl);
        }
      }

      const finalImages = [...primaryImages, ...regularImages, ...newImages];

      const { error: updateError } = await supabase
        .from('products')
        .update({ images: finalImages })
        .eq('code', selectedProduct.code);

      if (updateError) throw updateError;

      setSelectedProduct({ ...selectedProduct, images: finalImages });
      setProducts(products.map(p =>
        p.code === selectedProduct.code ? { ...p, images: finalImages } : p
      ));

      setIsPrimary(false);
      alert('Imágenes subidas correctamente');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir las imágenes: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl, index) => {
    if (!selectedProduct) return;
    if (!window.confirm('¿Eliminar esta imagen?')) return;

    try {
      const urlParts = imageUrl.split('/product-images/');
      if (urlParts.length > 1) {
        const path = decodeURIComponent(urlParts[1]);
        await supabase.storage.from('product-images').remove([path]);
      }

      const newImages = selectedProduct.images.filter((_, i) => i !== index);

      const { error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', selectedProduct.code);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, images: newImages });
      setProducts(products.map(p =>
        p.code === selectedProduct.code ? { ...p, images: newImages } : p
      ));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  const handleSetPrimary = async (index) => {
    if (!selectedProduct || index === 0) return;

    const newImages = [...selectedProduct.images];
    const [moved] = newImages.splice(index, 1);
    newImages.unshift(moved);

    try {
      const { error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('code', selectedProduct.code);

      if (error) throw error;

      setSelectedProduct({ ...selectedProduct, images: newImages });
      setProducts(products.map(p =>
        p.code === selectedProduct.code ? { ...p, images: newImages } : p
      ));
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Error al reordenar las imágenes');
    }
  };

  const handleCropSaved = async (newUrl, imageIndex) => {
    if (!selectedProduct) return;
    const newImages = [...selectedProduct.images];
    newImages[imageIndex] = newUrl;

    const { error } = await supabase
      .from('products')
      .update({ images: newImages })
      .eq('code', selectedProduct.code);

    if (error) throw error;

    setSelectedProduct({ ...selectedProduct, images: newImages });
    setProducts(products.map(p =>
      p.code === selectedProduct.code ? { ...p, images: newImages } : p
    ));
  };

  const filteredProducts = products.filter(p =>
    p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-white/70">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-display uppercase tracking-[0.15em] text-white">
          Gestión de Imágenes
        </h1>
        <p className="text-sm text-white/50 mt-1">
          Selecciona un producto para gestionar sus imágenes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products List */}
        <div className="bg-black border border-white/10 p-6 max-h-[600px] overflow-hidden flex flex-col">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/20 px-4 py-2 text-sm text-white focus:border-white focus:outline-none mb-4"
          />

          <div className="overflow-y-auto flex-1 space-y-2">
            {filteredProducts.map((product) => (
              <button
                key={product.code}
                onClick={() => setSelectedProduct(product)}
                className={`w-full text-left p-3 transition-colors flex items-center gap-3 ${
                  selectedProduct?.code === product.code
                    ? 'bg-white/10 border-l-2 border-white'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 bg-white/10 overflow-hidden flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-xs">—</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{product.name || product.code}</p>
                  <p className="text-xs text-white/50">
                    {product.code} • {product.images?.length || 0} imgs
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Image Manager */}
        <div className="bg-black border border-white/10 p-6">
          {selectedProduct ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg text-white">{selectedProduct.name}</h2>
                  <p className="text-xs text-white/50">{selectedProduct.code}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <label className="flex items-center gap-2 text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      disabled={uploading}
                      className="w-4 h-4"
                    />
                    <span>Marcar como principal (DEF)</span>
                  </label>
                  <label className="bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.1em] hover:bg-white/90 transition-colors cursor-pointer">
                    {uploading ? 'Subiendo...' : '+ Subir Imágenes'}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="space-y-3">
                  {selectedProduct.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-4 p-3 border ${
                        idx === 0 ? 'border-green-500/50 bg-green-500/5' : 'border-white/10'
                      }`}
                    >
                      <div className="w-16 h-16 bg-white/10 overflow-hidden flex-shrink-0">
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/50 truncate">{img.split('/').pop()}</p>
                        {idx === 0 && (
                          <span className="text-xs text-green-400">✓ Imagen principal</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Crop button */}
                        <button
                          onClick={() => setCropModal({ imageUrl: img, imageIndex: idx })}
                          className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
                          title="Recortar imagen"
                        >
                          ✂
                        </button>
                        {idx !== 0 && (
                          <button
                            onClick={() => handleSetPrimary(idx)}
                            className="px-3 py-1 text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
                            title="Hacer principal"
                          >
                            ★
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteImage(img, idx)}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/20">
                  <p className="text-white/50 text-sm">No hay imágenes</p>
                  <p className="text-white/30 text-xs mt-2">Sube imágenes para este producto</p>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 text-xs">
                <p className="text-blue-400 mb-2">
                  <strong>💡 Información:</strong>
                </p>
                <ul className="text-blue-300 space-y-1 ml-4 list-disc">
                  <li>El nombre del archivo se mantiene tal como lo subes</li>
                  <li>Marca "Marcar como principal" para que la imagen vaya al inicio</li>
                  <li>O incluye "DEF" en el nombre del archivo para que sea principal automáticamente</li>
                  <li>Usa ✂ para recortar una imagen directamente desde el navegador</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/50">Selecciona un producto de la lista</p>
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {cropModal && (
        <ImageCropModal
          imageUrl={cropModal.imageUrl}
          imageIndex={cropModal.imageIndex}
          productCode={selectedProduct.code}
          categoryId={selectedProduct.category_id}
          onClose={() => setCropModal(null)}
          onCropSaved={handleCropSaved}
        />
      )}
    </div>
  );
}
