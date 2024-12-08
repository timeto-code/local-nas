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
        background: "var(--background)",
        foreground: "var(--foreground)",
        hover: "var(--hover-background)",
        "button-hover": "var(--button-hover-background)",
        "upload-button": "var(--upload-button-background)",
        confirmation: "var(--confirmation-background)",
        failed: "var(--failed)",
        "failed-hover": "var(--failed-hover)",
        success: "var(--success)",
        warning: "var(--warning)",
        processing: "var(--processing)",
        lighten: "var(--lighten)",
      },
      fontFamily: {
        "sans-thin": ["var(--font-harmony-sans-sc-thin)"],
        "sans-light": ["var(--font-harmony-sans-sc-light)"],
        "sans-regular": ["var(--font-harmony-sans-sc-regular)"],
        "sans-medium": ["var(--font-harmony-sans-sc-medium)"],
        "sans-bold": ["var(--font-harmony-sans-sc-bold)"],
        "sans-black": ["var(--font-harmony-sans-sc-black)"],
      },
      boxShadow: {
        "bottom-1px": "0 1px 5px 0.5px rgba(0, 0, 0, 0.3)",
        "rounded-1px": "0 0 2px 0.5px rgba(0, 0, 0, 0.1)",
        "rounded-1px-black": "0 0 2px 0.5px rgba(0, 0, 0, 0.3)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(calc(100% - 56px))" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(calc(100% - 56px))" },
        },
        "toast-slide-down": {
          "0%": {
            transform: "translateY(-100%) translateX(-50%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(30px) translateX(-50%)",
            opacity: "1",
          },
        },
        "toast-slide-up": {
          "0%": {
            transform: "translateY(30px) translateX(-50%)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-100%) translateX(-50%)",
            opacity: "0",
          },
        },
        "row-delete": {
          "0%": { maxHeight: "48px", opacity: "1" },
          "100%": { maxHeight: "0px", opacity: "0", padding: "0", margin: "0" },
        },
        "birthtime-slide-in": {
          "0%": { transform: "translateX(150%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "birthtime-label-slide-in": {
          "0%": { transform: "translateX(398%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "chunk-merging": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
      },
      animation: {
        "slide-up": "slide-up 0.5s ease-in-out forwards",
        "slide-down": "slide-down 0.5s ease-in-out forwards",
        "toast-slide-up": "toast-slide-up 0.2s ease-in-out forwards",
        "toast-slide-down": "toast-slide-down 0.3s ease-in-out forwards",
        "row-delete": "row-delete 0.2s ease-in-out forwards",
        "birthtime-slide-in": "birthtime-slide-in 0.3s ease-in-out forwards",
        "birthtime-label-slide-in":
          "birthtime-label-slide-in 0.3s ease-in-out forwards",
        "chunk-merging": "chunk-merging 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
