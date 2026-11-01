/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        panel: "#121212",
        line: "#2A2622",
        ember: { DEFAULT: "#E8631A", hi: "#F59A4A", lo: "#D9631F" },
        bone: "#F3EFE6",
        mute: "#948E85",
      },
      fontFamily: {
        sans: ["Roboto", "Segoe UI", "Helvetica Neue", "Helvetica", "Arial", "system-ui", "sans-serif"],
      },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        drift: { from: { transform: "translateY(0)" }, to: { transform: "translateY(-16px)" } },
        twinkle: { "0%,100%": { opacity: ".35", transform: "scale(.8)" }, "50%": { opacity: "1", transform: "scale(1.15)" } },
        nudge: { "50%": { transform: "translateX(6px)" } },
        kenburns: { to: { transform: "scale(1.06)" } },
      },
      animation: {
        rise: "rise .9s cubic-bezier(.2,.7,.2,1) both",
        drift: "drift 14s ease-in-out infinite alternate",
        twinkle: "twinkle 3.6s ease-in-out infinite",
        nudge: "nudge 1.8s ease-in-out infinite",
        kenburns: "kenburns 16s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
