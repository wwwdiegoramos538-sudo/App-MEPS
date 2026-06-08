import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        meps: {
          dark: '#001FAD',
          primary: '#0033CC',
          cyan: '#00D4FF',
          light: '#A9C4EB',
          accent: '#4D7CFF',
          sky: '#E8F4FF',
          cream: '#F8FAFF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0 #0c1229',
        'brutal-sm': '3px 3px 0 #0c1229',
        'brutal-cyan': '4px 4px 0 #00D4FF',
        'brutal-lg': '6px 6px 0 #0c1229',
        soft: '0 8px 30px rgba(0, 51, 204, 0.12)',
        'soft-lg': '0 20px 50px rgba(0, 51, 204, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(0,51,204,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,51,204,0.04) 1px, transparent 1px)',
        'grid-pattern-dark':
          'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
        'hero-gradient':
          'radial-gradient(ellipse at top, rgba(0,51,204,0.12) 0%, transparent 65%)',
        'hero-light':
          'linear-gradient(135deg, #e8f4ff 0%, #f4f7ff 40%, #ffffff 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
