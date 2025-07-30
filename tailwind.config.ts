import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Montserrat como fuente principal según el branbook con peso medium como base
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui"],
        montserrat: ["var(--font-montserrat)", "ui-sans-serif", "system-ui"],
        // Mantener mono para código
        mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
      },
      fontWeight: {
        // Redefinir los pesos para que sean más robustos
        thin: "300",
        light: "400", // Regular en lugar de light
        normal: "500", // Medium como normal
        medium: "600", // Semibold como medium  
        semibold: "700", // Bold como semibold
        bold: "700", // Mantener bold
        extrabold: "800",
        black: "900",
      },
      // Colores del branbook de SorykPass
      colors: {
        // Colores principales del branbook
        sorykpass: {
          yellow: "#FDBD00",
          orange: "#FE4F00", 
          magenta: "#CC66CC",
          blue: "#0053CC",
          cyan: "#01CBFE",
        },
        // Gradientes predefinidos inspirados en el branbook
        brand: {
          primary: "#0053CC",
          secondary: "#01CBFE",
        },
        // Colores del sistema mantienen compatibilidad
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Espaciado mejorado para Montserrat
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      // Line heights optimizados para Montserrat
      lineHeight: {
        3: ".75rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
      },
      // Tamaños de fuente adicionales
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      // Animaciones personalizadas para SorykPass
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        gradient: "gradient 8s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      // Sombras personalizadas para el diseño
      boxShadow: {
        "sorykpass-sm": "0 1px 2px 0 rgba(0, 83, 204, 0.05)",
        "sorykpass-md": "0 4px 6px -1px rgba(0, 83, 204, 0.1), 0 2px 4px -1px rgba(0, 83, 204, 0.06)",
        "sorykpass-lg": "0 10px 15px -3px rgba(0, 83, 204, 0.1), 0 4px 6px -2px rgba(0, 83, 204, 0.05)",
        "sorykpass-xl": "0 20px 25px -5px rgba(0, 83, 204, 0.1), 0 10px 10px -5px rgba(0, 83, 204, 0.04)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;