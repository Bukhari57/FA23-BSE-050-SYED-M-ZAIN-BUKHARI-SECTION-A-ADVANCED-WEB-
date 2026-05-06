export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 24px 80px rgba(26, 17, 8, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(212, 132, 58, 0.12), transparent 32%), radial-gradient(circle at bottom right, rgba(230, 126, 34, 0.12), transparent 28%)',
      },
      colors: {
        brand: {
          50: '#fef7ed',
          100: '#fce4c6',
          500: '#d4843a',
          600: '#c27430',
          700: '#b8611d',
        },
      },
    },
  },
  plugins: [],
};
