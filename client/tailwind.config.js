/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        pastel: {
          green: '#9df5a9',
          greenDark: '#123e1e',
          purple: '#b0a2ff',
          purpleDark: '#281a6e',
          amber: '#fedd89',
          amberDark: '#523405',
          rose: '#ffbaba',
          roseDark: '#5e1414',
          bg: '#e9efe9',
          hero: '#191919',
        },
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 10px 30px -4px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
