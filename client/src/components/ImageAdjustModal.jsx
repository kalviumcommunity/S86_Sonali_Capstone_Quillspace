import { useState, useEffect } from 'react';
import CoverImage from './CoverImage';
import {
  X,
  Sliders,
  RotateCcw,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
} from 'lucide-react';

/**
 * ImageAdjustModal
 * Dedicated ADJUST tool:
 * - Controls how the image is positioned/framed inside the standard 16:9 blog-cover frame
 * - Does NOT crop or permanently alter the original image file
 * - Allows adjusting zoom/scale, horizontal & vertical position, and fit mode
 * - Saves framing settings for Home, Profile, and Blog Details display
 */
const ImageAdjustModal = ({ isOpen, imageUrl, currentSettings, onClose, onSave }) => {
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [fit, setFit] = useState('contain'); // 'contain' | 'cover'

  // Initialize from current settings when opened
  useEffect(() => {
    if (!isOpen) return;
    setZoom(currentSettings?.zoom !== undefined ? Number(currentSettings.zoom) : 1);
    setPosX(currentSettings?.x !== undefined ? Number(currentSettings.x) : 50);
    setPosY(currentSettings?.y !== undefined ? Number(currentSettings.y) : 50);
    setFit(currentSettings?.fit || 'contain');
  }, [isOpen, currentSettings]);

  const handleReset = () => {
    setZoom(1);
    setPosX(50);
    setPosY(50);
    setFit('contain');
  };

  const handleApply = () => {
    onSave({
      zoom,
      x: posX,
      y: posY,
      fit,
    });
    onClose();
  };

  if (!isOpen || !imageUrl) return null;

  const tempSettings = { zoom, x: posX, y: posY, fit };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent/20 rounded-lg text-accent">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">Adjust 16:9 Frame Display</h3>
              <p className="text-xs text-text-secondary">
                Control framing and positioning without altering the original image.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text rounded-lg hover:bg-bg/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Live 16:9 Preview */}
          <div>
            <div className="flex items-center justify-between text-xs text-text-secondary/80 mb-2 px-1">
              <span>Live 16:9 Blog Cover Preview</span>
              <span className="text-accent">{fit === 'contain' ? 'Full Image (Uncropped)' : 'Fill Frame'}</span>
            </div>
            <CoverImage
              src={imageUrl}
              settings={tempSettings}
              alt="Framing preview"
              className="rounded-xl border border-border"
            />
          </div>

          {/* Fit Mode Toggle */}
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-text-secondary w-20">Fit Mode</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFit('contain')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  fit === 'contain'
                    ? 'bg-accent text-white'
                    : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
                }`}
              >
                <Minimize className="w-3.5 h-3.5" /> Contain (Show Full Image)
              </button>
              <button
                type="button"
                onClick={() => setFit('cover')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  fit === 'cover'
                    ? 'bg-accent text-white'
                    : 'bg-bg/50 border border-border text-text-secondary hover:text-text'
                }`}
              >
                <Maximize className="w-3.5 h-3.5" /> Fill (Cover 16:9)
              </button>
            </div>
          </div>

          {/* Scale / Zoom Slider */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary w-20">Scale</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
              className="p-1 text-text-secondary hover:text-accent"
              title="Scale Down"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <input
              type="range"
              min="0.8"
              max="2"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
            />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2, Number((z + 0.1).toFixed(1))))}
              className="p-1 text-text-secondary hover:text-accent"
              title="Scale Up"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs text-text-secondary/80 w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Horizontal Position (X%) */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary w-20">Position X</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={posX}
              onChange={(e) => setPosX(parseInt(e.target.value))}
              className="flex-1 accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
            />
            <span className="text-xs text-text-secondary/80 w-12 text-right">
              {posX}%
            </span>
          </div>

          {/* Vertical Position (Y%) */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-text-secondary w-20">Position Y</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={posY}
              onChange={(e) => setPosY(parseInt(e.target.value))}
              className="flex-1 accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
            />
            <span className="text-xs text-text-secondary/80 w-12 text-right">
              {posY}%
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg/30">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-text-secondary/80 hover:text-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors text-sm"
            >
              <Check className="w-4 h-4" /> Save Framing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAdjustModal;
