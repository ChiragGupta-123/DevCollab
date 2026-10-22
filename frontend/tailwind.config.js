/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#090D16', // Main app background
          900: '#0F1624', // Surface & panel background
          850: '#151E30', // Elevated cards & modals
          800: '#1C2840', // Hover & active backgrounds
          700: '#253554', // Borders & dividers
          600: '#33476E', // Muted borders
          500: '#4A6291', // Subdued text
          400: '#7B93BE', // Secondary text
          300: '#A4B8DC', // Primary light text
          200: '#CBD7EE', // Highlight text
          100: '#E8EFFC',
        },
        neon: {
          cyan: '#00F0FF',
          cyanGlow: '#00C2FF',
          violet: '#A855F7',
          violetDeep: '#7C3AED',
          emerald: '#00FF9D',
          emeraldDark: '#10B981',
          rose: '#FF0055',
          roseLight: '#F43F5E',
          amber: '#FFB800',
          amberGlow: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.35)',
        'neon-violet': '0 0 15px rgba(168, 85, 247, 0.35)',
        'neon-emerald': '0 0 15px rgba(0, 255, 157, 0.35)',
        'neon-rose': '0 0 15px rgba(255, 0, 85, 0.35)',
        'card-glow': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(0, 240, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.98)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
