/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '.dark-theme'],
  content: ['./src/**/*.{html,ts,scss}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0ea5e9',
          secondary: '#14b8a6',
          dark: '#0f172a',
        },
      },
      boxShadow: {
        glass: '0 20px 44px rgba(15, 23, 42, 0.14)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
