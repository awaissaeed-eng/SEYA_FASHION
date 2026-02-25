import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  getResponsiveVideoUrls,
  getVideoPosterUrl,
  getAdaptiveVideoSources,
  isCloudinaryUrl,
  preloadMedia,
} from '../../utils/cloudinaryOptimization';
import { getVideoUrl } from '../../utils/imageUrl';

/**
 * OptimizedVideo Component
 * Provides responsive, lazy-loaded videos with adaptive streaming
 */
export function OptimizedVideo({
  src,
  className = '',
  autoPlay = false,
  loop = false,
  muted = true,
  controls = false,
  playsInline = true,
  priority = false,
  poster,
  onLoad,
  onError,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Get optimized URLs
  const videoUrl = isCloudinaryUrl(src) ? src : getVideoUrl(src);
  const videoSources = getAdaptiveVideoSources(videoUrl);
  const posterUrl = poster || (isCloudinaryUrl(videoUrl) ? getVideoPosterUrl(videoUrl) : '');

  // Preload if priority
  useEffect(() => {
    if (priority && posterUrl) {
      preloadMedia(posterUrl, 'image');
    }
  }, [priority, posterUrl]);

  // Handle load
  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  // Handle error
  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Handle play/pause
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  // Auto-play on mount if specified
  useEffect(() => {
    if (autoPlay && videoRef.current && loaded) {
      videoRef.current.play().catch((err) => {
        console.warn('Auto-play failed:', err);
      });
    }
  }, [autoPlay, loaded]);

  // Error state
  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <svg
            className="w-12 h-12 mx-auto text-gray-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs text-gray-400">Video not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        poster={posterUrl}
        preload={priority ? 'auto' : 'metadata'}
        onLoadedData={handleLoad}
        onError={handleError}
        onPlay={handlePlay}
        onPause={handlePause}
        {...rest}
      >
        {videoSources.map((source, index) => (
          <source
            key={index}
            src={source.src}
            type={source.type}
            media={source.media}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Loading overlay */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      {/* Play button overlay (for non-autoplay videos) */}
      {!autoPlay && !controls && !isPlaying && loaded && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => videoRef.current?.play()}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#592a0d] ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </motion.button>
      )}
    </div>
  );
}

/**
 * OptimizedBackgroundVideo Component
 * For background videos with overlay
 */
export function OptimizedBackgroundVideo({
  src,
  className = '',
  children,
  overlay = true,
  overlayOpacity = 0.5,
  ...videoProps
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background video */}
      <div className="absolute inset-0">
        <OptimizedVideo
          src={src}
          className="w-full h-full"
          autoPlay
          loop
          muted
          playsInline
          {...videoProps}
        />
      </div>

      {/* Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default OptimizedVideo;
