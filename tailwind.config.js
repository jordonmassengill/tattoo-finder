// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      // ADD THIS OBJECT
      aspectRatio: {
        'portrait': '4 / 5',
      },
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#0078ff',
          dark: '#0056b3',
        },
      },
    },
  },
  plugins: [],
}