import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Refined "estate" neutrals
        ink: {
          DEFAULT: "#15201a",
          soft: "#24322b",
        },
        body: "#45524a",
        mut: "#74817a",
        // Warm ivory papers (luxury, calm)
        paper: "#fbf8f2",
        paper2: "#f4eee2",
        paper3: "#ece4d3",
        line: "#e6dece",
        linesoft: "#efe9dc",
        // Deep estate-green brand
        brand: {
          DEFAULT: "#1c3f34",
          2: "#14302a",
          3: "#2b5a49",
          light: "#3d7c66",
        },
        // Champagne gold accent
        gold: {
          DEFAULT: "#b68d45",
          2: "#d2b37a",
          deep: "#96742f",
          pale: "#e7d7b2",
        },
        // Back-compat alias: legacy "emerald" utilities map onto deep estate green
        emerald: {
          DEFAULT: "#1c3f34",
          2: "#14302a",
          3: "#2b5a49",
        },
        cream: "#fbf8f2", // alias -> paper
        cream2: "#f4eee2",
        star: "#d6a23f",
      },
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        // Distinctive luxury editorial serif for display headings
        display: ["Fraunces", "Georgia", "serif"],
        serif: ["Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 2px 6px rgba(21,32,26,.04),0 12px 32px -12px rgba(21,32,26,.18)",
        lift: "0 8px 22px -10px rgba(21,32,26,.28),0 30px 60px -24px rgba(21,32,26,.35)",
        glow: "0 0 0 1px rgba(214,162,63,.25),0 18px 40px -18px rgba(150,116,47,.45)",
        panel: "0 1px 0 rgba(255,255,255,.6) inset,0 24px 60px -30px rgba(21,32,26,.35)",
      },
      borderRadius: {
        xl2: "1.4rem",
        xl3: "2rem",
      },
      letterSpacing: {
        lux: "0.28em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-slow": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "tick": {
          "0%": { opacity: "0", transform: "scale(.6)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "reveal-line": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up .7s cubic-bezier(.16,1,.3,1) both",
        "fade-in": "fade-in .9s ease both",
        "zoom-slow": "zoom-slow 12s ease-in-out infinite alternate",
        marquee: "marquee 28s linear infinite",
        float: "float 6s ease-in-out infinite",
        tick: "tick .3s ease both",
      },
    },
  },
  plugins: [],
};
export default config;
