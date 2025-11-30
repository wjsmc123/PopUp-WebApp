import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['Space Grotesk', 'sans-serif'],
        'space-mono': ['Space Mono', 'monospace'],
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
        'quicksand': ['Quicksand', 'sans-serif'],
        'fredoka': ['Fredoka', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'flip-in': 'flipIn 0.6s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        flipIn: {
          '0%': { opacity: '0', transform: 'rotateX(-90deg)' },
          '100%': { opacity: '1', transform: 'rotateX(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
