"use client";

import { useState } from "react";
import { HiStar, HiOutlineStar } from "react-icons/hi2";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  showValue = false,
  interactive = false,
  onChange,
  className = "",
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const value = i + 1;
        const isFilled = value <= displayRating;
        const isHalf = value - 0.5 === displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${interactive ? "cursor-pointer" : "cursor-default"} transition-transform ${
              interactive ? "hover:scale-110" : ""
            }`}
          >
            {isFilled || isHalf ? (
              <HiStar className={`${sizes[size]} text-amber-400`} />
            ) : (
              <HiOutlineStar className={`${sizes[size]} text-gray-300`} />
            )}
          </button>
        );
      })}

      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Compact rating display (e.g., "4.5 ★")
interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
  className?: string;
}

export function RatingBadge({
  rating,
  reviewCount,
  size = "md",
  className = "",
}: RatingBadgeProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded ${
        isSmall ? "text-xs" : "text-sm"
      } font-semibold ${className}`}
    >
      <span>{rating.toFixed(1)}</span>
      <HiStar className={isSmall ? "w-3 h-3" : "w-4 h-4"} />
      {reviewCount !== undefined && (
        <span className="text-white/80 font-normal">({reviewCount})</span>
      )}
    </div>
  );
}
