"use client";

import { useState, ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
}

const variants = {
  default: {
    container: "bg-gray-100 p-1 rounded-xl",
    tab: "rounded-lg",
    active: "bg-white text-gray-900 shadow-sm",
    inactive: "text-gray-600 hover:text-gray-900",
  },
  pills: {
    container: "gap-2",
    tab: "rounded-full",
    active: "bg-primary text-white",
    inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200",
  },
  underline: {
    container: "border-b border-gray-200 gap-4",
    tab: "pb-3 border-b-2 -mb-px",
    active: "border-primary text-primary",
    inactive: "border-transparent text-gray-600 hover:text-gray-900",
  },
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export function Tabs({
  tabs,
  defaultTab,
  onChange,
  variant = "default",
  size = "md",
  className = "",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const style = variants[variant];
  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className={`flex ${style.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              flex items-center gap-2 font-medium transition-all
              ${style.tab}
              ${sizes[size]}
              ${activeTab === tab.id ? style.active : style.inactive}
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeContent && (
        <div className="mt-4 animate-in fade-in duration-200">
          {activeContent}
        </div>
      )}
    </div>
  );
}

// Controlled Tabs for external state
interface ControlledTabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ControlledTabs({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  size = "md",
  className = "",
}: ControlledTabsProps) {
  const style = variants[variant];

  return (
    <div className={`flex ${style.container} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 font-medium transition-all
            ${style.tab}
            ${sizes[size]}
            ${activeTab === tab.id ? style.active : style.inactive}
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
