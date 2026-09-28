import { useState } from 'react';
import { getImageUrl } from '../utils/image';

/**
 * Standard 16:9 Cover Image component across QuillSpace.
 * - Enforces 16:9 container aspect ratio (aspect-video)
 * - Uses object-fit: contain by default so user images are NEVER cropped
 * - Renders a subtle blurred ambient background matching the image colors
 * - Supports custom framing adjustments (zoom, position X/Y, fit mode)
 */
const CoverImage = ({
  src,
  settings,
  alt = 'Post cover',
  className = '',
  imageClassName = '',
  aspectRatioClass = 'aspect-video',
}) => {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = getImageUrl(src);

  if (!src || hasError) {
    return null;
  }

  const fit = settings?.fit || 'contain';
  const zoom = settings?.zoom !== undefined ? Number(settings.zoom) : 1;
  const posX = settings?.x !== undefined ? Number(settings.x) : 50;
  const posY = settings?.y !== undefined ? Number(settings.y) : 50;

  const objectFitClass = fit === 'cover' ? 'object-cover' : 'object-contain';
  const style = {
    objectPosition: `${posX}% ${posY}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
  };

  return (
    <div
      className={`relative w-full ${aspectRatioClass} overflow-hidden rounded-xl bg-surface/90 border border-border/60 flex items-center justify-center ${className}`}
    >
      {/* Subtle blurred ambient backdrop matching the image colors */}
      <img
        src={resolvedUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-25 select-none pointer-events-none"
      />
      {/* Dark overlay for clean contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Uncropped foreground image with optional framing adjustment */}
      <img
        src={resolvedUrl}
        alt={alt}
        style={style}
        className={`relative z-10 w-full h-full ${objectFitClass} transition-transform duration-200 ${imageClassName}`}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default CoverImage;
