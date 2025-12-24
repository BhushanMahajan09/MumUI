// tailwind.config.cjs (production-ready)
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: "#fffaf6",
          100: "#f8efea",
          200: "#e9d9cf",
          500: "#6b4f3b",
          700: "#3d2b22"
        }
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
};
