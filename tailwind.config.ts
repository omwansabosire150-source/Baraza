import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#EEF0EC",
        surface: "#FFFFFF",
        teal: {
          DEFAULT: "#1F6F5C",
          dark: "#164F41",
          light: "#E4EFEB",
        },
        amber: {
          DEFAULT: "#C98A2C",
          light: "#F6E9D3",
        },
        line: "#D8DCD4",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};
export default config;
