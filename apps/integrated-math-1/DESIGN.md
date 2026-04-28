---
version: 1.0.0
name: Integrated Math 1 Design System
colors:
  primary: "#B14C00"
  secondary: "#F4F1EA"
  accent: "#00828C"
  background: "#FAF9F6"
  foreground: "#242220"
  muted: "#F3F2F0"
  destructive: "#B22B00"
  border: "#DEDBD6"
  chart-1: "#B14C00"
  chart-2: "#00828C"
  chart-3: "#A30000"
  chart-4: "#C7A000"
  chart-5: "#008A4D"
typography:
  display-lg:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
  display-md:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.25
  body-lg:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.75
  body-md:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label-mono:
    fontFamily: "Fira Code, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
---

# Integrated Math 1 Design System

## Overview
This design system is tailored for the **Integrated Math 1** educational platform. It emphasizes readability, academic warmth, and a focused learning environment. The theme uses a "warm academic orange" as its primary brand color, balanced by a "muted teal" accent and clean serif typography for textbook content.

## Colors

The system uses OKLCH colors for modern browser support and better perceptual uniformity.

- **Primary (#B14C00):** `oklch(0.55 0.19 40)`. Used for branding, primary buttons, and active states. Represents academic energy and focus.
- **Secondary (#F4F1EA):** `oklch(0.94 0.012 70)`. A warm sand color used for large backgrounds and secondary surfaces.
- **Accent (#00828C):** `oklch(0.60 0.14 195)`. A muted teal that complements the primary orange. Used for calls to action and highlighting.
- **Background (#FAF9F6):** `oklch(0.985 0.003 75)`. A barely warm white to reduce eye strain during long reading sessions.
- **Foreground (#242220):** `oklch(0.13 0.016 45)`. A warm near-black for high-contrast text.

### Chart Colors
The chart palette is designed for distinctiveness in data visualization:
- **Chart 1:** Primary Orange (#B14C00)
- **Chart 2:** Accent Teal (#00828C)
- **Chart 3:** Destructive Red (#A30000)
- **Chart 4:** Golden Yellow (#C7A000)
- **Chart 5:** Green (#008A4D)

## Typography

The system employs a multi-font strategy to distinguish between different types of information.

- **Display (Lora):** A serif font used for lesson titles, headings, and textbook content to evoke a traditional academic feel.
- **Body (DM Sans):** A clean sans-serif used for UI elements, navigation, and instructions to ensure clarity.
- **Mono (Fira Code):** Used for mathematical notation (where appropriate) and technical labels.

### Typography Scale
- **Display LG:** 32px, Bold. For page headers and module titles.
- **Display MD:** 24px, Semi-bold. For section headers.
- **Body LG:** 18px, Regular. Optimized for textbook reading.
- **Body MD:** 16px, Regular. Standard UI text.
- **Label Mono:** 11px, Medium. For technical labels and metadata tags.

## Spacing

The spacing system follows a 4px/8px grid.

- **xs (4px):** Internal component padding.
- **sm (8px):** Component grouping.
- **md (16px):** Standard layout gaps and padding.
- **lg (24px):** Section spacing.
- **xl (32px):** Page-level container margins.

## Shape & Radius

Rounded corners are used to soften the UI while maintaining a professional appearance.

- **Small (4px):** Labels and small buttons.
- **Medium (6px):** Standard buttons and input fields.
- **Large (8px):** Cards and containers (`var(--radius)`).

## Elevation & Depth

The system uses subtle shadows to indicate elevation and interactive states.

- **Default Shadow:** `0 1px 4px oklch(0 0 0 / 0.06)`. Used for cards and secondary surfaces.
- **Hover Shadow:** `0 6px 20px oklch(var(--primary) / 0.12), 0 1px 4px oklch(0 0 0 / 0.08)`. Used to indicate interactive lift on hover.

## Components

### Buttons
Buttons use the `primary`, `secondary`, and `accent` color variants.
- **Default:** Primary orange with white text.
- **Outline:** Transparent with border.
- **Ghost:** Hover-only background for subtle actions.

### Course Cards
Course cards (`card-workbook`) feature a `3px` transparent left border that transitions to the `primary` color on hover, accompanied by a subtle lift effect (`translateY(-2px)`) and a deep shadow.

### Section Labels
Labels use `font-mono-num` with uppercase text and wide letter spacing (`0.12em`). They are typically rendered as pills with a light primary background.

## Dark Mode
The system includes a dark mode with adjusted OKLCH values to maintain perceptual consistency while reducing glare in low-light environments.

## Print Support
The design system includes a robust print stylesheet that:
- Hides non-essential UI (navigation, sidebars, buttons).
- Adjusts typography to point-based sizes (11pt body).
- Prevents page breaks inside content sections.
- Appends URLs to links for reference.