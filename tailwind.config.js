/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF9F6",
        pine: {
          DEFAULT: "#174C49",
          deep: "#0F3533",
          soft: "#1E5B57",
        },
        mint: {
          DEFAULT: "#DCEFE7",
          light: "#EAF5EF",
          pale: "#F1F8F4",
        },
        sage: {
          DEFAULT: "#8AA99A",
          dark: "#6E8F7F",
          light: "#C4D8CC",
        },
        charcoal: "#252D2B",
        stone2: "#737C78",
        line: "#E4E7E2",
        clay: "#C98A5B",
      },
      fontFamily: {
        sans: ['"DM Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"DM Serif Display"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 18px 45px -22px rgba(23, 76, 73, 0.28)",
        lift: "0 24px 60px -28px rgba(23, 76, 73, 0.35)",
      },
      borderRadius: {
        xl2: "1.4rem",
        xl3: "2rem",
      },
    },
  },
  plugins: [],
};
