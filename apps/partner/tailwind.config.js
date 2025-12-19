/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "var(--color-primary)",
                accent: "var(--color-accent)",
                success: "var(--color-success)",
                warning: "var(--color-warning)",
                error: "var(--color-error)",
            },
        },
    },
    plugins: [],
};
