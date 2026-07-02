/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jersey: {
          yellow: "#F2C200",
          polka: "#D62828",
          green: "#1E9E56",
          white: "#E8E8E8",
          combative: "#6B1B47",
        },
      },
    },
  },
  plugins: [],
}
