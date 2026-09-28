import { useState, useRef, useEffect, useCallback } from 'react';
import { getImageUrl } from '../utils/image';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  Loader2,
  Crop,
  Square,
  RectangleHorizontal,
  Maximize2,
} from 'lucide-react';

/**
 * ImageCropModal
 * Dedicated CROP tool:
 * - Allows user to select an area to keep
 * - Supports Free crop, 16:9, 1:1, 4:3
 * - Allows zoom and moving/resizing the crop area
 * - "Apply Crop" generates the cropped image and uploads it to /api/upload
 * - "Cancel" keeps the previous image unchanged
 */
const ImageCropModal = ({ isOpen, imageUrl, onClose, onSave, api }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '1:1', '4:3', 'free'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 }); // image pan offset
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // percentage of container
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [isResizingBox, setIsResizingBox] = useState(false);
  const [activeHandle, setActiveHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');

  // Reset transforms and crop box
  const initCropBox = useCallback((aspect) => {
    if (aspect === '16:9') {
      setCropBox({ x: 5, y: 20, width: 90, height: 60 });
    } else if (aspect === '1:1') {
      setCropBox({ x: 20, y: 10, width: 60, height: 80 });
    } else if (aspect === '4:3') {
      setCropBox({ x: 10, y: 15, width: 80, height: 70 });
    } else {
      setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setError('');
    setImageLoaded(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setAspectRatio('16:9');
    initCropBox('16:9');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getImageUrl(imageUrl);

    img.onload = () => {
      imageRef.current = img;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
    };

    img.onerror = () => {
      setError('Failed to load image for cropping. Please verify the URL.');
    };
  }, [isOpen, imageUrl, initCropBox]);

  const handleAspectChange = (aspect) => {
    setAspectRatio(aspect);
    initCropBox(aspect);
  };

  // Dragging crop box
  const handleBoxPointerDown = (e) => {
    e.stopPropagation();
    setIsDraggingBox(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    });
  };

  // Resizing crop box from handles
  const handleResizePointerDown = (e, handle) => {
    e.stopPropagation();
    setIsResizingBox(true);
    setActiveHandle(handle);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxW: cropBox.width,
      boxH: cropBox.height,
    });
  };

  const handlePointerMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (isDraggingBox) {
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      let newX = Math.max(0, Math.min(100 - cropBox.width, dragStart.boxX + deltaX));
      let newY = Math.max(0, Math.min(100 - cropBox.height, dragStart.boxY + deltaY));

      setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isResizingBox && activeHandle) {
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      let newW = cropBox.width;
      let newH = cropBox.height;
      let newX = cropBox.x;
      let newY = cropBox.y;

      if (activeHandle.includes('e')) {
        newW = Math.max(15, Math.min(100 - dragStart.boxX, dragStart.boxW + deltaX));
      }
      if (activeHandle.includes('s')) {
        newH = Math.max(15, Math.min(100 - dragStart.boxY, dragStart.boxH + deltaY));
      }
      if (activeHandle.includes('w')) {
        const potentialW = dragStart.boxW - deltaX;
        if (potentialW >= 15 && dragStart.boxX + deltaX >= 0) {
          newW = potentialW;
          newX = dragStart.boxX + deltaX;
        }
      }
      if (activeHandle.includes('n')) {
        const potentialH = dragStart.boxH - deltaY;
        if (potentialH >= 15 && dragStart.boxY + deltaY >= 0) {
          newH = potentialH;
          newY = dragStart.boxY + deltaY;
        }
      }

      // Maintain aspect ratio if not free
      if (aspectRatio === '16:9') {
        const aspectMultiplier = (rect.width / rect.height) * (9 / 16);
        newH = newW * aspectMultiplier;
      } else if (aspectRatio === '1:1') {
        const aspectMultiplier = rect.width / rect.height;
        newH = newW * aspectMultiplier;
      } else if (aspectRatio === '4:3') {
        const aspectMultiplier = (rect.width / rect.height) * (3 / 4);
        newH = newW * aspectMultiplier;
      }

      setCropBox({
        x: Math.max(0, Math.min(100 - newW, newX)),
        y: Math.max(0, Math.min(100 - newH, newY)),
        width: Math.min(100 - newX, newW),
        height: Math.min(100 - newY, newH),
      });
    }
  };

  const handlePointerUp = () => {
    setIsDraggingBox(false);
    setIsResizingBox(false);
    setActiveHandle(null);
  };

  // Perform actual Canvas Crop & Upload
  const handleApplyCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;

    setIsApplying(true);
    setError('');

    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      const img = imageRef.current;

      // Calculate displayed image bounds within container
      const containerAspect = containerRect.width / containerRect.height;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      let renderW, renderH, renderX, renderY;
      if (imgAspect > containerAspect) {
        renderW = containerRect.width * zoom;
        renderH = (containerRect.width / imgAspect) * zoom;
      } else {
        renderH = containerRect.height * zoom;
        renderW = containerRect.height * imgAspect * zoom;
      }

      renderX = (containerRect.width - renderW) / 2 + pan.x;
      renderY = (containerRect.height - renderH) / 2 + pan.y;

      // Crop box in container pixel coordinates
      const cropPxX = (cropBox.x / 100) * containerRect.width;
      const cropPxY = (cropBox.y / 100) * containerRect.height;
      const cropPxW = (cropBox.width / 100) * containerRect.width;
      const cropPxH = (cropBox.height / 100) * containerRect.height;

      // Source image crop coordinates
      const scaleToNatural = img.naturalWidth / renderW;
      const sourceX = Math.max(0, (cropPxX - renderX) * scaleToNatural);
      const sourceY = Math.max(0, (cropPxY - renderY) * scaleToNatural);
      const sourceW = Math.min(img.naturalWidth - sourceX, cropPxW * scaleToNatural);
      const sourceH = Math.min(img.naturalHeight - sourceY, cropPxH * scaleToNatural);

      if (sourceW <= 0 || sourceH <= 0) {
        throw new Error('Invalid crop area selection.');
      }

      // Draw onto output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = Math.round(sourceW);
      outputCanvas.height = Math.round(sourceH);
      const ctx = outputCanvas.getContext('2d');

      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
      );

      // Convert to blob and upload
      const blob = await new Promise((resolve) => {
        outputCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
      });

      if (!blob) throw new Error('Could not create cropped image.');

      const formData = new FormData();
      formData.append('image', blob, `cropped-${Date.now()}.jpg`);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newUrl = res.data?.data?.imageUrl || res.data?.data?.url;
      if (newUrl) {
        onSave(newUrl);
        onClose();
      } else {
        throw new Error('Failed to retrieve uploaded crop URL.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to apply crop');
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent/20 rounded-lg text-accent">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">Crop Image</h3>
              <p className="text-xs text-text-secondary">
                Select the area of the image to keep and apply crop.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isApplying}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-bg/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* Aspect Ratio Presets Bar */}
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <span className="text-xs font-semibold text-text-secondary mr-2">Aspect Ratio:</span>
            <button
              type="button"
              onClick={() => handleAspectChange('16:9')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === '16:9'
                  ? 'bg-accent text-white'
                  : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
              }`}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" /> 16:9 (Landscape)
            </button>
            <button
              type="button"
              onClick={() => handleAspectChange('1:1')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === '1:1'
                  ? 'bg-accent text-white'
                  : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
              }`}
            >
              <Square className="w-3.5 h-3.5" /> 1:1 (Square)
            </button>
            <button
              type="button"
              onClick={() => handleAspectChange('4:3')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === '4:3'
                  ? 'bg-accent text-white'
                  : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
              }`}
            >
              <RectangleHorizontal className="w-3.5 h-3.5" /> 4:3 (Standard)
            </button>
            <button
              type="button"
              onClick={() => handleAspectChange('free')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                aspectRatio === 'free'
                  ? 'bg-accent text-white'
                  : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" /> Free Crop
            </button>
          </div>

          {/* Interactive Crop Stage */}
          <div
            ref={containerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border border-border bg-[#0b101b] select-none flex items-center justify-center touch-none"
          >
            {imageLoaded && (
              <>
                {/* Scaled & Contained Image */}
                <img
                  src={getImageUrl(imageUrl)}
                  alt="Crop Source"
                  style={{
                    transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  }}
                  className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-75"
                />

                {/* Dark Mask around crop box */}
                <div className="absolute inset-0 bg-black/60 pointer-events-none" />

                {/* Clear Crop Box Window */}
                <div
                  onPointerDown={handleBoxPointerDown}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                  className="absolute border-2 border-accent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] cursor-move group touch-none"
                >
                  {/* Grid lines (Rule of thirds) */}
                  <div className="w-full h-full grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-r border-b border-white/40" />
                    <div className="border-b border-white/40" />
                    <div className="border-r border-white/40" />
                    <div className="border-r border-white/40" />
                    <div />
                  </div>

                  {/* Corner Resize Handles */}
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-accent rounded-full border border-white cursor-nwse-resize"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent rounded-full border border-white cursor-nesw-resize"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-accent rounded-full border border-white cursor-nesw-resize"
                  />
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-accent rounded-full border border-white cursor-nwse-resize"
                  />
                </div>
              </>
            )}

            {!imageLoaded && !error && (
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <Loader2 className="w-5 h-5 animate-spin text-accent" /> Loading image...
              </div>
            )}
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-xs font-semibold text-text-secondary w-14">Zoom</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(1))))}
              className="p-1 text-text-secondary hover:text-accent"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
              className="p-1 text-text-secondary hover:text-accent"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs text-text-secondary/80 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg/30">
          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
              initCropBox(aspectRatio);
            }}
            className="flex items-center gap-1.5 text-xs text-text-secondary/80 hover:text-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Selection
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isApplying || !imageLoaded}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Cropping...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Apply Crop
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
