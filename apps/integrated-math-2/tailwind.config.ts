import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAF9F6',
        panel: '#F4F1EA',
        surface: {
          DEFAULT: '#FFFFFF',
          light: '#F9F8F6',
        },
        'text-primary': '#242220',
        'text-secondary': '#5C5955',
        'text-muted': '#8A8680',
        brand: {
          DEFAULT: '#B14C00',
          hover: '#9A4200',
        },
        accent: {
          DEFAULT: '#00828C',
          light: '#00A3AE',
        },
        success: '#008A4D',
        warning: '#C7A000',
        error: '#B22B00',
        border: {
          DEFAULT: '#DEDBD6',
          strong: '#C8C4BD',
        },
        background: "oklch(var(--background))",
        foreground: "oklch(var(--foreground))",
        card: {
          DEFAULT: "oklch(var(--card))",
          foreground: "oklch(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "oklch(var(--popover))",
          foreground: "oklch(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "oklch(var(--primary))",
          foreground: "oklch(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "oklch(var(--secondary))",
          foreground: "oklch(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "oklch(var(--muted))",
          foreground: "oklch(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "oklch(var(--destructive))",
          foreground: "oklch(var(--destructive-foreground))",
        },
        input: "oklch(var(--input))",
        ring: "oklch(var(--ring))",
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-lg': ['32px', { lineHeight: '1.20', fontWeight: '700' }],
        'display-md': ['24px', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.75', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.60', fontWeight: '400' }],
        'label': ['11px', { lineHeight: '1.20', fontWeight: '500' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'card': '8px',
        'panel': '12px',
        'full': '9999px',
        'DEFAULT': 'var(--radius)',
      },
      maxWidth: {
        'content': '1200px',
      },
      screens: {
        'mobile': '640px',
        'tablet': '640px',
        'desktop': '1024px',
        'large': '1280px',
      },
    },
  },
  plugins: [animatePlugin, typographyPlugin],
} satisfies Config;
