"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
}

const colors = [
  "#E63946", // Primary red
  "#1D3557", // Navy
  "#FFD700", // Gold
  "#10B981", // Green
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
];

export function Confetti({ isActive, duration = 3000, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const generatePieces = useCallback(() => {
    const newPieces: ConfettiPiece[] = [];
    const pieceCount = 100;

    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)] ?? "#E63946",
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
      });
    }

    return newPieces;
  }, []);

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces());

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete, generatePieces]);

  if (!mounted || pieces.length === 0) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0",
          }}
        />
      ))}
      
      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>,
    document.body
  );
}

// Success celebration component
interface BookingSuccessProps {
  isVisible: boolean;
  bookingId?: string;
  hotelName?: string;
  onClose: () => void;
}

export function BookingSuccess({
  isVisible,
  bookingId,
  hotelName,
  onClose,
}: BookingSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      // Play success sound
      const audio = new Audio("/sounds/success.mp3");
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            বুকিং সফল হয়েছে!
          </h2>

          {/* Subtitle */}
          <p className="text-gray-600 mb-6">
            {hotelName ? (
              <>
                <span className="font-medium">{hotelName}</span> এ আপনার বুকিং নিশ্চিত হয়েছে।
              </>
            ) : (
              "আপনার বুকিং নিশ্চিত হয়েছে।"
            )}
          </p>

          {/* Booking ID */}
          {bookingId && (
            <div className="mb-6 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">বুকিং আইডি</p>
              <p className="font-mono font-bold text-gray-900">{bookingId}</p>
            </div>
          )}

          {/* Action */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            বুকিং দেখুন
          </button>
        </div>
      </div>
    </>
  );
}
