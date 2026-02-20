/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5ed',
          100: '#ffe8d9',
          200: '#ffd0b3',
          300: '#ffb088',
          400: '#ff905c',
          500: '#f67b1b', // Naranja del logo: rgb(246, 123, 27)
          600: '#e66a0f',
          700: '#c7590d',
          800: '#a1480b',
          900: '#7d3809',
        },
        accent: {
          50: '#fffef0',
          100: '#fffcd6',
          200: '#fff9ad',
          300: '#fff584',
          400: '#fff15b',
          500: '#fdd84b', // Amarillo del logo: rgb(253, 216, 75)
          600: '#e6c043',
          700: '#c7a239',
          800: '#a1832e',
          900: '#7d6523',
        },
      },
    },
  },
  plugins: [],
}
