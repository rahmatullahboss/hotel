"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
  action: () => void;
}

const defaultShortcuts: Shortcut[] = [
  {
    key: "n",
    description: "নতুন বুকিং",
    action: () => {}, // Will be set dynamically
  },
  {
    key: "s",
    description: "স্ক্যানার",
    action: () => {},
  },
  {
    key: "/",
    description: "সার্চ",
    action: () => {},
  },
  {
    key: "b",
    description: "বুকিং লিস্ট",
    action: () => {},
  },
  {
    key: "h",
    description: "হোম",
    action: () => {},
  },
  {
    key: "Escape",
    description: "মোডাল বন্ধ করুন",
    action: () => {},
  },
];

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onShowHelp?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, onShowHelp } = options;
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Show help overlay with ? key
      if (event.key === "?" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onShowHelp?.();
        return;
      }

      // Handle shortcuts
      const key = event.key.toLowerCase();

      switch (key) {
        case "n":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push("/bookings/new");
          }
          break;
        case "s":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push("/scanner");
          }
          break;
        case "/":
          event.preventDefault();
          // Focus search input if exists
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="text"][placeholder*="Search"], input[type="search"]'
          );
          searchInput?.focus();
          break;
        case "b":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push("/bookings");
          }
          break;
        case "h":
          if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            router.push("/");
          }
          break;
        case "escape":
          // Close any open modal or dropdown
          document.dispatchEvent(new CustomEvent("close-all-modals"));
          break;
      }
    },
    [router, onShowHelp]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { shortcuts: defaultShortcuts };
}

// Keyboard shortcuts help overlay
interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "N", description: "নতুন বুকিং" },
    { key: "S", description: "স্ক্যানার" },
    { key: "/", description: "সার্চ ফোকাস" },
    { key: "B", description: "বুকিং লিস্ট" },
    { key: "H", description: "হোম" },
    { key: "?", description: "শর্টকাট হেল্প" },
    { key: "Esc", description: "মোডাল বন্ধ" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              ⌨️ কীবোর্ড শর্টকাট
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-none"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md min-w-[2rem] text-center">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
