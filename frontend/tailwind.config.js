/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Organic Nature Palette
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46', // Deep Emerald (Primary)
          900: '#064e3b',
          950: '#022c22',
        },
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Soft Teal (Secondary)
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        cream: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#fef3c7', // Sunlight Cream (Accent)
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
        },
        bamboo: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c', // Bamboo Brown (Neutral)
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
        zinc: {
          950: '#09090b',
        },
      },
      backgroundImage: {
        'organic-gradient': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #ccfbf1 50%, #fef9c3 75%, #fefce8 100%)',
        'organic-mesh': `
          radial-gradient(at 0% 0%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
          radial-gradient(at 50% 0%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(254, 243, 199, 0.12) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(6, 95, 70, 0.08) 0px, transparent 50%),
          radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(20, 184, 166, 0.15) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
        'glass-lg': '0 12px 48px 0 rgba(16, 185, 129, 0.2)',
        'glass-xl': '0 20px 64px 0 rgba(16, 185, 129, 0.25)',
        'inner-glass': 'inset 0 2px 8px 0 rgba(255, 255, 255, 0.3)',
        'glow': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-teal': '0 0 20px rgba(20, 184, 166, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
        '3xl': '48px',
        '4xl': '64px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Custom glass utility plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(16, 185, 129, 0.15)',
        },
        '.glass-strong': {
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 12px 48px 0 rgba(16, 185, 129, 0.2)',
        },
        '.glass-subtle': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 16px 0 rgba(16, 185, 129, 0.1)',
        },
        '.glass-dark': {
          background: 'rgba(6, 95, 70, 0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(6, 95, 70, 0.15)',
        },
        '.tactile': {
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:active': {
            transform: 'scale(0.95)',
          },
        },
        '.tactile-strong': {
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:active': {
            transform: 'scale(0.9)',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'active'])
    },
  ],
}
