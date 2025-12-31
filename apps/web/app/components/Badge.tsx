import { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "primary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  primary: "bg-primary/10 text-primary",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  rounded = false,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${rounded ? "rounded-full" : "rounded-md"}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success"
              ? "bg-green-500"
              : variant === "warning"
              ? "bg-amber-500"
              : variant === "error"
              ? "bg-red-500"
              : variant === "info"
              ? "bg-blue-500"
              : variant === "primary"
              ? "bg-primary"
              : "bg-gray-500"
          }`}
        />
      )}
      {children}
    </span>
  );
}

// Status Badge for bookings
type StatusType = "confirmed" | "pending" | "cancelled" | "completed" | "no-show";

interface StatusBadgeProps {
  status: StatusType;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: "নিশ্চিত", variant: "success" },
  pending: { label: "অপেক্ষমান", variant: "warning" },
  cancelled: { label: "বাতিল", variant: "error" },
  completed: { label: "সম্পন্ন", variant: "info" },
  "no-show": { label: "অনুপস্থিত", variant: "default" },
};

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

// Tag component for amenities etc.
interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md ${className}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </span>
  );
}
