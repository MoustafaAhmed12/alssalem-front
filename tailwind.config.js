/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    fontFamily: {
      arabic: ["Alexandria", "sans-serif"],
      english: ["Poppins", "sans-serif"],
    },
    extend: {
      transitionProperty: {
        height: "height",
      },
      colors: {
        // primaryGreen: "#36b290",
        greenF: "#7dc5ad",
        // primary: "#41b494",
        hoverBtn: "#0369a1",
        textNav: "#7a7a7a",
        // <RiAdminFill />
        primaryAdmin: "#36b290",
        secondaryAdmin: "#e5a53f",
        logoColor1: "#30244a",
         // schools
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
      },
      animation: {
        pop: "popBtn 1s  infinite",
      },
      keyframes: {
        popBtn: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};
