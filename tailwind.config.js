/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0b1436",
        panel: "#141f49",
        panel2: "#1b2860",
        line: "#2b376e",
        cream: "#eef2fb",
        muted: "#93a0c8",
        faint: "#5f6da0",
        brand: "#2b50e0",
        cyan: "#35c8f0",
        jersey: {
          yellow: "#F2C200",
          polka: "#e2384f",
          green: "#23b061",
          white: "#e7ecfb",
          combative: "#8a2f3f",
          combativeText: "#c76b7a",
        },
      },
      fontFamily: {
        display: ["Bebas Neue", "sans-serif"],
        body: ["Barlow", "sans-serif"],
        label: ["Barlow Semi Condensed", "sans-serif"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        "spin-700": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        blink: "blink 1.8s infinite",
        "spin-700": "spin-700 0.7s linear infinite",
      },
    },
  },
  plugins: [],
}
