"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { HiOutlineArrowPath } from "react-icons/hi2";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
  secondary: "bg-gray-900 text-white hover:bg-gray-800",
  outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

const sizesClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <button
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200
        ${variants[variant]}
        ${sizesClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <HiOutlineArrowPath className="w-4 h-4 animate-spin" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
}

// Convenience exports for common button types
export function PrimaryButton(props: Omit<LoadingButtonProps, "variant">) {
  return <LoadingButton variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<LoadingButtonProps, "variant">) {
  return <LoadingButton variant="secondary" {...props} />;
}

export function OutlineButton(props: Omit<LoadingButtonProps, "variant">) {
  return <LoadingButton variant="outline" {...props} />;
}
