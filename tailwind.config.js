/*
 * tailwind.config.js
 * Tailwind CSS configuration file.
 * Handles content paths and basic theme extensions.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  darkMode: false,
  theme: {
    extend: {}
  },
  plugins: []
}
