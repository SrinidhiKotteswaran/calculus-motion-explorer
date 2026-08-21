// PostCSS keeps Tailwind's generated styles compatible across supported browsers.
// Tailwind runs first so Autoprefixer can process the generated CSS afterward.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
