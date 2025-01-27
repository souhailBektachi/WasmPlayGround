module.exports = {
  // ...existing config...
  theme: {
    extend: {
      animation: {
        shimmer: 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.5s ease-out',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(200%)' },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [
    // ...existing plugins...
    require('tailwind-scrollbar'),
  ],
}
