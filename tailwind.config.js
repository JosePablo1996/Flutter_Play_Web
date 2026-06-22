/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-red': '#FF1744',
        'neon-green': '#00E676',
        'neon-blue': '#2979FF',
        'neon-purple': '#D500F9',
        'neon-yellow': '#FFEA00',
        'neon-cyan': '#18FFFF',
        'dark-bg': '#0D0D0D',
        'card-bg': '#1A1A1A',
      }
    },
  },
  plugins: [],
}