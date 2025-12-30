"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { 
  HiOutlineCheckCircle, 
  HiOutlineExclamationCircle, 
  HiOutlineInformationCircle,
  HiOutlineXMark,
  HiOutlineBellAlert
} from "react-icons/hi2";

type ToastType = "success" | "error" | "warning" | "info" | "booking";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  newBooking: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      const duration = toast.duration ?? (toast.type === "booking" ? 8000 : 4000);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      // Play sound for new booking
      if (toast.type === "booking") {
        playNotificationSound();
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => addToast({ type: "success", title, message }),
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => addToast({ type: "error", title, message }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => addToast({ type: "warning", title, message }),
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => addToast({ type: "info", title, message }),
    [addToast]
  );

  const newBooking = useCallback(
    (title: string, message?: string) => addToast({ type: "booking", title, message }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info, newBooking }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Toast container
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Single toast item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: HiOutlineCheckCircle,
    error: HiOutlineExclamationCircle,
    warning: HiOutlineExclamationCircle,
    info: HiOutlineInformationCircle,
    booking: HiOutlineBellAlert,
  };

  const colors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    booking: "bg-gradient-to-r from-primary to-accent text-white border-transparent",
  };

  const iconColors = {
    success: "text-emerald-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
    booking: "text-white",
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm
        animate-in slide-in-from-right-full fade-in duration-300
        ${colors[toast.type]}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.message && (
          <p className={`text-xs mt-0.5 ${toast.type === "booking" ? "text-white/80" : "opacity-70"}`}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
          toast.type === "booking" 
            ? "hover:bg-white/20" 
            : "hover:bg-black/5"
        }`}
      >
        <HiOutlineXMark className="w-4 h-4" />
      </button>
    </div>
  );
}

// Notification sound
function playNotificationSound() {
  try {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch {
    // Audio not supported or blocked
  }
}
