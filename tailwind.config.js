/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#0a0a0f',
          darker: '#050508',
          card: '#12121a',
          border: '#1e1e2e',
          gold: '#f59e0b',
          'gold-dark': '#d97706',
          'gold-light': '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
