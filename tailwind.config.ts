import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        text: "#e6e6e6",
        "text-dim": "#9a9a9a",
        muted: "#5c5c5c",
        border: "#1c1c1c",
        accent: "#39ff8c",
        "accent-dim": "#1e8a53",
        "accent-red": "#ff4d4d",
      },
      fontFamily: {
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
