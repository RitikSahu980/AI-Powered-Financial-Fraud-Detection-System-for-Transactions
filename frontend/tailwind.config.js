/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core token system - see DESIGN.md for the rationale behind these
        // specific choices (not Tailwind's stock palette renamed).
        ink: '#0B1220',
        slate: {
          DEFAULT: '#5B6B85',
          50: '#F5F7FA',
          100: '#EAEEF4',
          200: '#D8DFEA',
          300: '#B9C4D6',
          400: '#8C99B3',
          500: '#5B6B85',
          600: '#465267',
          700: '#343D4E',
        },
        canvas: '#F6F8FC',
        surface: '#FFFFFF',
        navy: {
          deep: '#0A0F24',
          mid: '#101A38',
          light: '#1B2A52',
        },
        azure: {
          DEFAULT: '#2F6FED',
          bright: '#5B8DFF',
          dim: '#1E4FB8',
          50: '#EEF3FE',
          100: '#DCE7FD',
        },
        risk: {
          low: '#16A34A',
          'low-bg': '#ECFDF3',
          medium: '#D97706',
          'medium-bg': '#FFFBEB',
          high: '#DC2626',
          'high-bg': '#FEF2F2',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 18, 32, 0.04), 0 4px 16px rgba(11, 18, 32, 0.06)',
        'card-hover': '0 2px 4px rgba(11, 18, 32, 0.06), 0 12px 32px rgba(11, 18, 32, 0.10)',
        glow: '0 0 0 1px rgba(91, 141, 255, 0.15), 0 8px 32px rgba(47, 111, 237, 0.25)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'pulse-node': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        'flash-alert': {
          '0%, 100%': { opacity: '0' },
          '10%, 30%': { opacity: '1' },
          '40%': { opacity: '0' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '240' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
      },
      animation: {
        'pulse-node': 'pulse-node 2.4s ease-in-out infinite',
        'flash-alert': 'flash-alert 6s ease-in-out infinite',
        'draw-line': 'draw-line 1.6s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
