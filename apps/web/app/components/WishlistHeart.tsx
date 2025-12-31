"use client";

import { useState } from "react";
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";

interface WishlistHeartProps {
  isWishlisted: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function WishlistHeart({
  isWishlisted,
  onToggle,
  size = "md",
  className = "",
}: WishlistHeartProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnimating(true);
    onToggle();

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-all ${
        isWishlisted
          ? "bg-red-50 text-red-500"
          : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
      } backdrop-blur-sm shadow-sm hover:shadow ${className}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isWishlisted ? (
        <HiHeart
          className={`${sizes[size]} ${
            isAnimating ? "animate-ping-once" : ""
          } transition-transform`}
        />
      ) : (
        <HiOutlineHeart
          className={`${sizes[size]} transition-transform hover:scale-110`}
        />
      )}

      {/* CSS for ping animation */}
      <style jsx>{`
        @keyframes ping-once {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        .animate-ping-once {
          animation: ping-once 0.3s ease-in-out;
        }
      `}</style>
    </button>
  );
}
