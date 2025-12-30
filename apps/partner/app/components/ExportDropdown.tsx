"use client";

import { useState } from "react";
import { 
  HiOutlineArrowDownTray,
  HiOutlineDocumentText,
  HiOutlineTableCells,
} from "react-icons/hi2";

type ExportFormat = "pdf" | "csv" | "excel";

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const exportOptions: { value: ExportFormat; label: string; icon: typeof HiOutlineDocumentText }[] = [
  { value: "pdf", label: "PDF", icon: HiOutlineDocumentText },
  { value: "csv", label: "CSV", icon: HiOutlineTableCells },
  { value: "excel", label: "Excel", icon: HiOutlineTableCells },
];

export function ExportButton({ onExport, className = "", disabled = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
        ) : (
          <HiOutlineArrowDownTray className="w-4 h-4 text-gray-500" />
        )}
        <span>Export</span>
      </button>

      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleExport(option.value)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
