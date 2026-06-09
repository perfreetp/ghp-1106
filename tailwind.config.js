/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          blue: "#1e3a8a",
          gold: "#d4af37",
          blood: "#dc2626",
          energy: "#fbbf24",
          skill: "#3b82f6",
        },
        darkBg: "#0a0e27",
        cardBg: "#1a1f3a",
        borderGold: "rgba(212,175,55,0.3)",
      },
      fontFamily: {
        title: ['"Ma Shan Zheng"', '"ZCOOL XiaoWei"', "serif"],
        body: ['"Microsoft YaHei"', '"PingFang SC"', "sans-serif"],
      },
      animation: {
        glow: "glow 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
        fadeIn: "fadeIn 0.5s ease-out",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px #d4af37, 0 0 10px #d4af37, 0 0 15px #d4af37",
          },
          "50%": {
            boxShadow: "0 0 20px #d4af37, 0 0 30px #d4af37, 0 0 40px #d4af37",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 0 0 rgba(212, 175, 55, 0.7)",
          },
          "50%": {
            boxShadow: "0 0 0 15px rgba(212, 175, 55, 0)",
          },
        },
      },
    },
  },
  plugins: [],
};
