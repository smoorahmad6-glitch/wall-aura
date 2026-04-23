/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // هذا السطر هو الأهم!
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          cyan: '#00f2ff',
          pink: '#ff00ff',
          dark: '#0a0a0f',
        }
      }
    },
  },
  plugins: [],
}