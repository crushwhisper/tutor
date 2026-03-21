import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0c1222',
          50: '#e8eaf0',
          100: '#c5cad8',
          200: '#9fa7bc',
          300: '#7984a0',
          400: '#5d698c',
          500: '#414f78',
          600: '#364268',
          700: '#283254',
          800: '#1a2540',
          900: '#0c1222',
        },
        gold: {
          DEFAULT: '#e8a83e',
          50: '#fdf6e8',
          100: '#fae9c3',
          200: '#f6da9b',
          300: '#f2cb72',
          400: '#efbe52',
          500: '#e8a83e',
          600: '#d4942e',
          700: '#b87a22',
          800: '#9c6218',
          900: '#7a4a0e',
        },
        muted: '#8892a4',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-navy': 'linear-gradient(135deg, #0c1222 0%, #1a2540 100%)',
        'gradient-gold': 'linear-gradient(135deg, #e8a83e 0%, #f2cb72 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(26,37,64,0.8) 0%, rgba(12,18,34,0.9) 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 168, 62, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(232, 168, 62, 0)' },
        },
      },
      boxShadow: {
        'navy-sm': '0 2px 8px rgba(12, 18, 34, 0.4)',
        'navy-md': '0 4px 20px rgba(12, 18, 34, 0.6)',
        'navy-lg': '0 8px 40px rgba(12, 18, 34, 0.8)',
        'gold-sm': '0 2px 8px rgba(232, 168, 62, 0.2)',
        'gold-md': '0 4px 20px rgba(232, 168, 62, 0.3)',
        'gold-glow': '0 0 30px rgba(232, 168, 62, 0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}

export default config
