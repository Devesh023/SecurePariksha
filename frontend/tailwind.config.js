/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        background: "#0a0a0c",
        foreground: "#f4f4f7",
        primary: {
          DEFAULT: "#6366f1", // indigo 500
          hover: "#4f46e5",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e1b4b", // deep indigo
          foreground: "#e0e7ff",
        },
        card: {
          DEFAULT: "#13131a",
          border: "rgba(255, 255, 255, 0.05)",
          foreground: "#f4f4f7",
        },
        success: {
          DEFAULT: "#10b981", // emerald 500
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#f59e0b", // amber 500
          foreground: "#000000",
        },
        destructive: {
          DEFAULT: "#ef4444", // red 500
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#8e919e",
          foreground: "#313545",
        }
      },
    },
  },
  plugins: [],
}
