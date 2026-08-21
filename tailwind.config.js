/** @type {import('tailwindcss').Config} */
export default {
  // Scan the app shell and all source components for utility classes.
  // Keeping the source glob here prevents classes in nested components from being missed.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
