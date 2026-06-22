import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#263B2F",
          secondary: "#35523F"
        },
        surface: {
          card: "#2E4937",
          elevated: "#456B4E"
        },
        accent: {
          primary: "#F0A14A",
          hover: "#D8832F"
        },
        text: {
          primary: "#FFF8EA",
          secondary: "#D7E0C8"
        },
        border: {
          primary: "#638060"
        },
        badge: {
          founder: "#FFD36B"
        },
        success: "#8FD49A"
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Anton", "Oswald", "sans-serif"],
        sans: ["var(--font-inter)", "General Sans", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 40px rgba(240, 161, 74, .26)",
        tactical: "0 24px 90px rgba(10, 20, 14, .34)"
      },
      backgroundImage: {
        "radial-ember": "radial-gradient(circle at 70% 20%, rgba(240,161,74,.24), transparent 32%)",
        "dark-field": "linear-gradient(145deg, #263B2F 0%, #35523F 56%, #456B4E 100%)"
      }
    }
  },
  plugins: []
};

export default config;
