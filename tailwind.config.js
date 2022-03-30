module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    fontFamily: {
      body: ["source-han-sans-japanese", "sans-serif"],
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
}
