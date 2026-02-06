/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      colors: {
        // Literal values so @apply and JIT generate classes (no var() in theme for utilities)
        app: {
          bg: '#0B0F14',
          surface: '#111827',
          'surface-1': '#111827',
          'surface-2': '#0F172A',
          border: 'rgba(255,255,255,0.08)',
          'border-focus': 'rgba(212,175,55,0.35)',
          primary: '#F8FAFC',
          secondary: 'rgba(248,250,252,0.72)',
          muted: 'rgba(248,250,252,0.5)',
          gold: '#D4AF37',
          'gold-hover': '#E3C45F',
          'gold-muted': 'rgba(212,175,55,0.2)',
          danger: '#EF4444',
          'danger-muted': 'rgba(239,68,68,0.15)',
          success: '#22C55E',
          'success-muted': 'rgba(34,197,94,0.15)',
          warning: '#EAB308',
          'warning-muted': 'rgba(234,179,8,0.15)',
          overlay: 'rgba(0,0,0,0.72)',
        },
        danger: '#EF4444',
        success: '#22C55E',
        luxury: {
          gold: '#D4AF37',
          'gold-light': '#E3C45F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 15px -3px rgba(0,0,0,0.25), 0 4px 6px -2px rgba(0,0,0,0.15)',
        modal: '0 25px 50px -12px rgba(0,0,0,0.5)',
        button: '0 1px 3px 0 rgba(0,0,0,0.2)',
      },
    },
  },
  plugins: [],
};
