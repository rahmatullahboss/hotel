"use client";

export function GooglePlayLogo({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className={className}
            width="48px"
            height="48px"
        >
            <path
                fill="#4DB6AC"
                d="M7.705,4.19l31.545,17.925c0.98,0.56,0.98,1.975,0,2.535L7.705,42.575c-1.02,0.58-2.285-0.165-2.285-1.335V5.525C5.42,4.355,6.685,3.61,7.705,4.19z"
            />
            <path
                fill="#43A047"
                d="M39.25,22.115l-6.95-3.95L25.39,25.075L39.25,22.115z"
            />
            <path
                fill="#3771C8"
                d="M5.42,5.525c0-0.45,0.18-0.885,0.495-1.2L25.39,22.825L5.42,5.525z"
            />
            <path
                fill="#FFB300"
                d="M25.39,22.825L5.915,42.3c-0.315-0.315-0.495-0.75-0.495-1.2V22.825H25.39z"
            />
            {/* Detailed multicolored paths for specific Google Play look */}
            <path
                fill="#EA4335"
                d="M25.39,25.075L5.915,4.325c-0.315,0.315-0.495,0.75-0.495,1.2v35.715c0,0.45,0.18,0.885,0.495,1.2L25.39,25.075z"
                style={{ display: "none" }} // Hiding simple paths if using detailed ones below
            />

            {/* Official Colors - Triangles */}
            <path fill="#2196F3" d="M 5.9 4.2 L 5.9 42.6 L 25.4 23.4 L 5.9 4.2 Z" />
            <path fill="#FFC107" d="M 25.4 23.4 L 5.9 42.6 L 39.2 23.4 L 25.4 23.4 Z" />
            <path fill="#4CAF50" d="M 25.4 23.4 L 39.2 23.4 L 5.9 4.2 L 25.4 23.4 Z" />
            <path fill="#F44336" d="M 39.2 23.4 L 5.9 42.6 L 5.9 4.2 L 39.2 23.4 Z" style={{ display: "none" }} />

            {/* Correct Official SVG Paths commonly used */}
            <path fill="#2196F3" d="M 6.7,4.7 L 6.7,43.3 L 26,24 L 6.7,4.7 Z" />
            <path fill="#4CAF50" d="M 26,24 L 6.7,4.7 L 35.8,21.2 L 26,24 Z" />
            <path fill="#FFC107" d="M 26,24 L 35.8,26.8 L 6.7,43.3 L 26,24 Z" />
            <path fill="#F44336" d="M 35.8,21.2 L 35.8,26.8 L 44,22.2 C 45.3,21.5 45.3,19.6 44,18.9 L 35.8,21.2 Z" />
        </svg>
    );
}
