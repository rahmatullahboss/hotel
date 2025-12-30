"use client";

import { useEffect, useRef, useState } from "react";
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat } from "react-icons/md";

interface AnimatedStatCardProps {
  /** The numeric value to display with animation */
  value: number;
  /** Label shown below the value */
  label: string;
  /** Icon emoji or element to show */
  icon: string;
  /** Optional prefix like "৳" for currency */
  prefix?: string;
  /** Optional suffix like "%" */
  suffix?: string;
  /** Trend percentage (positive for up, negative for down) */
  trend?: number;
  /** Trend label like "vs last week" */
  trendLabel?: string;
  /** Background color class for the icon */
  iconBgClass?: string;
  /** Additional CSS class */
  className?: string;
  /** Animation delay in seconds for staggered animations */
  delay?: number;
}

function useCountAnimation(targetValue: number, duration = 800) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(easeOutQuart * targetValue);

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
}

export function AnimatedStatCard({
  value,
  label,
  icon,
  prefix = "",
  suffix = "",
  trend,
  trendLabel,
  iconBgClass = "gradient-primary",
  className = "",
  delay = 0,
}: AnimatedStatCardProps) {
  const animatedValue = useCountAnimation(value);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + "M";
    }
    if (val >= 1000) {
      return (val / 1000).toFixed(val >= 10000 ? 0 : 1) + "K";
    }
    return val.toLocaleString();
  };

  const TrendIcon = trend && trend > 0 
    ? MdTrendingUp 
    : trend && trend < 0 
    ? MdTrendingDown 
    : MdTrendingFlat;

  return (
    <div
      ref={cardRef}
      className={`stat-card-premium ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s ease ${delay}s`,
      }}
    >
      <div className={`stat-icon ${iconBgClass}`} style={{ color: "white" }}>
        {icon}
      </div>

      <div className="stat-value animate-count-up">
        {prefix}
        {formatValue(animatedValue)}
        {suffix}
      </div>

      <div className="stat-label">{label}</div>

      {typeof trend === "number" && (
        <div
          className={`stat-trend ${
            trend > 0 ? "stat-trend-up" : trend < 0 ? "stat-trend-down" : ""
          }`}
        >
          <TrendIcon size={14} />
          <span>
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && (
            <span style={{ fontWeight: 400, marginLeft: "4px" }}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
