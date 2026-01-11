/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        huglove: ["Huglove", "cursive"],
        sans: ["Huglove", "cursive"], // Set Huglove as default sans font
      },
    },
  },
  plugins: [],
};
