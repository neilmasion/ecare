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
          DEFAULT: '#2D3B5F',
          dark: '#1F2937',
          light: '#4B5A7C',
        },
        accent: {
          DEFAULT: '#5B7FFF',
          hover: '#4A6EEE',
          light: '#E8EDFF',
        },
        surface: {
          DEFAULT: '#F5F7FA',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px rgba(91, 127, 255, 0.08)',
        'glow': '0 0 25px rgba(91, 127, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
