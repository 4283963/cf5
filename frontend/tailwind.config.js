/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gym-dark': '#0a0e17',
        'gym-darker': '#060810',
        'gym-card': '#111827',
        'gym-blue': '#3b82f6',
        'gym-green': '#10b981',
        'gym-red': '#ef4444',
        'gym-yellow': '#f59e0b',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-blue': 'glow-blue 2s ease-in-out infinite',
        'glow-green': 'glow-green 2s ease-in-out infinite',
        'glow-red': 'glow-red 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-blue': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        'glow-green': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)' },
        },
        'glow-red': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(239, 68, 68, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
