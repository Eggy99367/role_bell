/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#0b0a14',
        surface: '#151221',
        surface2: '#1e1a30',
        line: '#2a2440',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
      },
      keyframes: {
        pulsering: {
          '0%': { boxShadow: '0 0 0 0 rgba(139,92,246,0.55)' },
          '100%': { boxShadow: '0 0 0 14px rgba(139,92,246,0)' },
        },
      },
      animation: {
        pulsering: 'pulsering 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
      },
    },
  },
  plugins: [],
}