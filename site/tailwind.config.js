/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        deep: "#0F2447",
        paper: "#17325C",
        edge: "#35557F",
        chalk: "#EAF1FB",
        muted: "#AFC3E2",
        amber: "#FFB02E",
      },
      fontFamily: {
        sans: ["Segoe UI", "Helvetica Neue", "Helvetica", "Arial", "system-ui", "sans-serif"],
      },
      keyframes: {
        draw: { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
        rise: { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "none" } },
        nudge: { "50%": { transform: "translateX(6px)" } },
        kenburns: { to: { transform: "scale(1.06)" } },
      },
      animation: {
        draw: "draw 1.4s ease-out both",
        rise: "rise .7s ease-out both",
        nudge: "nudge 1.8s ease-in-out infinite",
        kenburns: "kenburns 16s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
