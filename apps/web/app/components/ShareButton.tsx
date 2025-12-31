"use client";

import { useState, useEffect, useRef } from "react";
import {
  HiOutlineShare,
  HiOutlineLink,
  HiOutlineXMark,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { FaWhatsapp, FaFacebookF, FaTwitter } from "react-icons/fa";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({ title, text, url, className = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShareUrl(url || window.location.href);
  }, [url]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or error, fall through to custom UI
      }
    }
    // Show custom share sheet
    setIsOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: FaWhatsapp,
      color: "bg-green-500",
      href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,
    },
    {
      name: "Facebook",
      icon: FaFacebookF,
      color: "bg-blue-600",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      color: "bg-sky-500",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <>
      {/* Share Button */}
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors ${className}`}
      >
        <HiOutlineShare className="w-5 h-5" />
        <span className="hidden sm:inline">শেয়ার</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
      )}

      {/* Bottom Sheet */}
      {isOpen && (
        <div
          ref={sheetRef}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl animate-in slide-in-from-bottom duration-300"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">শেয়ার করুন</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{title}</p>
              <p className="text-xs text-gray-500 mt-1 truncate">{shareUrl}</p>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center gap-6 mb-6">
              {shareOptions.map((option) => (
                <a
                  key={option.name}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform`}
                  >
                    <option.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-gray-600">{option.name}</span>
                </a>
              ))}
            </div>

            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                copied
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? (
                <>
                  <HiOutlineCheckCircle className="w-5 h-5" />
                  লিংক কপি হয়েছে!
                </>
              ) : (
                <>
                  <HiOutlineLink className="w-5 h-5" />
                  লিংক কপি করুন
                </>
              )}
            </button>
          </div>

          {/* Safe Area */}
          <div className="h-6" />
        </div>
      )}
    </>
  );
}
