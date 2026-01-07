/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        noir: '#0d0c0c',
        bone: '#f2eee4',
        accent: '#d0b06a',
        dim: '#1a1919',
      },
      letterSpacing: {
        wideish: '0.08em',
        wider: '0.15em',
        widest: '0.3em',
      },
      boxShadow: {
        glow: '0 10px 40px rgba(0,0,0,0.5)',
        'glow-lg': '0 20px 60px rgba(0,0,0,0.8)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}