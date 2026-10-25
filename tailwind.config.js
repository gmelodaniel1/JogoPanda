/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lana: {
          dark: '#0f172a',
          board: '#1e293b',
          accent: '#ec4899', // Amor Doce pink
          gold: '#eab308',
          teal: '#0ea5e9',
          ufpe: '#1d4ed8',
          glass: 'rgba(15, 23, 42, 0.88)',
        },
        lom: {
          negative: '#3b82f6', // icy blue
          neutral: '#94a3b8',  // gray/slate
          positive: '#ec4899', // vibrant pink
          love: '#ef4444',     // red heart
        }
      },
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

