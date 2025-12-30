"use client";

import { useTheme } from "./ThemeProvider";
import { MdLightMode, MdDarkMode } from "react-icons/md";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-icon btn-outline"
      aria-label="Toggle theme"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      style={{
        width: "40px",
        height: "40px",
        padding: 0,
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-primary)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {resolvedTheme === "dark" ? (
        <MdLightMode size={20} />
      ) : (
        <MdDarkMode size={20} />
      )}
    </button>
  );
}
