import type { Config } from 'tailwindcss'

export default <Config>{
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
    './components/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#e8f4fc',
          100: '#c5e3f7',
          200: '#9ecfef',
          300: '#6db5e5',
          400: '#3d9ad9',
          500: '#0A66A0',
          600: '#08558a',
          700: '#064573',
          800: '#04355c',
          900: '#032645',
        },
        accent: {
          50: '#fffde8',
          100: '#fef9c5',
          200: '#fef49e',
          300: '#feee6d',
          400: '#feea3d',
          500: '#FEE60E',
          600: '#d9c40c',
          700: '#b4a20a',
          800: '#8f8008',
          900: '#6a5e06',
        },
        surface: '#FEFEFE',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'dark-card': '0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
      }
    }
  },
  plugins: []
}
