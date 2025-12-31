"use client";

import { useState, useEffect } from "react";
import { HiOutlineArrowUp } from "react-icons/hi2";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9998,
        width: "48px",
        height: "48px",
        backgroundColor: "#E63946",
        color: "#ffffff",
        borderRadius: "50%",
        border: "none",
        boxShadow: "0 4px 20px rgba(230, 57, 70, 0.4)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 6px 25px rgba(230, 57, 70, 0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(230, 57, 70, 0.4)";
      }}
    >
      <HiOutlineArrowUp style={{ width: "20px", height: "20px" }} />
    </button>
  );
}
