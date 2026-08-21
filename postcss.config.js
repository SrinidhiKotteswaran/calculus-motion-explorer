// PostCSS keeps Tailwind's generated styles compatible across supported browsers.
// Keep the plugin order stable: Tailwind generates utilities before autoprefixer rewrites them.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
