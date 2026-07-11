import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";
import typographyPlugin from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#080a0f',
        panel: '#141820',
        surface: {
          DEFAULT: '#1e2330',
          light: '#2a3040',
        },
        'text-primary': '#f1f5f9',
        'text-secondary': '#cbd5e1',
        'text-muted': '#94a3b8',
        brand: {
          DEFAULT: '#5e6ad2',
          hover: '#4f5bc0',
        },
        accent: {
          DEFAULT: '#38bdf8',
          light: '#7dd3fc',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        border: {
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
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
        sans: ['Inter Variable', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display': ['68px', { lineHeight: '1.05', letterSpacing: '-2px', fontWeight: '510' }],
        'section': ['44px', { lineHeight: '1.10', letterSpacing: '-1.5px', fontWeight: '510' }],
        'heading': ['32px', { lineHeight: '1.20', letterSpacing: '-0.5px', fontWeight: '510' }],
        'body-lg': ['18px', { lineHeight: '1.60', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.50', fontWeight: '400' }],
        'caption': ['13px', { lineHeight: '1.50', fontWeight: '510' }],
        'label': ['12px', { lineHeight: '1.40', fontWeight: '510' }],
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
        'micro': '2px',
        'standard': '4px',
        'comfortable': '6px',
        'card': '8px',
        'panel': '12px',
        'full': '9999px',
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
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
