"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "zinurooms-cookie-consent";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "16px",
        right: "16px",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Icon & Text */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>🍪</span>
                <div>
                  <h3
                    style={{
                      fontWeight: "700",
                      color: "#111827",
                      marginBottom: "4px",
                      fontSize: "16px",
                    }}
                  >
                    কুকি ব্যবহারের অনুমতি
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      lineHeight: "1.5",
                      margin: 0,
                    }}
                  >
                    আমরা আপনার অভিজ্ঞতা উন্নত করতে কুকি ব্যবহার করি।{" "}
                    <Link
                      href="/privacy"
                      style={{ color: "#E63946", textDecoration: "underline" }}
                    >
                      গোপনীয়তা নীতি
                    </Link>{" "}
                    পড়ুন।
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={handleDecline}
                style={{
                  padding: "10px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                  backgroundColor: "transparent",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                প্রত্যাখ্যান
              </button>
              <button
                onClick={handleAccept}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#ffffff",
                  backgroundColor: "#E63946",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                গ্রহণ করুন
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: "4px", backgroundColor: "#f3f4f6" }}>
          <div
            style={{
              height: "100%",
              width: "100%",
              backgroundColor: "#E63946",
            }}
          />
        </div>
      </div>
    </div>
  );
}
