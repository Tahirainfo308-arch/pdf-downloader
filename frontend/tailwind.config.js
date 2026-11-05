/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#fdf2f4",
          100: "#fbe3e7",
          200: "#f6c6ce",
          300: "#ee9aa8",
          400: "#d45060",
          500: "#a81538",
          600: "#800020",
          700: "#69001a",
          800: "#520015",
          900: "#3a000f",
        },
        cream: {
          50: "#fff9f2",
          100: "#f3e6d5",
          200: "#ecd8c5",
          300: "#e2c6ad",
          400: "#d4b295",
        },
        ink: "#40141d",
        muted: "#7c5960",
      },
      opacity: {
        15: "0.15",
        35: "0.35",
        45: "0.45",
        65: "0.65",
        85: "0.85",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
