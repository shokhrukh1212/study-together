/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#121826',
        'primary-text': '#E5E7EB',
        accent: '#FFD27D',
      },
      fontFamily: {
        sans: ['Nunito Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
