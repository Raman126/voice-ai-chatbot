/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0B0D13",
          900: "#12141C",
          800: "#1A1D28",
          700: "#252838",
          600: "#343850",
        },
        signal: {
          DEFAULT: "#7C6CF6",
          soft: "#9C8FFF",
        },
        voice: {
          DEFAULT: "#2DD4BF",
          soft: "#5EEAD4",
        },
        amber: {
          DEFAULT: "#F5A623",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
        wave1: "wave 1.0s ease-in-out infinite",
        wave2: "wave 1.0s ease-in-out infinite 0.15s",
        wave3: "wave 1.0s ease-in-out infinite 0.3s",
        wave4: "wave 1.0s ease-in-out infinite 0.45s",
      },
    },
  },
  plugins: [],
};
