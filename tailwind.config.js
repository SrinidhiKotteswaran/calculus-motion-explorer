/** @type {import('tailwindcss').Config} */
export default {
  // Scan the app shell and all source components for utility classes.
  // Keeping the paths explicit avoids scanning generated dependency files.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
