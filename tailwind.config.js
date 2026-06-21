/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5F7',
          100: '#FFE8ED',
          200: '#FFD1DA',
          300: '#FFB6C1',
          400: '#FF8FA3',
          500: '#FF6B8A',
          600: '#FF476E',
          700: '#E63E62',
          800: '#CC3757',
          900: '#992941',
        },
        cream: {
          50: '#FFFBF5',
          100: '#FFF8F0',
          200: '#FFF0E0',
          300: '#FFE8D0',
          400: '#FFD9B3',
        },
        mint: {
          100: '#E8F8F4',
          200: '#C8EEE4',
          300: '#98D8C8',
          400: '#7AC7B4',
          500: '#5CB6A0',
        },
        lavender: {
          100: '#F5F0FF',
          200: '#E6E6FA',
          300: '#D4CDFF',
          400: '#B8ADFF',
        },
        butter: {
          100: '#FFFCE6',
          200: '#FFFACD',
          300: '#FFF599',
          400: '#FFF066',
        },
      },
      fontFamily: {
        display: ['"Quicksand"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'softer': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(255, 182, 193, 0.4)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
