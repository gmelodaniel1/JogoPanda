/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-up-fade': {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'sprite-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'sprite-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'float-affinity': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.8)' },
          '20%': { opacity: '1', transform: 'translateY(0) scale(1.1)' },
          '80%': { opacity: '1', transform: 'translateY(-15px) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-30px) scale(0.9)' },
        }
      },
      animation: {
        'slide-up-fade': 'slide-up-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'sprite-bob': 'sprite-bob 4s ease-in-out infinite',
        'sprite-shake': 'sprite-shake 0.4s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'blink': 'blink 1s infinite',
        'float-affinity': 'float-affinity 2s ease-out forwards',
      },
      fontFamily: {
        sans: ['Nunito', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

