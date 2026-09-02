/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'earth': {
          50: '#f9f6f0',
          100: '#f1ebd9',
          200: '#e3d6b6',
          300: '#d1ba8c',
          400: '#c09c64',
          500: '#b2834b',
          600: '#a36d40',
          700: '#875537',
          800: '#6f4531',
          900: '#5a392b',
        },
        'terracotta': {
          50: '#fdf7f5',
          100: '#faece8',
          200: '#f4d5cc',
          300: '#ecb4a5',
          400: '#e28b75',
          500: '#d4654b',
          600: '#c24b33',
          700: '#a33d28',
          800: '#873424',
          900: '#702d20',
        },
        'forest': {
          50: '#f4f7f4',
          100: '#e5eee6',
          200: '#cadfcc',
          300: '#a2c6a6',
          400: '#75a67b',
          500: '#528759',
          600: '#3e6b44',
          700: '#335538',
          800: '#2b442f',
          900: '#243928',
        }
      },
      fontFamily: {
        'sans': ['"DM Sans"', 'Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'ui-serif', 'serif'],
      }
    },
  },
  plugins: [],
}
