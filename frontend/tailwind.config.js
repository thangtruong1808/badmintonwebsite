/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        huglove: ["Huglove", "cursive"],
        roboto: ["Roboto", "sans-serif"],
        "noto-sans": ["Noto Sans", "sans-serif"],
        calibri: ["Calibri", "Arial", "sans-serif"],
        "poynter-gothic": ["Playfair Display", "serif"],
        sans: ["Roboto", "Huglove", "cursive"], // Set Roboto as default sans font
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
