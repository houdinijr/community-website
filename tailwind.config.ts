import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#10213D",
          blue: "#1C75BC",
          red: "#DC143C",
          yellow: "#FFD700",
          cloud: "#F4FAFF",
          mist: "#E3F1FF",
          sand: "#FFFDF6",
        },
      },
      boxShadow: {
        soft: "0 28px 64px -30px rgba(16, 33, 61, 0.28)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(255, 215, 0, 0.18), transparent 24%), radial-gradient(circle at top right, rgba(220, 20, 60, 0.14), transparent 28%), linear-gradient(135deg, rgba(28, 117, 188, 0.96) 0%, rgba(15, 54, 99, 0.98) 58%, rgba(9, 30, 56, 1) 100%)",
      },
      fontFamily: {
        display: ["Poppins", "Lato", "Roboto", "Segoe UI", "sans-serif"],
        body: ["Poppins", "Lato", "Roboto", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
