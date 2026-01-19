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
    },
  },
  plugins: [],
};
