"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-4xl">🏨</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur skeleton while loading */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse"
          style={{ width, height }}
        />
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

// Hotel Image with fallback
interface HotelImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}

export function HotelImage({
  src,
  alt,
  className = "",
  fill = false,
  priority = false,
}: HotelImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Default fallback image
  const fallbackImage = "/images/hotel-placeholder.jpg";
  const imageSrc = hasError || !src ? fallbackImage : src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading blur */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-pulse z-10" />
      )}

      <Image
        src={imageSrc}
        alt={alt}
        fill={fill}
        priority={priority}
        className={`object-cover transition-all duration-300 ${
          isLoading ? "opacity-0 scale-105" : "opacity-100 scale-100"
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
