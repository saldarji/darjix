/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FCFBF9',
          100: '#F6F3EC',
          200: '#EBE5D8',
          300: '#DCD3C0',
        },
        civic: {
          navy: '#0F172A',
          slate: '#1E293B',
          gold: '#D97706',
          crimson: '#BE123C',
          teal: '#0F766E',
          blue: '#1D4ED8',
        }
      }
    },
  },
  plugins: [],
};
