/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fd',
          400: '#36a6fa',
          500: '#0c8af0',
          600: '#006dce',
          700: '#0057a7',
          800: '#054a89',
          900: '#0a3e72',
          950: '#07274b',
        },
        teal: {
          soft: '#0d9488',
          light: '#ccfbf1',
        },
        medical: {
          bgLight: '#f8fafc',
          cardLight: '#ffffff',
          borderLight: '#e2e8f0',
          bgDark: '#0f172a',
          cardDark: '#1e293b',
          borderDark: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
