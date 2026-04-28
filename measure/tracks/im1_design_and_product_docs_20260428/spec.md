# Spec: IM1 DESIGN.md and product.md

## Overview

IM1 (Integrated Math 1) is missing both `DESIGN.md` and `product.md` files. IM2 and PreCalc both have both files. This track creates parity by authoring appropriate documentation for IM1 based on the established patterns.

## Functional Requirements

1. Create `apps/integrated-math-1/DESIGN.md` following IM2's design system structure
2. Create `apps/integrated-math-1/product.md` following IM2's product definition structure
3. Ensure design tokens use IM2's "warm academic orange" theme (per scaffold specification)

## Design System (DESIGN.md)

Following IM2's structure:
- Version header
- Color palette using OKLCH (primary: IM2 orange #B14C00)
- Typography scale (Lora for display, DM Sans for body, Fira Code for mono)
- Spacing system (4px grid)
- Rounded corners scale
- Elevation/shadows
- Component patterns
- Dark mode support
- Print support

## Product Definition (product.md)

Following IM2's structure:
- Overview (IM1 target audience and purpose)
- Target Users (students, teachers, admins)
- Core Features (10 features aligned to IM3/IM2)
- Curriculum Structure (14 modules, ~99 lessons from IM1.md)
- Instructional Model
- Non-Goals

## Acceptance Criteria

- [ ] `apps/integrated-math-1/DESIGN.md` exists and is valid
- [ ] `apps/integrated-math-1/product.md` exists and is valid
- [ ] Both files follow their respective IM2 templates