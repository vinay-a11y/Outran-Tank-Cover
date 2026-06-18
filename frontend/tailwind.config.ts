import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F1914",
          secondary: "#1A2818"
        },
        surface: {
          card: "#132017",
          elevated: "#203226"
        },
        accent: {
          primary: "#C97D3A",
          hover: "#A95F2E"
        },
        text: {
          primary: "#EDE8DF",
          secondary: "#8FA28A"
        },
        border: {
          primary: "#2A3D28"
        },
        badge: {
          founder: "#D4A843"
        },
        success: "#6FA47B"
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Anton", "Oswald", "sans-serif"],
        sans: ["var(--font-inter)", "General Sans", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(201, 125, 58, .22)",
        tactical: "0 24px 90px rgba(0, 0, 0, .55)"
      },
      backgroundImage: {
        "radial-ember": "radial-gradient(circle at 70% 20%, rgba(201,125,58,.20), transparent 32%)",
        "dark-field": "linear-gradient(145deg, #0F1914 0%, #090d0b 56%, #1A2818 100%)"
      }
    }
  },
  plugins: []
};

export default config;
