import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = null,
  onLoad = null,
  onError = null,
  onClick = null,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    if (onLoad) onLoad();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError();
  }, [onError]);

  const handleClick = useCallback(() => {
    if (onClick && src && !hasError) onClick();
  }, [onClick, src, hasError]);

  useEffect(() => {
    const currentRef = imgRef.current;

    if (!currentRef) return;

    // Create intersection observer with better performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setIsLoading(true);
            // Disconnect observer once image is in view
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(currentRef);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
    >
      {!isInView ? (
        // Placeholder while not in view
        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          {placeholder || (
            <Camera className="h-6 w-6 text-gray-400" />
          )}
        </div>
      ) : hasError ? (
        // Error state
        <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500">
          <AlertCircle className="h-4 w-4" />
        </div>
      ) : (
        // Image container
        <div className="relative w-full h-full">
          {isLoading && !isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          {src && (
            <img
              src={src}
              alt={alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleLoad}
              onError={handleError}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default LazyImage;
